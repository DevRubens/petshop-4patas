<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('app_notas_fiscais', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('venda_id')->nullable();
            $t->uuid('funcionario_id');
            $t->string('numero');
            $t->string('serie')->nullable();
            $t->string('chave_acesso')->nullable();
            $t->string('xml_url')->nullable();
            $t->decimal('total', 12, 2);
            $t->date('data_emissao');
            $t->index(['venda_id', 'data_emissao']);
        });

        Schema::create('app_devolucoes', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->uuid('venda_id')->nullable();
            $t->uuid('produto_id');
            $t->uuid('funcionario_id');
            $t->integer('quantidade');
            $t->text('motivo')->nullable();
            $t->timestamp('data_hora')->useCurrent();
            $t->index(['venda_id', 'produto_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_devolucoes');
        Schema::dropIfExists('app_notas_fiscais');
    }
};

