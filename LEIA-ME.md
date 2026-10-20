# Trilha da Camila — como usar

## Para abrir o app
Dê dois cliques em **ABRIR O APP.html** (abre no Chrome ou no Edge). A pasta **apostila** precisa ficar do lado dele (são as páginas da apostila que aparecem dentro do app).
Não precisa de internet nem de instalar nada.

> Dica: use sempre o **mesmo navegador** e não mude o arquivo de lugar. Os dados ficam guardados
> no navegador para esse arquivo.

## Primeiro acesso
1. A Camila cria a senha de 4 números.
2. Cadastra a Anne: nome, idade, foto (opcional) e cor do app (rosa).
3. Pronto. A tela inicial mostra "Quem vai estudar hoje?".

## Na aula
- Camila entra com a senha → **Início** → **▶ Abrir aula com Anne**.
  Nesse modo, quando aparecer exercício de falar, a Camila toca em **👍 Falou bem!**.
- Depois da aula: **+ Registrar aula de hoje** → presença, páginas da apostila trabalhadas,
  observação e próximo objetivo.
- Na ficha da aluna dá para lançar nota, dar figurinha (Phrase Hunter) e as estrelas do Teacher's feedback.

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
