create table if not exists app.usuarios (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  email        citext not null unique,
  senha_hash   text not null,                  
  foto_url     text,
  role         app.user_role not null,         
  ativo        boolean not null default true,
  criado_em    timestamptz not null default now()
);

create table if not exists app.clientes (
  id           uuid primary key default gen_random_uuid(),
  nome         text not null,
  telefone     text,
  endereco     text,
  referencia   text,
  especial     boolean not null default false, 
  criado_em    timestamptz not null default now()
);

create table if not exists app.produtos (
  id                   uuid primary key default gen_random_uuid(),
  codigo               text not null unique,
  nome                 text not null,
  data_entrada         date,
  validade             date,
  valor_compra         numeric(12,2),
  valor_venda          numeric(12,2) not null check (valor_venda >= 0),
  quantidade_estoque   integer not null default 0 check (quantidade_estoque >= 0),
  criado_em            timestamptz not null default now()
);

create table if not exists app.vendas (
  id              uuid primary key default gen_random_uuid(),
  funcionario_id  uuid not null references app.usuarios(id),
  cliente_id      uuid references app.clientes(id),
  data_hora       timestamptz not null default now(),
  total           numeric(12,2) not null check (total >= 0),
  tipo_pagamento  app.pagamento_tipo not null,
  observacao      text
);

create table if not exists app.venda_itens (
  id              uuid primary key default gen_random_uuid(),
  venda_id        uuid not null references app.vendas(id) on delete cascade,
  produto_id      uuid not null references app.produtos(id),
  quantidade      integer not null check (quantidade > 0),
  valor_unitario  numeric(12,2) not null check (valor_unitario >= 0),
  subtotal        numeric(12,2) generated always as (quantidade * valor_unitario) stored
);

create table if not exists app.divergencias (
  id              uuid primary key default gen_random_uuid(),
  funcionario_id  uuid not null references app.usuarios(id),
  data_hora       timestamptz not null default now(),
  descricao       text not null,
  resolvida       boolean not null default false,
  nota_admin      text
);

create table if not exists app.caixa_aberturas (
  id                  uuid primary key default gen_random_uuid(),
  funcionario_id      uuid not null references app.usuarios(id),
  data_hora_abertura  timestamptz not null default now(),
  valor_inicial       numeric(12,2) not null default 0,
  observacao          text,
  aberto              boolean not null default true
);

create table if not exists app.caixa_fechamentos (
  id                     uuid primary key default gen_random_uuid(),
  abertura_id            uuid not null references app.caixa_aberturas(id) on delete cascade,
  funcionario_id         uuid not null references app.usuarios(id),
  data_hora_fechamento   timestamptz not null default now(),
  valor_final            numeric(12,2) not null default 0,
  observacao             text
);

create table if not exists app.clientes_credito_lancamentos (
  id          uuid primary key default gen_random_uuid(),
  cliente_id  uuid not null references app.clientes(id) on delete cascade,
  venda_id    uuid unique references app.vendas(id) on delete cascade,
  data_hora   timestamptz not null default now(),
  descricao   text,
  valor       numeric(12,2) not null check (valor > 0),
  tipo        app.credito_tipo not null
);
