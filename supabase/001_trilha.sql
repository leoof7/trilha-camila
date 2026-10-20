-- Trilha da Camila · banco (projeto Supabase da conta lesetesistemas+camila)
-- Cada professora tem UMA linha com todos os dados da escola dela (alunos, notas, aulas...).
-- Ninguém lê nem altera a linha de outra pessoa (RLS).
create table if not exists public.trilha_escola (
  owner uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.trilha_escola enable row level security;
drop policy if exists "professora le a propria escola" on public.trilha_escola;
drop policy if exists "professora cria a propria escola" on public.trilha_escola;
drop policy if exists "professora altera a propria escola" on public.trilha_escola;
create policy "professora le a propria escola" on public.trilha_escola for select to authenticated using (auth.uid() = owner);
create policy "professora cria a propria escola" on public.trilha_escola for insert to authenticated with check (auth.uid() = owner);
create policy "professora altera a propria escola" on public.trilha_escola for update to authenticated using (auth.uid() = owner) with check (auth.uid() = owner);
