create index if not exists idx_usuarios_email on app.usuarios (email);
create index if not exists idx_produtos_nome on app.produtos (nome);
create index if not exists idx_vendas_data on app.vendas (data_hora);
create index if not exists idx_vendas_func on app.vendas (funcionario_id);
create index if not exists idx_vendas_cliente on app.vendas (cliente_id);
create index if not exists idx_itens_venda on app.venda_itens (venda_id);
create index if not exists idx_divergencias_data on app.divergencias (data_hora);
create index if not exists idx_credito_cliente on app.clientes_credito_lancamentos (cliente_id, data_hora);
