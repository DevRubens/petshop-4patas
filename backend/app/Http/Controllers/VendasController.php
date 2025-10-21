<?php

namespace App\Http\Controllers;

use App\Models\Venda;
use App\Models\VendaItem;
use App\Models\Cliente;
use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VendasController extends Controller
{
    public function doDia()
    {
        $rows = DB::select("
          SELECT v.id, v.data_hora, v.total, v.tipo_pagamento,
                 u.nome AS funcionario, c.nome AS cliente
            FROM app_vendas v
            JOIN app_usuarios u ON u.id = v.funcionario_id
       LEFT JOIN app_clientes c ON c.id = v.cliente_id
           WHERE DATE(v.data_hora) = CURDATE()
        ORDER BY v.data_hora DESC
        ");
        return response()->json($rows);
    }

    public function porFuncionario()
    {
        $rows = DB::select("
          SELECT u.id AS funcionario_id, u.nome AS funcionario,
                 COUNT(v.id) AS qtd_vendas,
                 COALESCE(SUM(v.total),0) AS total_vendido
            FROM app_usuarios u
       LEFT JOIN app_vendas v ON v.funcionario_id = u.id
           WHERE u.role = 'FUNCIONARIO'
        GROUP BY u.id, u.nome
        ORDER BY total_vendido DESC
        ");
        return response()->json($rows);
    }

    public function doDiaDetalhado(\Illuminate\Http\Request $req)
    {
        $q = DB::table('app_vendas as v')
            ->leftJoin('app_clientes as c', 'c.id', '=', 'v.cliente_id')
            ->join('app_venda_itens as i', 'i.venda_id', '=', 'v.id')
            ->join('app_produtos as p', 'p.id', '=', 'i.produto_id')
            ->whereRaw('DATE(v.data_hora) = CURDATE()');

        if ($req->filled('q')) {
            $s = '%' . $req->query('q') . '%';
            $q->where(function ($w) use ($s) {
                $w->where('c.nome', 'like', $s)
                    ->orWhere('c.telefone', 'like', $s)
                    ->orWhere('c.endereco', 'like', $s);
            });
        }
        if ($req->filled('pagamento')) {
            $q->where('v.tipo_pagamento', $req->query('pagamento'));
        }

        $rows = $q->select([
                'v.id', 'v.data_hora', 'v.total', 'v.tipo_pagamento',
                'c.nome as cliente_nome', 'c.telefone', 'c.endereco',
                DB::raw("GROUP_CONCAT(CONCAT(p.nome,' x',i.quantidade) SEPARATOR '; ') as itens")
            ])
            ->groupBy('v.id', 'v.data_hora', 'v.total', 'v.tipo_pagamento', 'c.nome', 'c.telefone', 'c.endereco')
            ->orderByDesc('v.data_hora')
            ->get();

        return response()->json($rows);
    }
    public function store(Request $req)
    {
        $data = $req->validate([
            'cliente_id' => 'nullable|uuid',
            'tipo_pagamento' => 'required|in:DINHEIRO,PIX,CARTAO_DEBITO,CARTAO_CREDITO,CREDITO_CLIENTE,OUTRO',
            'observacao' => 'nullable|string',
            'itens' => 'required|array|min:1',
            'itens.*.produto_id' => 'required|uuid',
            'itens.*.quantidade' => 'required|integer|min:1',
            'itens.*.valor_unitario' => 'required|numeric|min:0',
        ]);

        $funcionarioId = $req->user()->id;

        return DB::transaction(function () use ($data, $funcionarioId) {
            if ($data['tipo_pagamento'] === 'CREDITO_CLIENTE') {
                if (empty($data['cliente_id'])) {
                    abort(422, 'Venda a prazo requer cliente.');
                }
                $cli = Cliente::find($data['cliente_id']);
                if (!$cli || !$cli->especial) {
                    abort(422, 'Cliente não é especial (fiado).');
                }
            }

            $total = 0;
            $produtos = [];
            foreach ($data['itens'] as $it) {
                $p = Produto::lockForUpdate()->find($it['produto_id']);
                if (!$p) abort(422, "Produto {$it['produto_id']} não encontrado.");
                if ($p->quantidade_estoque < $it['quantidade']) {
                    abort(422, "Estoque insuficiente para {$p->nome}.");
                }
                $produtos[$it['produto_id']] = $p;
                $total += $it['quantidade'] * $it['valor_unitario'];
            }

            $venda = Venda::create([
                'id' => (string) Str::uuid(),
                'funcionario_id' => $funcionarioId,
                'cliente_id' => $data['cliente_id'] ?? null,
                'total' => $total,
                'tipo_pagamento' => $data['tipo_pagamento'],
                'observacao' => $data['observacao'] ?? null,
            ]);

            foreach ($data['itens'] as $it) {
                $p = $produtos[$it['produto_id']];
                VendaItem::create([
                    'id' => (string) Str::uuid(),
                    'venda_id' => $venda->id,
                    'produto_id' => $p->id,
                    'quantidade' => $it['quantidade'],
                    'valor_unitario' => $it['valor_unitario'],
                ]);
                $p->decrement('quantidade_estoque', $it['quantidade']);
            }

            if ($data['tipo_pagamento'] === 'CREDITO_CLIENTE' && !empty($data['cliente_id']) && $total > 0) {
                DB::table('app_clientes_credito_lancamentos')->insert([
                    'id' => (string) Str::uuid(),
                    'cliente_id' => $data['cliente_id'],
                    'venda_id'   => $venda->id,
                    'descricao'  => 'Venda a prazo',
                    'valor'      => $total,
                    'tipo'       => 'DEBITO',
                ]);
            }

            return response()->json([
                'venda' => $venda,
                'itens' => $venda->itens()->get(),
            ], 201);
        });
    }
}
