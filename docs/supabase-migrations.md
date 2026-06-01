Aplicando migrations no Supabase

Opções:

1) Painel SQL (fácil)
- Abra o painel do seu projeto no Supabase
- Vá em `SQL Editor` → `New query`
- Cole o conteúdo de `migrations/20260531_add_analytics_and_webhook_logs.sql` e execute
- Em seguida, cole e execute `migrations/20260601_add_is_admin_to_profiles.sql` e `migrations/20260601_restrict_mp_webhook_logs_policy.sql`

2) Supabase CLI
- Instale a CLI: https://supabase.com/docs/guides/cli
- Autentique e conecte ao seu projeto
- Para aplicar um SQL rápido, você pode executar no seu terminal:

```bash
# executar SQL via supabase db remote sql
supabase db remote commit --file migrations/20260531_add_analytics_and_webhook_logs.sql
supabase db remote commit --file migrations/20260601_add_is_admin_to_profiles.sql
supabase db remote commit --file migrations/20260601_restrict_mp_webhook_logs_policy.sql
```

(Alternativamente use `supabase db push` se estiver usando o modo de projeto local com migrations versionadas.)

3) Permissões e notas
- A policy de `mp_webhook_logs` foi ajustada para permitir SELECT apenas a admins (baseada em `profiles.is_admin`). Garanta criar um admin manualmente antes de acessar `/admin/webhooks`.
- Para criar um admin rápido via SQL (substitua `USER_ID` pelo UUID do usuário):

```sql
update public.profiles set is_admin = true where user_id = 'USER_ID';
```

4) Marcar admin automaticamente
- Para testes rápidos, adicione seu email de desenvolvimento em `.env.local` como:

```
NEXT_PUBLIC_ADMIN_EMAILS=dev@example.com
```

- Usuários que se registrarem com esse email receberão `is_admin = true` no perfil automaticamente.
