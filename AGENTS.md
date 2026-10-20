# Regras do projeto para agentes de código (Claude Code, Codex)

Leia **SPEC.md** antes de qualquer tarefa. Se a tarefa não está na SPEC, pare e pergunte ao Leandro.
O Leandro é PO e não programa: explique o que mudou em linguagem de negócio.

## Stack (não trocar)
Vite + React 18 + TypeScript. Um arquivo só no final (`dist/index.html`, abre com dois cliques).
Dados: IndexedDB pelo `src/store/db.ts` — o ÚNICO arquivo que sabe onde os dados moram.
Testes: Vitest (`tests/`) + robô Playwright (`tests/e2e/jogar-tudo.mjs`).

## Mapa
```
src/content/      conteúdo da apostila (units-a/b/c.ts, index.ts). Único lugar com texto de exercício.
src/engine/       regras puras: correção, notas, XP, sequência, montagem de lição. Sem React.
src/store/        tipos e persistência.
src/ui/kid/       app da criança (trilha, player, exercícios).
src/ui/teacher/   área da professora.
tests/            testes de conteúdo e de regras.
```

## Fluxo (spec driven)
1. Mudança de regra → atualizar SPEC.md primeiro.
2. Escrever/ajustar o teste que prova a regra.
3. Implementar.
4. Rodar `npm run check` (tipos + testes + build). Para mexeu em tela: `node tests/e2e/jogar-tudo.mjs`.
5. Só está pronto se tudo passar.

## Proibido
- Inventar conteúdo fora da apostila. Resposta não impressa = `s: 1` (vai para a tela Gabarito).
- Escrever texto de exercício dentro de componente React.
- Mudar as cores das units (são as da apostila).
- Guardar áudio, sobrenome, e-mail ou localização de criança.
- Instalar biblioteca nova sem justificar no resumo.
- Mexer em `src/store/db.ts` sem migrar os dados antigos (a Camila já tem dados salvos).

## Tom com a criança
Português do Brasil, frases curtas, sempre encorajador. Nunca "Errado": use "Quase!".
