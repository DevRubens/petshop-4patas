<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutosController extends Controller
{
    public function index(Request $req)
    {
        $q = Produto::query();
        if ($s = $req->query('s')) {
            $q->where('nome', 'like', "%$s%")
                ->orWhere('codigo', 'like', "%$s%");
        }
        return $q->orderBy('nome')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'codigo' => 'required|string',
            'nome' => 'required|string',
            'data_entrada' => 'nullable|date',
            'validade' => 'nullable|date',
            'valor_compra' => 'nullable|numeric',
            'valor_venda' => 'required|numeric|min:0',
            'quantidade_estoque' => 'required|integer|min:0',
            'foto_url' => 'nullable|url',
        ]);

        $p = Produto::create($data);
        return response()->json($p, 201);
    }

    public function updateEstoque(Request $req, string $id)
    {
        $data = $req->validate([
            'quantidade_estoque' => 'required|integer|min:0',
        ]);

        $p = Produto::find($id);
        if (!$p) return response()->json(['message' => 'Produto não encontrado'], 404);
        $p->quantidade_estoque = $data['quantidade_estoque'];
        $p->save();
        return response()->json($p);
    }

    public function update(Request $req, string $id)
    {
        $p = Produto::find($id);
        if (!$p) return response()->json(['message' => 'Produto não encontrado'], 404);
        $data = $req->validate([
            'codigo' => 'sometimes|string',
            'nome' => 'sometimes|string',
            'data_entrada' => 'nullable|date',
            'validade' => 'nullable|date',
            'valor_compra' => 'nullable|numeric',
            'valor_venda' => 'nullable|numeric|min:0',
            'quantidade_estoque' => 'nullable|integer|min:0',
            'foto_url' => 'nullable|url',
        ]);
        $p->fill($data);
        $p->save();
        return response()->json($p);
    }

    public function destroy(string $id)
    {
        $p = Produto::find($id);
        if (!$p) return response()->json(['message' => 'Produto não encontrado'], 404);
        $p->delete();
        return response()->json(['message' => 'Produto excluído']);
    }
}
