create or replace function app.fn_venda_item_stock_ins()
returns trigger
language plpgsql
as $$
begin
  update app.produtos
     set quantidade_estoque = quantidade_estoque - new.quantidade
   where id = new.produto_id;

  if (select quantidade_estoque from app.produtos where id = new.produto_id) < 0 then
    raise exception 'Estoque insuficiente para o produto %', new.produto_id;
  end if;

  return new;
end $$;

create or replace function app.fn_venda_item_stock_upd()
returns trigger
language plpgsql
as $$
declare
  diff integer;
begin
  diff := new.quantidade - old.quantidade; 
  if diff <> 0 then
    update app.produtos
       set quantidade_estoque = quantidade_estoque - diff
     where id = new.produto_id;

    if (select quantidade_estoque from app.produtos where id = new.produto_id) < 0 then
      raise exception 'Estoque insuficiente para o produto %', new.produto_id;
    end if;
  end if;
  return new;
end $$;

create or replace function app.fn_venda_item_stock_del()
returns trigger
language plpgsql
as $$
begin
  update app.produtos
     set quantidade_estoque = quantidade_estoque + old.quantidade
   where id = old.produto_id;
  return old;
end $$;

drop trigger if exists trg_venda_item_stock_ins on app.venda_itens;
create trigger trg_venda_item_stock_ins
after insert on app.venda_itens
for each row execute function app.fn_venda_item_stock_ins();

drop trigger if exists trg_venda_item_stock_upd on app.venda_itens;
create trigger trg_venda_item_stock_upd
after update on app.venda_itens
for each row execute function app.fn_venda_item_stock_upd();

drop trigger if exists trg_venda_item_stock_del on app.venda_itens;
create trigger trg_venda_item_stock_del
after delete on app.venda_itens
for each row execute function app.fn_venda_item_stock_del();

create or replace function app.fn_check_credit_cliente()
returns trigger
language plpgsql
as $$
declare
  esp boolean;
begin
  if new.tipo_pagamento = 'CREDITO_CLIENTE' then
    if new.cliente_id is null then
      raise exception 'Venda a prazo requer cliente associado.';
    end if;
    select especial into esp from app.clientes where id = new.cliente_id;
    if not coalesce(esp, false) then
      raise exception 'Cliente % não é especial (fiado não permitido).', new.cliente_id;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_check_credit_cliente_ins on app.vendas;
create trigger trg_check_credit_cliente_ins
before insert on app.vendas
for each row execute function app.fn_check_credit_cliente();

drop trigger if exists trg_check_credit_cliente_upd on app.vendas;
create trigger trg_check_credit_cliente_upd
before update on app.vendas
for each row execute function app.fn_check_credit_cliente();

create or replace function app.fn_credit_ledger_after_ins()
returns trigger
language plpgsql
as $$
begin
  if new.tipo_pagamento = 'CREDITO_CLIENTE' and new.cliente_id is not null and new.total > 0 then
    insert into app.clientes_credito_lancamentos (cliente_id, venda_id, descricao, valor, tipo)
    values (new.cliente_id, new.id, 'Venda a prazo', new.total, 'DEBITO')
    on conflict (venda_id) do update
      set cliente_id = excluded.cliente_id,
          descricao  = excluded.descricao,
          valor      = excluded.valor,
          tipo       = excluded.tipo;
  end if;
  return new;
end $$;

create or replace function app.fn_credit_ledger_after_upd()
returns trigger
language plpgsql
as $$
begin
  delete from app.clientes_credito_lancamentos where venda_id = new.id;

  if new.tipo_pagamento = 'CREDITO_CLIENTE' and new.cliente_id is not null and new.total > 0 then
    insert into app.clientes_credito_lancamentos (cliente_id, venda_id, descricao, valor, tipo)
    values (new.cliente_id, new.id, 'Venda a prazo (atualizada)', new.total, 'DEBITO');
  end if;

  return new;
end $$;

create or replace function app.fn_credit_ledger_after_del()
returns trigger
language plpgsql
as $$
begin
  delete from app.clientes_credito_lancamentos where venda_id = old.id;
  return old;
end $$;

drop trigger if exists trg_credit_ledger_ins on app.vendas;
create trigger trg_credit_ledger_ins
after insert on app.vendas
for each row execute function app.fn_credit_ledger_after_ins();

drop trigger if exists trg_credit_ledger_upd on app.vendas;
create trigger trg_credit_ledger_upd
after update on app.vendas
for each row execute function app.fn_credit_ledger_after_upd();

drop trigger if exists trg_credit_ledger_del on app.vendas;
create trigger trg_credit_ledger_del
after delete on app.vendas
for each row execute function app.fn_credit_ledger_after_del();
