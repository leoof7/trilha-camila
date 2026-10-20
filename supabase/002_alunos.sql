-- Trilha da Camila · v5: login do aluno no celular dele + código da turma.
-- O aluno NÃO tem conta nem e-mail. Ele entra com: código da turma + nome + senha (padrão: o nome).
-- O banco devolve só os dados dele e só aceita gravar o que é dele.

alter table public.trilha_escola add column if not exists code text;
create unique index if not exists trilha_escola_code_idx on public.trilha_escola (upper(code));

-- tira acento, maiúscula e espaço duplo (Júlia = julia)
create or replace function public.trilha_fold(t text) returns text
language sql immutable set search_path = public as $$
  select lower(regexp_replace(trim(translate(coalesce(t, ''),
    'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
    'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')), '\s+', ' ', 'g'))
$$;

-- confere código + nome + senha; devolve a escola e o id do aluno
create or replace function public.trilha_aluno(p_code text, p_nome text, p_senha text, out o_owner uuid, out o_sid text, out o_data jsonb)
language plpgsql security definer set search_path = public as $$
declare
  r record;
  s jsonb;
begin
  select owner, data into r from trilha_escola where upper(code) = upper(trim(coalesce(p_code, '')));
  if not found then raise exception 'codigo'; end if;
  for s in select value from jsonb_array_elements(coalesce(r.data->'students', '[]'::jsonb)) loop
    if not coalesce((s->>'archived')::boolean, false) and trilha_fold(s->>'name') = trilha_fold(p_nome) then
      if trilha_fold(p_senha) <> '' and trilha_fold(p_senha) = trilha_fold(coalesce(nullif(trim(s->>'pin'), ''), s->>'name')) then
        o_owner := r.owner; o_sid := s->>'id'; o_data := r.data;
        return;
      end if;
      raise exception 'senha';
    end if;
  end loop;
  raise exception 'aluno';
end $$;

-- itens de uma lista que são deste aluno
create or replace function public.trilha_mine(arr jsonb, sid text) returns jsonb
language sql immutable set search_path = public as $$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements(coalesce(arr, '[]'::jsonb)) x where x->>'studentId' = sid
$$;

-- o que o aluno vê: só o dele (sem telefone dos pais, sem dados dos colegas)
create or replace function public.aluno_dados(p_code text, p_nome text, p_senha text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  a record;
  d jsonb;
  sid text;
begin
  select * into a from trilha_aluno(p_code, p_nome, p_senha);
  d := a.o_data; sid := a.o_sid;
  return jsonb_build_object(
    'version', 1,
    'settings', jsonb_build_object('teacherName', d->'settings'->'teacherName', 'teacherPhoto', d->'settings'->'teacherPhoto', 'scale', d->'settings'->'scale',
                                   'schoolYear', d->'settings'->'schoolYear', 'setupDone', true, 'pin', '', 'pinOptional', true),
    'students', (select coalesce(jsonb_agg(x - 'pin' - 'guardians' - 'guardian'), '[]'::jsonb) from jsonb_array_elements(d->'students') x where x->>'id' = sid),
    'results', trilha_mine(d->'results', sid),
    'grades', trilha_mine(d->'grades', sid),
    'goals', trilha_mine(d->'goals', sid),
    'stickers', trilha_mine(d->'stickers', sid),
    'feedback', trilha_mine(d->'feedback', sid),
    'homework', trilha_mine(d->'homework', sid),
    'classes', (select coalesce(jsonb_agg(
                  case when c->'attendance'->>sid = 'P'
                       then c || jsonb_build_object('attendance', jsonb_build_object(sid, 'P'))
                       else jsonb_build_object('id', c->'id', 'date', c->'date', 'start', c->'start', 'modality', c->'modality', 'status', c->'status',
                                               'attendance', jsonb_build_object(sid, c->'attendance'->>sid), 'lessons', '[]'::jsonb, 'notes', '', 'nextGoal', '')
                  end), '[]'::jsonb)
                from jsonb_array_elements(coalesce(d->'classes', '[]'::jsonb)) c where c->'attendance' ? sid),
    'keys', coalesce(d->'keys', '{}'::jsonb),
    'studyDays', jsonb_build_object(sid, coalesce(d->'studyDays'->sid, '[]'::jsonb)),
    'drafts', (select coalesce(jsonb_object_agg(key, value), '{}'::jsonb) from jsonb_each(coalesce(d->'drafts', '{}'::jsonb)) where left(key, length(sid) + 1) = sid || ':'),
    'removed', (select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements(coalesce(d->'removed', '[]'::jsonb)) x where left(x #>> '{}', length(sid) + 7) = 'draft:' || sid || ':')
  );
end $$;

-- o que o aluno grava: lições feitas, figurinhas, dias de estudo e lição pela metade — só as dele
create or replace function public.aluno_salvar(p_code text, p_nome text, p_senha text, p_data jsonb) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  a record;
  d jsonb;
  sid text;
  k text;
  it jsonb;
  tombs jsonb;
begin
  select * into a from trilha_aluno(p_code, p_nome, p_senha);
  sid := a.o_sid;
  select data into d from trilha_escola where owner = a.o_owner for update;
  foreach k in array array['results', 'stickers', 'grades'] loop
    for it in select value from jsonb_array_elements(coalesce(p_data->k, '[]'::jsonb)) loop
      if it->>'studentId' = sid and it ? 'id'
         and not exists (select 1 from jsonb_array_elements(coalesce(d->k, '[]'::jsonb)) e where e->>'id' = it->>'id') then
        d := jsonb_set(d, array[k], coalesce(d->k, '[]'::jsonb) || jsonb_build_array(it), true);
      end if;
    end loop;
  end loop;
  d := jsonb_set(d, '{studyDays}', coalesce(d->'studyDays', '{}'::jsonb) || jsonb_build_object(sid,
         (select coalesce(jsonb_agg(distinct x), '[]'::jsonb) from jsonb_array_elements(coalesce(d->'studyDays'->sid, '[]'::jsonb) || coalesce(p_data->'studyDays'->sid, '[]'::jsonb)) x)), true);
  tombs := (select coalesce(jsonb_agg(x), '[]'::jsonb) from jsonb_array_elements(coalesce(p_data->'removed', '[]'::jsonb)) x
            where left(x #>> '{}', length(sid) + 7) = 'draft:' || sid || ':' and not coalesce(d->'removed', '[]'::jsonb) @> jsonb_build_array(x));
  d := jsonb_set(d, '{removed}', coalesce(d->'removed', '[]'::jsonb) || tombs, true);
  d := jsonb_set(d, '{drafts}', (
         select coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
         from jsonb_each(coalesce(d->'drafts', '{}'::jsonb) || coalesce((select jsonb_object_agg(key, value) from jsonb_each(coalesce(p_data->'drafts', '{}'::jsonb)) where left(key, length(sid) + 1) = sid || ':'), '{}'::jsonb))
         where not d->'removed' @> jsonb_build_array('draft:' || key || ':' || (value->>'at'))), true);
  update trilha_escola set data = d, updated_at = now() where owner = a.o_owner;
  return now();
end $$;

revoke all on function public.trilha_aluno(text, text, text) from public, anon, authenticated;
grant execute on function public.aluno_dados(text, text, text) to anon, authenticated;
grant execute on function public.aluno_salvar(text, text, text, jsonb) to anon, authenticated;
