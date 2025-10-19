<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_usuarios', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('nome');
            $t->string('email')->unique();
            $t->string('senha_hash');
            $t->string('foto_url')->nullable();
            $t->enum('role', ['ADMIN', 'FUNCIONARIO']);
            $t->boolean('ativo')->default(true);
            $t->timestamp('criado_em')->useCurrent();
        });

        Schema::create('app_clientes', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('nome');
            $t->string('telefone')->nullable();
            $t->string('endereco')->nullable();
            $t->string('referencia')->nullable();
            $t->boolean('especial')->default(false);
            $t->timestamp('criado_em')->useCurrent();
        });

        Schema::create('app_produtos', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('codigo')->unique();
            $t->string('nome');
            $t->date('data_entrada')->nullable();
            $t->date('validade')->nullable();
            $t->decimal('valor_compra', 12, 2)->nullable();
            $t->decimal('valor_venda', 12, 2);
            $t->integer('quantidade_estoque')->default(0);
            $t->timestamp('criado_em')->useCurrent();
        });

        Schema::create('app_vendas', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('funcionario_id');
            $t->uuid('cliente_id')->nullable();
            $t->timestamp('data_hora')->useCurrent();
            $t->decimal('total', 12, 2);
            $t->enum('tipo_pagamento', ['DINHEIRO', 'PIX', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'CREDITO_CLIENTE', 'OUTRO']);
            $t->text('observacao')->nullable();
            $t->index(['funcionario_id', 'cliente_id']);
        });

        Schema::create('app_venda_itens', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('venda_id');
            $t->uuid('produto_id');
            $t->integer('quantidade');
            $t->decimal('valor_unitario', 12, 2);
            $t->index(['venda_id', 'produto_id']);
        });

        Schema::create('app_divergencias', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('funcionario_id');
            $t->timestamp('data_hora')->useCurrent();
            $t->text('descricao');
            $t->boolean('resolvida')->default(false);
            $t->text('nota_admin')->nullable();
            $t->index('funcionario_id');
        });

        Schema::create('app_caixa_aberturas', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('funcionario_id');
            $t->timestamp('data_hora_abertura')->useCurrent();
            $t->decimal('valor_inicial', 12, 2)->default(0);
            $t->text('observacao')->nullable();
            $t->boolean('aberto')->default(true);
            $t->index('funcionario_id');
        });

        Schema::create('app_caixa_fechamentos', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('abertura_id');
            $t->uuid('funcionario_id');
            $t->timestamp('data_hora_fechamento')->useCurrent();
            $t->decimal('valor_final', 12, 2)->default(0);
            $t->text('observacao')->nullable();
            $t->index(['abertura_id', 'funcionario_id']);
        });

        Schema::create('app_clientes_credito_lancamentos', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('cliente_id');
            $t->uuid('venda_id')->nullable();
            $t->timestamp('data_hora')->useCurrent();
            $t->text('descricao')->nullable();
            $t->decimal('valor', 12, 2);
            $t->enum('tipo', ['DEBITO', 'CREDITO']);
            $t->index(['cliente_id', 'data_hora']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_clientes_credito_lancamentos');
        Schema::dropIfExists('app_caixa_fechamentos');
        Schema::dropIfExists('app_caixa_aberturas');
        Schema::dropIfExists('app_divergencias');
        Schema::dropIfExists('app_venda_itens');
        Schema::dropIfExists('app_vendas');
        Schema::dropIfExists('app_produtos');
        Schema::dropIfExists('app_clientes');
        Schema::dropIfExists('app_usuarios');
    }
};
