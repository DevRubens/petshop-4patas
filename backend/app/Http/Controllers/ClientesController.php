<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ClientesController extends Controller
{
    public function index(Request $req)
    {
        $q = Cliente::query();
        if ($s = $req->query('s')) {
            $q->where('nome', 'like', "%$s%")
                ->orWhere('telefone', 'like', "%$s%");
        }
        return $q->orderBy('nome')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'nome' => 'required|string',
            'telefone' => 'nullable|string',
            'endereco' => 'nullable|string',
            'referencia' => 'nullable|string',
            'especial' => 'boolean'
        ]);
        $c = Cliente::create($data);
        return response()->json($c, 201);
    }

    public function compras($id)
    {
        $rows = DB::select("
            SELECT v.id as venda_id, v.data_hora, v.total, v.tipo_pagamento,
                   i.quantidade, i.valor_unitario, p.codigo, p.nome as produto
              FROM app_vendas v
              JOIN app_venda_itens i ON i.venda_id = v.id
              JOIN app_produtos p ON p.id = i.produto_id
             WHERE v.cliente_id = ?
             ORDER BY v.data_hora DESC
        ", [$id]);
        return response()->json($rows);
    }

    public function saldo($id)
    {
        $row = DB::selectOne("
            SELECT COALESCE(SUM(CASE WHEN tipo='DEBITO' THEN valor ELSE 0 END),0)
                 - COALESCE(SUM(CASE WHEN tipo='CREDITO' THEN valor ELSE 0 END),0) AS saldo_aberto
              FROM app_clientes_credito_lancamentos
             WHERE cliente_id = ?
        ", [$id]);

        return response()->json([
            'cliente_id' => $id,
            'saldo_aberto' => $row?->saldo_aberto ?? 0
        ]);
    }
}
