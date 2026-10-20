import { describe, it, expect } from 'vitest';
import { sameAnswer, speechScore } from '../src/engine/check';
import { letter, stars, toPoints } from '../src/engine/grade';
import { streak, levelOf, studentStatus } from '../src/engine/game';
import { personalize } from '../src/engine/personalize';

describe('correção', () => {
  it('ignora maiúsculas, pontuação e contrações', () => {
    expect(sameAnswer('my name is ana', 'My name is Ana.')).toBe(true);
    expect(sameAnswer('I am fine thanks', "I'm fine, thanks!")).toBe(true);
    expect(sameAnswer('what is your name', "What's your name?")).toBe(true);
    expect(sameAnswer('My name are Ana', 'My name is Ana.')).toBe(false);
  });
  it('aceita respostas alternativas', () => {
    expect(sameAnswer("I'm fine, thank you!", "I'm fine, thanks!", ["I'm fine, thank you!"])).toBe(true);
  });
  it('nota de fala por palavras reconhecidas', () => {
    expect(speechScore('good morning', 'Good morning!')).toBe(1);
    expect(speechScore('good', 'Good morning!')).toBe(0.5);
  });
});

describe('notas (A a partir de 80)', () => {
  it('converte pontos em letra', () => {
    expect(letter(80)).toBe('A');
    expect(letter(79)).toBe('B');
    expect(letter(65)).toBe('B');
    expect(letter(50)).toBe('C');
    expect(letter(49)).toBe('D');
  });
  it('a Camila pode mudar a escala', () => {
    expect(letter(85, { A: 90, B: 75, C: 60 })).toBe('B');
  });
  it('pontos e estrelas', () => {
    expect(toPoints(8, 10)).toBe(80);
    expect(stars(0.95)).toBe(3);
    expect(stars(0.7)).toBe(2);
    expect(stars(0.3)).toBe(1);
  });
});

describe('gamificação', () => {
  it('sequência de dias', () => {
    expect(streak(['2026-10-18', '2026-10-19', '2026-10-20'], '2026-10-20')).toBe(3);
    expect(streak(['2026-10-18', '2026-10-19'], '2026-10-20')).toBe(2); // ainda pode estudar hoje
    expect(streak(['2026-10-15'], '2026-10-20')).toBe(0);
  });
  it('nível por XP', () => {
    expect(levelOf(0).name).toBe('Beginner');
    expect(levelOf(320).name).toBe('Reader');
  });
  it('status para a professora', () => {
    expect(studentStatus('2026-10-19', [0.9, 0.8], '2026-10-20').s).toBe('ok');
    expect(studentStatus('2026-10-01', [0.9], '2026-10-20').s).toBe('away');
    expect(studentStatus('2026-10-19', [0.5, 0.6, 0.4], '2026-10-20').s).toBe('help');
  });
});

describe('personalização', () => {
  it('usa nome e idade da aluna', () => {
    expect(personalize('My name is {name}. I am {age} years old.', { name: 'Anne', age: 9 })).toBe('My name is Anne. I am nine years old.');
    expect(personalize('{spelled}', { name: 'Anne', age: 9 })).toBe('A - N - N - E');
  });
});

import { passwordOk } from '../src/engine/game';
describe('senha do aluno', () => {
  it('por padrão é o nome, sem ligar para maiúscula e acento', () => {
    expect(passwordOk({ name: 'Anne' }, 'anne')).toBe(true);
    expect(passwordOk({ name: 'Júlia' }, 'JULIA ')).toBe(true);
    expect(passwordOk({ name: 'Anne' }, 'ana')).toBe(false);
    expect(passwordOk({ name: 'Anne' }, '')).toBe(false);
  });
  it('se a professora criou outra senha, vale a nova', () => {
    expect(passwordOk({ name: 'Anne', pin: '1234' }, '1234')).toBe(true);
    expect(passwordOk({ name: 'Anne', pin: '1234' }, 'anne')).toBe(false);
  });
});
