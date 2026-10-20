// Testa as regras do banco (supabase/*.sql) num Postgres de verdade rodando na memória.
import { describe, it, expect, beforeAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

const sql = (f: string) => readFileSync(new URL(`../supabase/${f}`, import.meta.url), 'utf8');
const OWNER = '11111111-1111-1111-1111-111111111111';
let db: PGlite;

const escola = {
  version: 1,
  settings: { teacherName: 'Camila', pin: '1234', scale: { A: 80, B: 65, C: 50 }, schoolYear: 2026, setupDone: true, schoolCode: 'ABC234' },
  students: [
    { id: 'anne', name: 'Anne', gender: 'f', age: 9, currentUnit: 1, createdAt: '', guardians: [{ role: 'mae', name: 'Giovane', phone: '31 90000' }] },
    { id: 'joao', name: 'João', gender: 'm', age: 10, currentUnit: 1, createdAt: '', pin: 'leao' },
  ],
  results: [{ id: 'r1', studentId: 'joao', lessonId: 'u1-vocab' }],
  grades: [{ id: 'g1', studentId: 'joao', points: 90 }],
  classes: [
    { id: 'c1', date: '2026-10-20', attendance: { anne: 'P', joao: 'F' }, notes: 'Leram a história', nextGoal: 'Homework', lessons: ['u1-vocab'] },
  ],
  goals: [], stickers: [], feedback: [], keys: {}, studyDays: { joao: ['2026-10-19'] },
  drafts: { 'joao:u1-read': { at: 'T', idx: 2 } },
};

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql as $$ select '${OWNER}'::uuid $$;
    create role anon; create role authenticated;
    insert into auth.users values ('${OWNER}');
  `);
  await db.exec(sql('001_trilha.sql'));
  await db.exec(sql('002_alunos.sql'));
  await db.query(`insert into public.trilha_escola (owner, data, code) values ($1, $2, 'ABC234')`, [OWNER, escola]);
});

const dados = async (code: string, nome: string, senha: string) => (await db.query<{ d: any }>(`select public.aluno_dados($1,$2,$3) as d`, [code, nome, senha])).rows[0].d;
const erro = async (p: Promise<unknown>) => { try { await p; return ''; } catch (e) { return String((e as Error).message); } };

describe('login do aluno no banco', () => {
  it('entra com código + nome + senha padrão (o nome), sem ligar para maiúscula e acento', async () => {
    const d = await dados('abc234', 'anne', 'ANNE');
    expect(d.students.map((s: any) => s.id)).toEqual(['anne']);
  });
  it('senha trocada pela professora vale no lugar do nome', async () => {
    expect((await dados('ABC234', 'joao', 'Leão')).students[0].id).toBe('joao');
    expect(await erro(dados('ABC234', 'João', 'joão'))).toContain('senha');
  });
  it('código ou nome errado não entra', async () => {
    expect(await erro(dados('ZZZ999', 'Anne', 'anne'))).toContain('codigo');
    expect(await erro(dados('ABC234', 'Maria', 'maria'))).toContain('aluno');
  });
  it('o aluno só vê o que é dele: sem colegas, sem telefone dos pais, sem senha', async () => {
    const d = await dados('ABC234', 'Anne', 'anne');
    const txt = JSON.stringify(d);
    expect(txt).not.toContain('joao');
    expect(txt).not.toContain('31 90000');
    expect(txt).not.toContain('1234');
    expect(d.classes[0].notes).toBe('Leram a história');
  });
  it('quem faltou vê a aula sem a descrição', async () => {
    const d = await dados('ABC234', 'João', 'leao');
    expect(d.classes[0].attendance).toEqual({ joao: 'F' });
    expect(d.classes[0].notes).toBe('');
    expect(d.drafts['joao:u1-read']).toBeTruthy();
  });
  it('o aluno grava só o que é dele, e não apaga o que já existe', async () => {
    await db.query(`select public.aluno_salvar($1,$2,$3,$4)`, ['ABC234', 'Anne', 'anne', {
      results: [{ id: 'r2', studentId: 'anne', lessonId: 'u1-read' }, { id: 'hack', studentId: 'joao', lessonId: 'x' }],
      stickers: [{ id: 'st1', studentId: 'anne', sticker: 'star' }],
      grades: [], studyDays: { anne: ['2026-10-20'], joao: ['2099-01-01'] },
      drafts: { 'anne:u1-games': { at: 'T2', idx: 1 }, 'joao:u1-read': { at: 'X', idx: 0 } }, removed: [],
    }]);
    const row = (await db.query<{ data: any }>(`select data from public.trilha_escola`)).rows[0].data;
    expect(row.results.map((r: any) => r.id).sort()).toEqual(['r1', 'r2']);
    expect(row.stickers.length).toBe(1);
    expect(row.studyDays).toEqual({ joao: ['2026-10-19'], anne: ['2026-10-20'] });
    expect(row.drafts['joao:u1-read'].at).toBe('T');
    expect(row.drafts['anne:u1-games'].at).toBe('T2');
    expect(row.settings.pin).toBe('1234');
  });
  it('lição terminada no celular do aluno some da lista de "continuar"', async () => {
    await db.query(`select public.aluno_salvar($1,$2,$3,$4)`, ['ABC234', 'Anne', 'anne', { results: [], stickers: [], grades: [], studyDays: {}, drafts: {}, removed: ['draft:anne:u1-games:T2'] }]);
    const row = (await db.query<{ data: any }>(`select data from public.trilha_escola`)).rows[0].data;
    expect(row.drafts['anne:u1-games']).toBeUndefined();
    expect(row.drafts['joao:u1-read']).toBeTruthy();
  });
});
