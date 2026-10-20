# Trilha da Camila — como usar

## Para abrir o app
Dê dois cliques em **ABRIR O APP.html** (abre no Chrome ou no Edge). A pasta **apostila** precisa ficar do lado dele (são as páginas da apostila que aparecem dentro do app).
Não precisa de internet nem de instalar nada.

> Dica: use sempre o **mesmo navegador** e não mude o arquivo de lugar. Os dados ficam guardados
> no navegador para esse arquivo.

## Primeiro acesso
1. A Camila escreve o nome dela (senha da área da professora é opcional).
2. Cadastra a Anne: nome, idade, foto (opcional), cor do app (rosa) e a família (mãe, pai, WhatsApp).
3. Pronto. A tela inicial pergunta **"Quem está entrando?"** → Sou a professora / Sou aluno(a).
   A senha da aluna é o **próprio nome** (Anne). Dá para trocar na ficha → Dados.

## Na aula
- **Hoje → ▶ Iniciar aula**: o app salva dia, hora e presença, e já sugere o plano da aula.
- **▶ Trilha de Anne** abre tudo liberado. Exercício de falar: a Camila toca em **👍 Falou bem!**.
- **🏠 Meu menu** volta para a área da professora sem parar a aula.
- **■ Finalizar aula**: descrição + próximo objetivo. Em seguida sai o **card do dia para os pais** (enviar no WhatsApp).
- **Provas → + Criar prova**: monta a prova da apostila, aplica no app ou imprime a folha para os pais.

## Toda semana
**Configurações → Baixar backup** e guarde o arquivo nesta pasta (Camila).
Se trocar de computador ou limpar o navegador: **Restaurar backup**.

## Antes de usar com a Anne
Abra **Gabarito** e confira as respostas sugeridas dos exercícios "Translate!".
A apostila não imprime essas respostas; o app precisa delas para corrigir.

## Arquivos desta pasta
| Arquivo / pasta | Para que serve | O que você faz |
|---|---|---|
| `ABRIR O APP.html` | O app inteiro, pronto | Dois cliques para usar |
| `LEIA-ME.md` | Este guia | Ler uma vez |
| `SPEC.md` | O que o app faz e as regras (o "contrato") | Mudar aqui antes de pedir mudanças |
| `CLAUDE.md` / `AGENTS.md` | Regras para a IA que for mexer no código | Nada; a IA lê sozinha |
| `codigo/` | Código-fonte | Só abrir no Claude Code/Codex para evoluir o app |

## Para evoluir o app com IA
Abra a pasta `codigo` no Claude Code e peça, por exemplo:
"Leia SPEC.md e CLAUDE.md. Quero [mudança]. Atualize a SPEC, faça, e rode npm run check."
Depois rode `npm run build` e copie `codigo/dist/index.html` para `ABRIR O APP.html`.
