<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AlertasController extends Controller
{
    public function index()
    {
        $boletoPrazoDias = 7;
        $validadePrazoDias = 30;
        $estoqueBaixo = 5;

        $qBoletos = DB::table('app_boletos')
            ->where('pago', false)
            ->whereBetween('vencimento', [now()->toDateString(), now()->addDays($boletoPrazoDias)->toDateString()]);

        $qVencendo = DB::table('app_produtos')
            ->whereNotNull('validade')
            ->whereBetween('validade', [now()->toDateString(), now()->addDays($validadePrazoDias)->toDateString()]);

        $qBaixo = DB::table('app_produtos')
            ->where('quantidade_estoque', '<=', $estoqueBaixo);

        $detalhes = request()->boolean('detalhes');

        $boletosVencendo = $detalhes ? $qBoletos->orderBy('vencimento')->get(['id','descricao','vencimento','valor']) : $qBoletos->count();
        $produtosVencendo = $detalhes ? $qVencendo->orderBy('validade')->get(['id','nome','validade','codigo']) : $qVencendo->count();
        $produtosBaixoEstoque = $detalhes ? $qBaixo->orderBy('quantidade_estoque')->get(['id','nome','quantidade_estoque','codigo']) : $qBaixo->count();

        $counts = [
            'boletosVencendo' => $detalhes ? count($boletosVencendo) : $boletosVencendo,
            'produtosVencendo' => $detalhes ? count($produtosVencendo) : $produtosVencendo,
            'produtosBaixoEstoque' => $detalhes ? count($produtosBaixoEstoque) : $produtosBaixoEstoque,
        ];

        $payload = $counts + ['total' => $counts['boletosVencendo'] + $counts['produtosVencendo'] + $counts['produtosBaixoEstoque']];
        if ($detalhes) {
            $payload['boletos'] = $boletosVencendo;
            $payload['produtos_validade'] = $produtosVencendo;
            $payload['produtos_baixo_estoque'] = $produtosBaixoEstoque;
        }

        return response()->json($payload);
    }
}
