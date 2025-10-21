<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientesProdutosTest extends TestCase
{
    use RefreshDatabase;

    private function authToken(): string
    {
        // Bootstrap: register admin and login
        $this->postJson('/api/auth/admin/register', [
            'nome' => 'Admin', 'email' => 'admin@test.local', 'senha' => 'secret123'
        ]);
        $resp = $this->postJson('/api/auth/admin/login', [
            'email' => 'admin@test.local', 'senha' => 'secret123'
        ]);
        return $resp->json('token');
    }

    public function test_criar_cliente_e_buscar()
    {
        $this->artisan('migrate');
        $t = $this->authToken();

        $this->withHeader('Authorization', 'Bearer '.$t)->postJson('/api/clientes', [
            'nome' => 'Cliente X', 'telefone' => '21999990000'
        ])->assertCreated();

        $list = $this->withHeader('Authorization', 'Bearer '.$t)
            ->getJson('/api/clientes?s=Cliente');
        $list->assertOk();
        $this->assertStringContainsString('Cliente X', json_encode($list->json()));
    }

    public function test_criar_produto_e_atualizar_estoque()
    {
        $this->artisan('migrate');
        $t = $this->authToken();

        $p = $this->withHeader('Authorization', 'Bearer '.$t)->postJson('/api/produtos', [
            'codigo' => 'TEST-1', 'nome' => 'Produto Teste', 'valor_venda' => 9.9, 'quantidade_estoque' => 5
        ]);
        $p->assertCreated();
        $id = $p->json('id');

        $u = $this->withHeader('Authorization', 'Bearer '.$t)->putJson("/api/produtos/{$id}/estoque", [
            'quantidade_estoque' => 8
        ]);
        $u->assertOk();
        $this->assertEquals(8, $u->json('quantidade_estoque'));
    }
}

