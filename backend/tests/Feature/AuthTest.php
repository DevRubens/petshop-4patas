<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_register_and_login_and_access_protected()
    {
        $this->artisan('migrate');

        // Register admin (open if none)
        $resp = $this->postJson('/api/auth/admin/register', [
            'nome' => 'Admin',
            'email' => 'admin@test.local',
            'senha' => 'secret123',
        ]);
        $resp->assertCreated();

        // Login admin
        $resp = $this->postJson('/api/auth/admin/login', [
            'email' => 'admin@test.local',
            'senha' => 'secret123',
        ]);
        $resp->assertOk();
        $token = $resp->json('token');
        $this->assertNotEmpty($token);

        // Access protected
        $me = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/me');
        $me->assertOk();
        $me->assertJsonFragment(['email' => 'admin@test.local']);
    }
}

