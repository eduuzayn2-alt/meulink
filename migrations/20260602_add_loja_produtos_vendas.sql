CREATE TABLE produtos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  username text NOT NULL,
  nome text NOT NULL,
  descricao text,
  preco decimal(10,2) NOT NULL,
  imagem_url text,
  tipo_entrega text CHECK (tipo_entrega in ('arquivo', 'link')),
  arquivo_url text,
  link_externo text,
  slug text NOT NULL,
  ativo boolean DEFAULT true,
  total_vendas integer DEFAULT 0,
  criado_em timestamp DEFAULT now()
);
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usuarios gerenciam seus produtos" ON produtos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "produtos publicos para todos" ON produtos FOR SELECT USING (true);

CREATE TABLE vendas (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id uuid REFERENCES produtos(id),
  comprador_email text NOT NULL,
  valor decimal(10,2) NOT NULL,
  status text DEFAULT 'pendente',
  payment_id text,
  criado_em timestamp DEFAULT now()
);
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "donos veem suas vendas" ON vendas FOR SELECT USING (
  auth.uid() = (
    SELECT user_id FROM produtos WHERE id = produto_id
  )
);
