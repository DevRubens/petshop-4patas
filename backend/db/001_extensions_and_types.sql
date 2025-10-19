create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists app;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type app.user_role as enum ('ADMIN', 'FUNCIONARIO');
  end if;

  if not exists (select 1 from pg_type where typname = 'pagamento_tipo') then
    create type app.pagamento_tipo as enum (
      'DINHEIRO',
      'PIX',
      'CARTAO_DEBITO',
      'CARTAO_CREDITO',
      'CREDITO_CLIENTE',
      'OUTRO'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'credito_tipo') then
    create type app.credito_tipo as enum ('DEBITO','CREDITO'); 
  end if;
end $$;
