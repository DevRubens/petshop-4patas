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
            return response()->json(['message' => 'Credenciais invÃ¡lidas'], 401);
        }

        if (!Hash::check($data['senha'], $user->senha_hash)) {
            return response()->json(['message' => 'Credenciais invÃ¡lidas'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->nome,
                'email' => $user->email,
                'role'  => $user->role,
                'photo' => $user->foto_url,
                'ativo' => $user->ativo,
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
            'message' => 'FuncionÃ¡rio cadastrado com sucesso',
            'usuario' => [
                'id'    => $user->id,
                'name'  => $user->nome,
                'email' => $user->email,
                'role'  => $user->role,
                'ativo' => $user->ativo,
                'photo' => $user->foto_url,
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
                'photo' => $user->foto_url,
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
            'photo' => $u->foto_url,
            'ativo' => $u->ativo,
        ]) : response()->json(null, 401);
    }

    public function listFuncionarios(Request $req)
    {
        $req->user(); // ensures auth

        $funcionarios = Usuario::where('role', 'FUNCIONARIO')
            ->orderBy('nome')
            ->get(['id', 'nome', 'email', 'foto_url', 'ativo', 'criado_em']);

        return response()->json([
            'funcionarios' => $funcionarios->map(function ($u) {
                return [
                    'id'       => $u->id,
                    'name'     => $u->nome,
                    'email'    => $u->email,
                    'photo'    => $u->foto_url,
                    'ativo'    => (bool) $u->ativo,
                    'created'  => $u->criado_em,
                ];
            }),
        ]);
    }

    public function updateAdminPassword(Request $req)
    {
        $user = $req->user();

        $data = $req->validate([
            'senha_atual'           => 'required|string',
            'nova_senha'            => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($data['senha_atual'], $user->senha_hash)) {
            return response()->json([
                'message' => 'Senha atual invÃ¡lida',
            ], 422);
        }

        $user->senha_hash = Hash::make($data['nova_senha']);
        $user->save();

        return response()->json([
            'message' => 'Senha atualizada com sucesso',
        ]);
    }

    public function updateFuncionarioPassword(Request $req, string $id)
    {
        $data = $req->validate([
            'nova_senha' => 'required|string|min:6|confirmed',
        ]);

        $funcionario = Usuario::where('id', $id)
            ->where('role', 'FUNCIONARIO')
            ->first();

        if (!$funcionario) {
            return response()->json([
                'message' => 'FuncionÃ¡rio nÃ£o encontrado',
            ], 404);
        }

        $funcionario->senha_hash = Hash::make($data['nova_senha']);
        $funcionario->save();

        return response()->json([
            'message' => 'Senha do funcionÃ¡rio atualizada',
            'usuario' => [
                'id'    => $funcionario->id,
                'name'  => $funcionario->nome,
                'email' => $funcionario->email,
                'photo' => $funcionario->foto_url,
                'ativo' => $funcionario->ativo,
            ],
        ]);
    }

    public function updateMinhaFoto(Request $req)
    {
        $user = $req->user();
        $data = $req->validate([
            'foto_url' => 'nullable|string|max:2048',
        ]);
        $user->foto_url = $data['foto_url'] ?? null;
        $user->save();
        return response()->json(['message' => 'Foto atualizada', 'url' => $user->foto_url]);
    }

    public function updateUsuarioFoto(Request $req, string $id)
    {
        $data = $req->validate(['foto_url' => 'nullable|string|max:2048']);
        $u = Usuario::find($id);
        if (!$u) return response()->json(['message' => 'UsuÃ¡rio nÃ£o encontrado'], 404);
        $u->foto_url = $data['foto_url'] ?? null;
        $u->save();
        return response()->json(['message' => 'Foto atualizada', 'url' => $u->foto_url]);
    }

    public function deleteFuncionario(Request $req, string $id)
    {
        $f = Usuario::where('id', $id)->where('role', 'FUNCIONARIO')->first();
        if (!$f) return response()->json(['message' => 'FuncionÃ¡rio nÃ£o encontrado'], 404);

        $f->delete();
        return response()->json(['message' => 'FuncionÃ¡rio excluÃ­do']);
    }

    public function logout(Request $req)
    {
        $req->user()?->currentAccessToken()?->delete();
        return response()->json(['message' => 'ok']);
    }
}


