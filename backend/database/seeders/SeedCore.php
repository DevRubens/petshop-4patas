<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class SeedCore extends Seeder
{
    public function run(): void
    {
        DB::table('app_usuarios')->insertOrIgnore([
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Admin 4Patas',
                'email' => 'admin@petshop4patas.local',
                'senha_hash' => Hash::make('Adm4Patas!2025'),
                'role' => 'ADMIN',
                'ativo' => 1,
            ],
            [
                'id' => (string) Str::uuid(),
                'nome' => 'Funcionário 1',
                'email' => 'func1@petshop4patas.local',
                'senha_hash' => Hash::make('Func4Patas!2025'),
                'role' => 'FUNCIONARIO',
                'ativo' => 1,
            ],
        ]);

        $clienteComum = (string) Str::uuid();
        $clienteEspecial = (string) Str::uuid();

        DB::table('app_clientes')->insertOrIgnore([
            [
                'id' => $clienteComum,
                'nome' => 'Cliente Comum',
                'telefone' => '(21) 99999-0001',
                'endereco' => 'Rua A, 123',
                'referencia' => 'Próx. padaria',
                'especial' => 0,
            ],
            [
                'id' => $clienteEspecial,
                'nome' => 'Cliente Especial',
                'telefone' => '(21) 99999-0002',
                'endereco' => 'Rua B, 456',
                'referencia' => 'Em frente à praça',
                'especial' => 1,
            ],
        ]);

        DB::table('app_produtos')->insertOrIgnore([
            [
                'id' => (string) Str::uuid(),
                'codigo' => 'RACAO-C-01',
                'nome' => 'Ração Canina Premium 10kg',
                'data_entrada' => now()->toDateString(),
                'validade' => now()->addYear()->toDateString(),
                'valor_compra' => 90.00,
                'valor_venda' => 149.90,
                'quantidade_estoque' => 50,
            ],
            [
                'id' => (string) Str::uuid(),
                'codigo' => 'RACAO-G-02',
                'nome' => 'Ração Gatina 2kg',
                'data_entrada' => now()->toDateString(),
                'validade' => now()->addYear()->toDateString(),
                'valor_compra' => 20.00,
                'valor_venda' => 39.90,
                'quantidade_estoque' => 80,
            ],
            [
                'id' => (string) Str::uuid(),
                'codigo' => 'PET-BANH-01',
                'nome' => 'Shampoo Pet 500ml',
                'data_entrada' => now()->toDateString(),
                'validade' => now()->addYear()->toDateString(),
                'valor_compra' => 10.00,
                'valor_venda' => 24.90,
                'quantidade_estoque' => 40,
            ],
        ]);
    }
}
