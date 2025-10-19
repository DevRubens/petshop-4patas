insert into app.usuarios (nome, email, senha_hash, foto_url, role)
values
  ('Admin 4Patas', 'admin@petshop4patas.local', crypt('Adm4Patas!2025', gen_salt('bf')), null, 'ADMIN')
on conflict (email) do nothing;

insert into app.usuarios (nome, email, senha_hash, foto_url, role)
values
  ('Funcionário 1', 'func1@petshop4patas.local', crypt('Func4Patas!2025', gen_salt('bf')), null, 'FUNCIONARIO')
on conflict (email) do nothing;

insert into app.clientes (nome, telefone, endereco, referencia, especial)
values
  ('Cliente Comum', '(21) 99999-0001', 'Rua A, 123', 'Próx. padaria', false),
  ('Cliente Especial', '(21) 99999-0002', 'Rua B, 456', 'Em frente à praça', true)
on conflict do nothing;

insert into app.produtos (codigo, nome, data_entrada, validade, valor_compra, valor_venda, quantidade_estoque)
values
  ('RACAO-C-01', 'Ração Canina Premium 10kg', current_date, current_date + 365, 90.00, 149.90, 50),
  ('RACAO-G-02', 'Ração Gatina 2kg',        current_date, current_date + 365, 20.00,  39.90, 80),
  ('PET-BANH-01','Shampoo Pet 500ml',        current_date, current_date + 365, 10.00,  24.90, 40)
on conflict do nothing;

do $$
declare v_id uuid;
begin
  insert into app.vendas (funcionario_id, cliente_id, total, tipo_pagamento, observacao)
  values ((select id from app.usuarios where email='func1@petshop4patas.local'),
          (select id from app.clientes where nome='Cliente Comum'),
          189.80, 'PIX', 'Venda seed') returning id into v_id;

  insert into app.venda_itens (venda_id, produto_id, quantidade, valor_unitario)
  values
    (v_id, (select id from app.produtos where codigo='RACAO-C-01'), 1, 149.90),
    (v_id, (select id from app.produtos where codigo='PET-BANH-01'), 1, 24.90),
    (v_id, (select id from app.produtos where codigo='RACAO-G-02'), 1, 39.90);

end $$;

do $$
declare v_id uuid;
begin
  insert into app.vendas (funcionario_id, cliente_id, total, tipo_pagamento, observacao)
  values ((select id from app.usuarios where email='func1@petshop4patas.local'),
          (select id from app.clientes where nome='Cliente Especial'),
          149.90, 'CREDITO_CLIENTE', 'Venda a prazo seed') returning id into v_id;

  insert into app.venda_itens (venda_id, produto_id, quantidade, valor_unitario)
  values
    (v_id, (select id from app.produtos where codigo='RACAO-C-01'), 1, 149.90);
end $$;
