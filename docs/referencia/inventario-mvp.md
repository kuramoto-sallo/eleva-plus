# Inventário do MVP (Lovable)

Referência visual e funcional para o site novo. Levantado em 26/11/2026 a partir do site publicado
(`eleve-plus-entry-hub.lovable.app`), só com leitura: nenhuma inscrição enviada, nenhuma conta criada.
Achados de segurança e UX vêm da revisão do MVP feita no mesmo dia.

Legenda da última coluna: **manter** = igual ao MVP; **mudar** = corrigir no site novo; **a definir** = depende do RH,
do jurídico ou da pessoa responsável.

> Nome oficial: **ELEVE+** (confirmado em 26/11/2026). O repositório continua `eleva-plus`.

## Rotas

| Rota           | O que é                                                                | Site novo                                   |
| -------------- | ---------------------------------------------------------------------- | ------------------------------------------- |
| `/`            | Página única com 7 seções numeradas e o formulário no fim              | manter                                      |
| `/privacidade` | Política de Privacidade (Markdown aparecendo cru)                      | mudar: renderizar e reescrever com jurídico |
| `/admin`       | Login do RH: Google, e-mail/senha e **"Primeiro acesso? Criar conta"** | mudar: só por convite, sem cadastro público |

Âncoras do menu: `#topo`, `#programa`, `#sallo`, `#beneficios`, `#trilha`, `#processo`, `#inscricao`.

## Seções da página inicial

| #   | Âncora        | Título                                          | Conteúdo                                                                                                                                                                                                                                                               | Site novo                                     |
| --- | ------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| —   | `#topo`       | "ELEVE+ — Chegou a hora de decolar!"            | Vídeo de fundo em autoplay sem controles; texto de chamada; botão "Quero fazer parte"                                                                                                                                                                                  | mudar: vídeo com botão de pausar (WCAG 2.2.2) |
| 01  | `#programa`   | Sobre o ELEVE+ — "Seu futuro começa aqui."      | 3 parágrafos sobre o programa                                                                                                                                                                                                                                          | manter                                        |
| 02  | `#sallo`      | Sobre a Sallo — "Uma história de evolução…"     | 30+ anos, maior confecção do Centro-Oeste, 5 mil pontos de venda, 30 mil m², 1.000 diretos e 3.000 indiretos; marcas (Grupo Sallo, Sallo Jeans, Sallo Junior, Balada Jeans, Sallo Têxtil, Somos Sallo); Projeto Heliponto                                              | manter (RH confirma os números)               |
| 03  | —             | Requisitos — "O que você precisa para decolar?" | 5 cartões: Escolaridade e cursos, Semestres elegíveis, Disponibilidade de horário, Localidade, Diferenciais. **Todos "Em definição pelo RH."**                                                                                                                         | a definir: RH preenche antes de publicar      |
| 04  | `#beneficios` | Benefícios                                      | Carrossel "arraste para ver mais": bolsa compatível com o mercado, plano de saúde, plano odontológico, refeição na empresa, vale-transporte ou combustível, day off de aniversário, desconto em produtos, mentoria mensal com diretores, job rotation, curso de inglês | manter (RH confirma)                          |
| 05  | `#trilha`     | Trilha de desenvolvimento                       | Carrossel de 5 etapas: Integração, Aprendizado, Desenvolvimento, Conexão, Evolução                                                                                                                                                                                     | manter                                        |
| 06  | `#processo`   | Processo seletivo — "Seu caminho até o ELEVE+." | 5 passos: Inscrição, Triagem, Avaliação, Entrevista, Início da jornada ("sujeitas a ajustes"); botão "Inscreva-se agora"                                                                                                                                               | manter                                        |
| 07  | `#inscricao`  | Inscreva-se — "Pronto para decolar?"            | Formulário (abaixo)                                                                                                                                                                                                                                                    | mudar (abaixo)                                |
| —   | rodapé        | Contato                                         | `rh@sallo.com.br`, (62) 3240-1700; selo "Edit with Lovable"                                                                                                                                                                                                            | manter contato; sem selo                      |

## Formulário de inscrição

Hoje é uma página só, com três blocos. Nenhum campo é marcado como obrigatório (nem `required`, nem asterisco).

| Bloco                      | Campo (nome no MVP)                                                                    | Tipo no MVP                                                                                 | Observação / mudança no site novo                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dados pessoais             | Nome completo (`full_name`)                                                            | texto                                                                                       | obrigatório                                                                                                      |
|                            | E-mail (`email`)                                                                       | e-mail                                                                                      | obrigatório                                                                                                      |
|                            | Telefone/WhatsApp com DDD (`phone`)                                                    | tel, placeholder `(62) 99999-9999`                                                          | mudar: aceitar `(62) 9 9999-9999` e `+55 …` (já em `lib/validation/phone.ts`)                                    |
|                            | Cidade (`city`)                                                                        | texto                                                                                       | obrigatório                                                                                                      |
|                            | Estado (UF) (`state`)                                                                  | texto, 2 caracteres, placeholder `GO`                                                       | mudar: select com as 27 UFs                                                                                      |
| Formação acadêmica         | Instituição de ensino (`institution`)                                                  | texto                                                                                       |                                                                                                                  |
|                            | Curso (`course`)                                                                       | texto                                                                                       |                                                                                                                  |
|                            | Semestre/período atual (`semester`)                                                    | texto, "Ex.: 5º semestre"                                                                   | a definir: select com os semestres elegíveis                                                                     |
|                            | Previsão de conclusão (`graduation`)                                                   | `input type=month`                                                                          | mudar: dois selects (mês e ano); `month` vira texto livre no Safari e Firefox                                    |
| Informações complementares | Área de interesse (`interest_area`)                                                    | select: Administrativo, Comercial, Marketing, Produção, Recursos Humanos, Tecnologia, Outra | a definir: RH confirma a lista                                                                                   |
|                            | Disponibilidade de horário (`availability`)                                            | select: Manhã, Tarde, Integral, Flexível                                                    | a definir: RH confirma                                                                                           |
|                            | LinkedIn (opcional) (`linkedin`)                                                       | URL, `https://linkedin.com/in/...`                                                          |                                                                                                                  |
|                            | Currículo em PDF (opcional)                                                            | arquivo PDF, até 10 MB                                                                      | mudar: checar tipo real e tamanho no servidor                                                                    |
| "Queremos conhecer você!"  | Vídeo de até 1 minuto: _"Qual peça de roupa conta uma história sobre você e por quê?"_ | escolha entre **Enviar vídeo** (MP4, MOV ou WebM, até 200 MB) ou **Link do YouTube**        | a definir: limite menor (plano sugere 1 min e 720p) para caber no armazenamento; upload com progresso e retomada |
| Consentimento              | Caixa de aceite da Política de Privacidade                                             | checkbox                                                                                    | mudar: texto sem Markdown cru, link no componente, registro com data, hora e versão; alvo de toque maior         |
| Anti-robô                  | Honeypot (`website`) e tempo de preenchimento (`startedAt`)                            | oculto                                                                                      | manter, mais Cloudflare Turnstile e limite por IP/e-mail                                                         |
| Envio                      | Botão "Enviar minha inscrição"                                                         |                                                                                             | mudar: formulário em etapas, erros com `aria-invalid`/`aria-describedby` e resumo com `role="alert"`             |

## Área do RH (`/admin`)

Visto só a tela de login (não há conta de teste). Pela revisão do MVP, a área tem:

- lista de inscrições com status e histórico (`applications`, `application_status_history`);
- papéis `admin` e `rh` (`user_roles`);
- vídeo e currículo por link assinado de 1 hora;
- exportação `inscricoes-eleve.csv` (sem proteção contra fórmulas: **mudar**, já em `lib/security/csv.ts`);
- exclusão individual e "Excluir arquivadas fora do prazo" (apaga arquivos antes de checar permissão: **mudar**);
- campo de meses de retenção; edição do conteúdo do site (`site_content`, com versão `published`) e upload em
  `site-assets`.

No site novo: login só por convite, lista com busca e filtros, status definidos pelo RH, exportação e exclusão no
servidor, registro de quem viu, exportou ou excluiu, e rotina automática de retenção. Edição de conteúdo pelo painel
fica **a definir** (escopo fechado na paridade com o MVP).

## Visual (design tokens)

Já aplicados em `app/globals.css`.

| Token                            | Valor                                 | Uso                                  |
| -------------------------------- | ------------------------------------- | ------------------------------------ |
| `--navy` (primária)              | `oklch(24% 0.065 275)`                | botões principais, texto de destaque |
| `--orange` (marca)               | `oklch(62% 0.16 45)`                  | CTAs, rótulos de seção, foco         |
| `--ink`                          | `oklch(17% 0.05 275)`                 | fundo escuro do topo e destaques     |
| `--gradient-ink`                 | radial navy → ink                     | fundo do topo                        |
| `--background`                   | `oklch(98.5% 0.004 270)`              | fundo claro                          |
| `--foreground`                   | `oklch(20% 0.05 275)`                 | texto                                |
| `--radius`                       | `0.75rem`                             | cantos                               |
| `--shadow-card`, `--shadow-glow` | sombras suaves; brilho laranja no CTA |                                      |

Tipografia (Google Fonts): **Michroma** nos títulos de seção (30 px no desktop) e **Sora** (300 a 700) no texto.
Rótulos de seção em caixa alta com número (`01`, `02`…). No celular (375 px) não há rolagem lateral e os campos têm
48 px de altura com fonte de 16 px.

## Pendências de captura

Capturas de tela das seções e do formulário (desktop e celular) ainda não estão nesta pasta. Entram junto com a
Fase 3, quando o Playwright puder fotografar a referência e o site novo lado a lado.
