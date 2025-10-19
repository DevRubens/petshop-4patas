do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'petshop4patas_app') then
    create role petshop4patas_app login password 'App4Patas!mY6q2Z9tX7v4L3';
  end if;
end $$;

grant usage on schema app to petshop4patas_app;

grant select, insert, update, delete on
  app.usuarios,
  app.clientes,
  app.produtos,
  app.vendas,
  app.venda_itens,
  app.divergencias,
  app.caixa_aberturas,
  app.caixa_fechamentos,
  app.clientes_credito_lancamentos
to petshop4patas_app;

grant select on
  app.vendas_do_dia,
  app.vendas_por_funcionario,
  app.clientes_totais_gastos,
  app.clientes_saldo_credito,
  app.compras_cliente_detalhes
to petshop4patas_app;

alter default privileges in schema app
  grant select, insert, update, delete on tables to petshop4patas_app;

alter default privileges in schema app
  grant usage, select on sequences to petshop4patas_app;
