create or replace view app.vendas_do_dia as
select
  v.id,
  v.data_hora at time zone 'America/Sao_Paulo' as data_hora_sp,
  u.nome as funcionario,
  c.nome as cliente,
  v.total,
  v.tipo_pagamento
from app.vendas v
join app.usuarios u on u.id = v.funcionario_id
left join app.clientes c on c.id = v.cliente_id
where (v.data_hora at time zone 'America/Sao_Paulo')::date = (now() at time zone 'America/Sao_Paulo')::date
order by v.data_hora desc;

create or replace view app.vendas_por_funcionario as
select
  u.id as funcionario_id,
  u.nome as funcionario,
  count(v.id) as qtd_vendas,
  coalesce(sum(v.total),0)::numeric(12,2) as total_vendido
from app.usuarios u
left join app.vendas v on v.funcionario_id = u.id
where u.role = 'FUNCIONARIO'
group by u.id, u.nome
order by total_vendido desc;

create or replace view app.clientes_totais_gastos as
select
  c.id as cliente_id,
  c.nome,
  coalesce(sum(v.total),0)::numeric(12,2) as total_gasto
from app.clientes c
left join app.vendas v on v.cliente_id = c.id
group by c.id, c.nome
order by total_gasto desc;

create or replace view app.clientes_saldo_credito as
select
  c.id as cliente_id,
  c.nome,
  coalesce(sum(case when l.tipo = 'DEBITO' then l.valor else 0 end),0)
  - coalesce(sum(case when l.tipo = 'CREDITO' then l.valor else 0 end),0) as saldo_aberto
from app.clientes c
left join app.clientes_credito_lancamentos l on l.cliente_id = c.id
group by c.id, c.nome
order by saldo_aberto desc;

create or replace view app.compras_cliente_detalhes as
select
  v.id as venda_id,
  v.data_hora,
  c.id as cliente_id,
  c.nome as cliente,
  u.nome as funcionario,
  p.codigo,
  p.nome as produto,
  i.quantidade,
  i.valor_unitario,
  i.subtotal,
  v.total,
  v.tipo_pagamento
from app.vendas v
left join app.clientes c on c.id = v.cliente_id
join app.usuarios u on u.id = v.funcionario_id
join app.venda_itens i on i.venda_id = v.id
join app.produtos p on p.id = i.produto_id
order by v.data_hora desc, v.id;
