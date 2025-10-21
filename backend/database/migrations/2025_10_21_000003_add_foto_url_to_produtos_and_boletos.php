<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('app_produtos', function (Blueprint $t) {
            $t->string('foto_url')->nullable()->after('nome');
        });

        Schema::create('app_boletos', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('descricao');
            $t->string('fornecedor')->nullable();
            $t->decimal('valor', 12, 2);
            $t->date('vencimento');
            $t->boolean('pago')->default(false);
            $t->uuid('funcionario_id');
            $t->index(['vencimento', 'pago']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_boletos');
        Schema::table('app_produtos', function (Blueprint $t) {
            $t->dropColumn('foto_url');
        });
    }
};

