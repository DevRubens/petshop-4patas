<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private function loginWithRole(Request $req, string $role)
    {
        $data = $req->validate([
            'email' => 'required|email',
            'senha' => 'required|string|min:6',
        ]);

        $user = Usuario::where('email', $data['email'])
            ->where('ativo', true)
            ->first();

        if (!$user || $user->role !== $role) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        if (!Hash::check($data['senha'], $user->senha_hash)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'usuario' => [
                'id' => $user->id,
                'nome' => $user->nome,
                'email' => $user->email,
                'role' => $user->role,
                'foto_url' => $user->foto_url,
            ],
        ]);
    }

    public function loginFuncionario(Request $req)
    {
        return $this->loginWithRole($req, 'FUNCIONARIO');
    }
    public function loginAdmin(Request $req)
    {
        return $this->loginWithRole($req, 'ADMIN');
    }
    public function me(Request $req)
    {
        return $req->user();
    }
    public function logout(Request $req)
    {
        $req->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'ok']);
    }
}
