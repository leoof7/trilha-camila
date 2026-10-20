# SPEC — Trilha da Camila (v2)

> Documento-fonte do produto. Toda mudança nasce aqui antes de virar código.
> Se o código e esta spec discordarem, a spec vence ou é atualizada primeiro.

## 1. O que é
App de inglês estilo Duolingo para crianças de 8 a 13 anos, feito **só com o conteúdo da
"Apostila 1 · My First English Adventure!" da Professora Camila**. Curso com aulas
majoritariamente presenciais; pode ter aula online.

- Professora: **Camila**. Primeira aluna: **Anne**.
- Fase 1 (atual): roda **no aparelho da Camila**, sem internet e sem servidor. Dados ficam no navegador
  e a Camila faz backup em arquivo.
- Fase 2: online (Supabase + Vercel), para a criança fazer o "para casa" no celular dos pais.

## 2. Regra de ouro do conteúdo
1. Nenhuma palavra, frase ou fato fora da apostila. O app só reorganiza o que está impresso.
2. Todo exercício aponta para a página da apostila (`p. 3 · Ex. 2` ou `Translate! — Unit 1`).
3. Onde a apostila não imprime resposta (Translate!, alguns Homework), a resposta é marcada
   `s: 1` ("gabarito sugerido") e aparece na tela **Gabarito** para a Camila aprovar ou corrigir.
4. O nome e a idade da aluna entram **só** onde a apostila pede informação da própria criança
   ("My name is…", "I am ___ years old", "Spell your name", "Hello, I'm ___!").
5. Cores das units = cores da apostila. Nunca mudam.
6. Jogos de roda e desenho da apostila viram o cartão **"Na sala com a Camila"** no fim da lição.

## 3. Perfis (mesmo aparelho, estilo Netflix)
- Tela inicial: "Quem vai estudar hoje?" com a foto de cada aluno + cartão da professora.
- Professora entra com **senha de 4 números** (PIN).
- Aluno: nome, idade, foto (opcional, reduzida para 320 px, fica só no aparelho), cor do app
  (**rosa = menina, azul = menino**, só na moldura do app), responsável (opcional), unit liberada.
- Criança não tem celular: quem abre o perfil é a Camila.

## 4. Módulos e páginas
Cada unit da apostila vira uma trilha com nós, na ordem das páginas:

| Nó | Vem da página | Conteúdo |
|---|---|---|
| ★ Vocabulário | abertura da unit | pares, figura→palavra, ouvir, falar |
| 📖 Read Aloud | história da unit | história tocável (ouve frase a frase) + perguntas |
| ✏️ Let's Practice! | exercícios numerados | os exercícios da página, um a um |
| 🎮 Game Time! | página de jogos | unscramble, fill the dialogue, quick fire |
| 💬 Translate! | folha Translate! | montar frase PT→EN e EN→PT |
| 🏠 Homework | folha Homework | revisão + Tarefa em casa para os pais |
| 📝 Provinha | sorteio da unit | 10 questões, vale nota |

Mais: **Review 1** (depois da Unit 5), **Review 2** (depois da Unit 11), **Fun Zone**.

## 5. Tipos de interação (11)
`match` combinar pares · `pic` figura→palavra · `build` montar frase com peças · `fill` completar
(com áudio = listening) · `choice` escolher · `hear` ouvir e escolher · `speak` falar ·
`scramble` desembaralhar letras · `order` colocar em ordem · `sort` separar em grupos · `type` escrever.

**Fala:** o app fala a frase (voz do aparelho, botão 🐢 devagar). Se o navegador permitir microfone,
ele escuta e passa com 70% das palavras. **Na aula presencial a Camila avalia**: botão
"👍 Falou bem!". Sozinha e sem microfone: "Falei!" (autoavaliação). Fala não entra na provinha.

**Correção:** ignora maiúsculas, pontuação, acentos; aceita "I am" = "I'm", "favorite" = "favourite",
e respostas alternativas listadas em `alt`.

## 6. Gamificação (dinâmica de escola de curso, divertida)
- XP: 10 por acerto de primeira, 5 se acertou depois, +5 lição sem erro.
- 5 vidas por lição; erro volta no fim da lição; zerou = "Tentar de novo" (sem castigo).
- Sequência de dias 🔥; Missão do dia = 30 XP.
- Níveis: Beginner → Explorer → Reader → Speaker → Champion → **Superstar** (como a última página).
- Estrelas por lição (1–3), como o "Teacher's feedback ⭐" da apostila.
- Álbum de figurinhas: automáticas (primeira lição perfeita, história lida, homework, sequência 3 e 7)
  e dadas pela Camila na aula (**Phrase Hunter**, ideia da Unit 11).
- Unit seguinte abre quando a Camila libera **ou** quando a criança tira C ou mais na provinha.

## 7. Notas
- Pontos 0–100 **e** letra. Escala padrão (Camila pediu flexível): **A ≥ 80 · B ≥ 65 · C ≥ 50 · D < 50**.
  Editável em Configurações.
- Fontes de nota: provinha do app (automática), avaliação lançada pela Camila, homework.
- Criança vê: média com letra, cada nota, objetivos e o Teacher's feedback.

## 8. Área da professora
- **Início:** cada aluno com status (Em dia / Sem praticar há X dias / Precisa de reforço),
  progresso da unit, média, frequência, faltas, próximo objetivo, "Abrir aula com Anne".
- **Ficha do aluno:** Progresso (liberar unit) · Notas (lançar) · Frequência · Objetivos (com sugestões
  da apostila) · O que mais erra (com página) · Figurinhas e Teacher's feedback · Dados.
- **Diário de aula:** data, horário, presencial/online, presença (Presente/Falta/Justificada), lições e
  páginas trabalhadas, observações, próximo objetivo (vira objetivo no app da criança).
- **Calendário anual:** 12 meses; dias com aula, presença, online e nota lançada; filtro por aluno;
  totais do ano e boletim mês a mês.
- **Gabarito:** revisar respostas sugeridas.
- **Configurações:** nome, PIN, escala de notas, **backup/restaurar**.

## 9. Regras de status
- Precisa de reforço: média de acerto de primeira < 65% nas últimas 3 atividades.
- Sem praticar: 8 dias ou mais sem atividade (aula é semanal).
- Em dia: o resto.

## 10. Privacidade (criança — LGPD art. 14)
Só apelido, idade, foto opcional e nome do responsável. Tudo no aparelho. Áudio nunca gravado.
Na fase online: consentimento do responsável antes de ativar o aluno.

## 11. Critérios de aceite (verificados pelo robô de testes)
- DADO a Anne com 9 anos, QUANDO abre a Unit 1, ENTÃO aparece "My name is Anne." e "I am nine years old."
- DADO uma lição, QUANDO a criança erra, ENTÃO perde 1 vida e o exercício volta no fim.
- DADO 80 pontos, ENTÃO nota A; 79 → B; 49 → D.
- DADO provinha com C ou mais na Unit N, ENTÃO a Unit N+1 abre.
- DADO todas as lições da apostila, ENTÃO toda resposta montável está no banco de peças e toda opção certa está entre as opções.
- O robô joga as 11 units + provinhas do começo ao fim sem erro na tela.

## 12. Fase 2 (não fazer agora)
Supabase (trocar só `src/store/db.ts`), login do responsável, para casa no celular, aula online com
link, várias turmas, Apostila 2.

## 13. Versão 3 (19/10/2026, pedidos do Leandro)
- **Identidade LESETE MEDIA** (vertente infantil da Lesete): papel `#F7F6F3`, azul Lesete `#1F5AE2`, Outfit + Manrope, pílulas. Referência em `Desktop\LS\LESETE MEDIA`.
- **Mascote Salsicha** (dachshund): discreto, reage ao acerto (pula), ao erro (orelha murcha), ao ouvir (inclina a cabeça) e no fim (comemora).
- **Senha da professora opcional** (desligada por padrão). Primeiro acesso em 3 passos: professora → aluna → família (mãe, pai, outro; nome e WhatsApp).
- **Toda pergunta em inglês (grande) + português (pequeno)**, com teste automático que impede pergunta sem tradução.
- **Página da apostila antes dos exercícios:** cartões de vocabulário, história em balões com personagens (Leo, Maya, Teacher…), Tarefa para os pais, atividade de sala.
- **Apostila dentro do app:** aba "Apostila" (criança e professora) e botão "ver página" em todo exercício abre a página real.
- **Botão 💡 Ajuda:** mostra o vocabulário da apostila ligado ao exercício, frases-exemplo das histórias e a dica da professora. A apostila não traz explicação de gramática; a ajuda usa só o que ela ensina.
- **Vozes:** personagens com voz de homem, mulher, menino e menina; nos exercícios a voz alterna mulher/homem para treinar o ouvido.
- **Errou:** "Quase! Vamos de novo?" com **Tentar de novo** ou **Continuar** (o exercício volta no fim).
- **Acertou:** elogio variado e avanço automático em 3 segundos; botão para voltar ao exercício anterior.
- **Missão do dia:** 3 atividades.
- **Modo aula (professora):** tudo liberado, pula exercício, lição anterior/próxima.
- **Sair no meio:** o progresso fica salvo; ao voltar pergunta "Continuar de onde parei" ou "Começar do início".
- **Banco com login (Supabase, conta lesetesistemas+camila):** professora entra com e-mail e senha; os dados da escola ficam numa linha protegida por RLS (`supabase/001_trilha.sql`). Sem internet salva no aparelho e sobe depois. "Usar sem conta" continua existindo.
