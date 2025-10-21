<?php

namespace App\Http\Controllers;

use App\Models\Devolucao;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DevolucoesController extends Controller
{
    public function index(Request $req)
    {
        $q = Devolucao::query();
        return $q->orderByDesc('data_hora')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'venda_id' => 'nullable|uuid',
            'produto_id' => 'required|uuid',
            'quantidade' => 'required|integer|min:1',
            'motivo' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($req, $data) {
            $p = Produto::lockForUpdate()->find($data['produto_id']);
            if (!$p) return response()->json(['message' => 'Produto não encontrado'], 404);

            $dev = Devolucao::create([
                'id' => (string) Str::uuid(),
                'venda_id' => $data['venda_id'] ?? null,
                'produto_id' => $p->id,
                'funcionario_id' => $req->user()->id,
                'quantidade' => $data['quantidade'],
                'motivo' => $data['motivo'] ?? null,
                'data_hora' => now(),
            ]);

            $p->increment('quantidade_estoque', $data['quantidade']);

            return response()->json($dev, 201);
        });
    }
}

