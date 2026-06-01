Mercado Pago sandbox — Teste do fluxo de assinatura (Linkify)

Pré-requisitos
- Configurar `MERCADOPAGO_ACCESS_TOKEN` no ambiente (modo sandbox / teste).
- `NEXT_PUBLIC_APP_URL` apontando para seu ambiente (ex: http://localhost:3000)
- Endpoint `/api/webhook/mercadopago` deve estar acessível publicamente (use ngrok para testes locais).

1) Criar preferência (via aplicação)
- Faça login como usuário no dashboard e clique em "Assinar Pro".
- O dashboard chama `POST /api/criar-assinatura` com `{ payer_email, user_id }`.
- O endpoint cria a preferência no Mercado Pago e retorna `init_point`.
- O checkout abrirá numa nova aba (sandbox).

2) Completar o pagamento sandbox
- Use as credenciais de teste do Mercado Pago para finalizar o pagamento.
- Verifique se a preferência foi aprovada (o checkout redireciona para `NEXT_PUBLIC_APP_URL/pagamento/sucesso`).

3) Verificar webhook e atualização do perfil
- O Mercado Pago (sandbox) enviará uma notificação para `/api/webhook/mercadopago`.
- Webhook busca dados do pagamento em `https://api.mercadopago.com/v1/payments/{id}`.
- O webhook agora prioriza `payment.metadata.user_id` ou `payment.external_reference`.
- Se encontrar `user_id`, o webhook atualiza `profiles` definindo `plan = 'pro'` e `subscription_status = 'active'`.

4) Validar no Supabase
- Verifique na tabela `profiles` que a coluna `plan` do `user_id` foi atualizada para `pro`.
- Verifique na tabela `subscriptions` que foi inserido um registro com `user_id` e `mp_payment_id`.
- Verifique na tabela `mp_webhook_logs` se o payload foi gravado para auditoria.

5) Problemas comuns
- Webhook não é chamado: teste com ngrok para expor servidor local e configure a URL no Mercado Pago sandbox.
- `metadata.user_id` faltando: confira se o dashboard enviou `user_id` ao criar a preferência.
- Permissões no Supabase: se o webhook não conseguir atualizar, verifique as policies RLS e se a chave usada pelo servidor tem permissões (use a service_role key para backend se necessário).

6) Teste manual de webhook
- Para depuração, você pode simular uma chamada POST ao seu webhook com um payload de exemplo contendo `data.id` igual ao `id` do pagamento teste.

Exemplo de payload mínimo para chamar seu webhook durante testes:

{
  "type": "payment",
  "data": { "id": 1234567890 }
}

Em seguida, certifique-se de que existe um pagamento com esse `id` no sandbox (ou use o endpoint de pagamentos da API com seu token de teste para inspecionar).
