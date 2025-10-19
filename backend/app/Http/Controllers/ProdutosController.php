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
        ]);

        $p = Produto::create($data);
        return response()->json($p, 201);
    }
}
