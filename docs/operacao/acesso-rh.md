# Acesso da equipe do RH (Supabase Auth)

Configuração feita uma vez em **cada projeto** do Supabase (staging e produção), no painel.
O cadastro público fica desligado: contas só nascem por convite, em `/admin/equipe`.

## 1. URLs (Authentication → URL Configuration)

| Campo         | Staging                                                                                | Produção                                            |
| ------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Site URL      | URL do preview da Vercel                                                               | domínio do site (ex.: `https://eleve.sallo.com.br`) |
| Redirect URLs | `https://<seu-time>.vercel.app/**` (domínio dos previews) e `http://localhost:3000/**` | o mesmo domínio com `/**`                           |

## 2. Modelos de e-mail (Authentication → Emails → Templates)

Os links usam `{{ .SiteURL }}`: no staging, o convite sempre leva à Site URL configurada acima.
Os links usam `token_hash` e caem em `/auth/confirm`, que valida no servidor e leva para
`/admin/definir-senha`.

**Invite user**

- Assunto: `Convite para a área do RH do ELEVE+`
- Corpo:

```html
<h2>Você foi convidado(a) para a área do RH do ELEVE+</h2>
<p>Clique no link abaixo para criar sua senha. O link vale por 24 horas e só pode ser usado uma vez.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Criar minha senha</a></p>
<p>Se você não esperava este convite, ignore este e-mail.</p>
```

**Reset password**

- Assunto: `Nova senha da área do RH do ELEVE+`
- Corpo:

```html
<h2>Criar uma nova senha</h2>
<p>Recebemos um pedido para trocar a senha da sua conta na área do RH do ELEVE+.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Criar nova senha</a></p>
<p>Se não foi você, ignore este e-mail: sua senha continua a mesma.</p>
```

## 3. Envio pelo Resend (Authentication → Emails → SMTP Settings)

O SMTP padrão do Supabase manda poucos e-mails por hora e cai no spam. Ligue o SMTP próprio:

| Campo        | Valor                                                      |
| ------------ | ---------------------------------------------------------- |
| Host         | `smtp.resend.com`                                          |
| Port         | `465`                                                      |
| Username     | `resend`                                                   |
| Password     | uma API key do Resend (só no painel, nunca no repositório) |
| Sender email | o mesmo remetente de `EMAIL_FROM`                          |
| Sender name  | `ELEVE+ Grupo Sallo`                                       |

## 4. Primeiro admin

Antes de existir um admin, ninguém consegue convidar pelo site. Uma vez só, em cada projeto:

1. **Authentication → Users → Invite user** com o e-mail do primeiro admin.
2. **SQL Editor**, trocando o nome se precisar:

```sql
insert into public.staff_members (user_id, role, full_name)
select id, 'admin', 'Nome do Admin'
from auth.users
where email = 'email-do-admin@sallo.com.br';
```

3. O admin abre o link do convite, cria a senha e, em `/admin/equipe`, convida o resto do RH.

## Papéis

- **RH:** vê inscrições e arquivos, muda status e nota, exporta CSV.
- **Admin:** tudo do RH, mais excluir inscrições e convidar ou remover pessoas.

Tudo fica no registro de auditoria (`audit_log`): quem viu cada inscrição e arquivo, exportou, mudou
status, excluiu, convidou ou removeu.
