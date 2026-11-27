# Campos do formulário, status e retenção

Decisões do RH de 26/11/2026. A fonte completa, com as justificativas, é a proposta
"ELEVE+ — Proposta de campos do formulário e status do processo" (Claude Doc do projeto). Este arquivo
resume o que o schema (`supabase/migrations/20261126200000_inscricoes.sql`) implementa.

## Campos

Todos obrigatórios, exceto LinkedIn. Base legal: procedimento preliminar a contrato (LGPD, art. 7º, V),
aprovada pelo jurídico em 26/11/2026.

| Etapa             | Campo                     | Coluna                                | Regra                                                                     |
| ----------------- | ------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| 1. Dados pessoais | Nome completo             | `full_name`                           | 3 a 120 caracteres                                                        |
|                   | E-mail                    | `email`                               | minúsculas, até 254; um por processo                                      |
|                   | Telefone/WhatsApp com DDD | `phone`                               | só dígitos, DDD + 8 ou 9 dígitos (`lib/validation/phone.ts`)              |
|                   | Cidade                    | `city`                                | 2 a 80 caracteres                                                         |
|                   | Estado (UF)               | `state`                               | uma das 27 UFs                                                            |
| 2. Formação       | Instituição de ensino     | `institution`                         | 2 a 120 caracteres                                                        |
|                   | Curso                     | `course`                              | texto livre, 2 a 120 caracteres                                           |
|                   | Semestre/período atual    | `semester`                            | 1 a 10                                                                    |
|                   | Previsão de conclusão     | `graduation_month`, `graduation_year` | a partir de dez/2027                                                      |
| 3. Interesses     | Área de interesse         | `interest_area`                       | uma macroárea: Operações, Produto, Mercado, Gestão                        |
|                   | Disponibilidade           | `availability`                        | Manhã ou Tarde (turno fixo de 6 h)                                        |
|                   | LinkedIn (opcional)       | `linkedin_url`                        | começa com `https://linkedin.com/` ou `https://www.linkedin.com/`         |
|                   | Currículo                 | `resume_path`                         | PDF até 10 MB, bucket privado `candidate-files`                           |
| 4. Vídeo e envio  | Vídeo de até 1 minuto     | `video_path` ou `video_url`           | upload MP4/MOV/WebM até 50 MB, ou link do YouTube; exatamente um dos dois |
|                   | Aceite da política        | `consent_version`, `consent_at`       | versão do texto e momento do aceite                                       |

Subáreas por macroárea (só texto de apoio no formulário): Operações (PPCP, Produção, Engenharia de
Processos, Qualidade, Logística); Produto (Estilo, Modelagem, Desenvolvimento, Compras, Pilotagem); Mercado
(Comercial B2B, E-commerce, Marketing, Trade, Lojas); Gestão (Financeiro, Controladoria, Gestão de Pessoas,
TI & Dados).

## Status

Seguem as 5 fases da seção Etapas do site. O RH muda o status; cada mudança vai para
`application_status_history` com quem mudou, e o candidato recebe e-mail a cada fase.

| Status                                      | Próximos possíveis                                           |
| ------------------------------------------- | ------------------------------------------------------------ |
| `recebida`                                  | `testes_online`, `nao_selecionada`, `desistiu`               |
| `testes_online`                             | `sallo_experience`, `nao_selecionada`, `desistiu`            |
| `sallo_experience`                          | `painel`, `nao_selecionada`, `desistiu`                      |
| `painel`                                    | `entrevista_final`, `nao_selecionada`, `desistiu`            |
| `entrevista_final`                          | `aprovada`, `lista_de_espera`, `nao_selecionada`, `desistiu` |
| `aprovada`                                  | `contratada`, `desistiu`                                     |
| `lista_de_espera`                           | `aprovada`, `nao_selecionada`, `desistiu`                    |
| `contratada`, `nao_selecionada`, `desistiu` | finais                                                       |

## Retenção

Todas as inscrições de um processo são apagadas **30 dias após `selection_processes.ends_at`** (anúncio dos
aprovados), com os arquivos. Os contratados seguem para a admissão fora deste sistema. Enquanto `ends_at`
estiver vazio, nada é apagado: o admin precisa preencher a data ao encerrar o processo. Os hashes de IP do
limite de envios também duram 30 dias.

## Acesso

- **Candidato (anon):** nenhum acesso ao banco. O envio passa pelo servidor, que valida e grava.
- **RH:** lê inscrições, histórico e arquivos; muda só `status` e `test_score`.
- **Admin:** tudo do RH, mais excluir inscrições, ver a equipe e a auditoria, e editar processos.
- **Equipe:** só por convite feito no servidor. Cadastro público desligado (`enable_signup: false`).
