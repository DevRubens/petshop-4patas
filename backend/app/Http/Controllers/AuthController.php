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
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->nome,
                'email' => $user->email,
                'role'  => $user->role,
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

    public function registerFuncionario(Request $req)
    {
        $data = $req->validate([
            'nome'   => 'required|string|min:2',
            'email'  => 'required|email|unique:app_usuarios,email',
            'senha'  => 'required|string|min:6',
            'foto'   => 'nullable|url',
            'ativo'  => 'sometimes|boolean',
        ]);

        $user = new Usuario();
        $user->nome       = $data['nome'];
        $user->email      = $data['email'];
        $user->senha_hash = Hash::make($data['senha']);
        $user->foto_url   = $data['foto'] ?? null;
        $user->role       = 'FUNCIONARIO';
        $user->ativo      = $data['ativo'] ?? true;
        $user->save();

        return response()->json([
            'message' => 'Funcionário cadastrado com sucesso',
            'usuario' => [
                'id'    => $user->id,
                'name'  => $user->nome,
                'email' => $user->email,
                'role'  => $user->role,
                'ativo' => $user->ativo,
            ],
        ], 201);
    }

    public function registerAdmin(Request $req)
    {
        $adminCount = Usuario::where('role', 'ADMIN')->count();

        if ($adminCount > 0) {
            $auth = $req->user();
            if (!$auth || $auth->role !== 'ADMIN') {
                return response()->json(['message' => 'Acesso negado'], 403);
            }
        }

        $data = $req->validate([
            'nome'   => 'required|string|min:2',
            'email'  => 'required|email|unique:app_usuarios,email',
            'senha'  => 'required|string|min:6',
            'foto'   => 'nullable|url',
            'ativo'  => 'sometimes|boolean',
        ]);

        $user = new Usuario();
        $user->nome       = $data['nome'];
        $user->email      = $data['email'];
        $user->senha_hash = Hash::make($data['senha']);
        $user->foto_url   = $data['foto'] ?? null;
        $user->role       = 'ADMIN';
        $user->ativo      = $data['ativo'] ?? true;
        $user->save();

        return response()->json([
            'message' => 'Administrador cadastrado com sucesso',
            'usuario' => [
                'id'    => $user->id,
                'name'  => $user->nome,
                'email' => $user->email,
                'role'  => $user->role,
                'ativo' => $user->ativo,
            ],
        ], 201);
    }

    public function me(Request $req)
    {
        $u = $req->user();
        return $u ? response()->json([
            'id'    => $u->id,
            'name'  => $u->nome,
            'email' => $u->email,
            'role'  => $u->role,
        ]) : response()->json(null, 401);
    }

    public function logout(Request $req)
    {
        $req->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'ok']);
    }
}
