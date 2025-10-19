<?php

namespace App\Http\Controllers;

use App\Models\CaixaAbertura;
use App\Models\CaixaFechamento;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CaixaController extends Controller
{
    public function abrir(Request $req)
    {
        $data = $req->validate([
            'valor_inicial' => 'numeric|min:0',
            'observacao' => 'nullable|string',
        ]);

        DB::update("UPDATE app_caixa_aberturas SET aberto=0 WHERE funcionario_id=? AND aberto=1", [$req->user()->id]);

        $ab = CaixaAbertura::create([
            'id' => (string) Str::uuid(),
            'funcionario_id' => $req->user()->id,
            'valor_inicial'  => $data['valor_inicial'] ?? 0,
            'observacao'     => $data['observacao'] ?? null,
            'aberto'         => 1,
        ]);

        return response()->json($ab, 201);
    }

    public function fechar(Request $req)
    {
        $data = $req->validate([
            'valor_final' => 'numeric|min:0',
            'observacao' => 'nullable|string',
        ]);

        $aberta = DB::selectOne(
            "SELECT * FROM app_caixa_aberturas WHERE funcionario_id=? AND aberto=1 ORDER BY data_hora_abertura DESC LIMIT 1",
            [$req->user()->id]
        );

        if (!$aberta) return response()->json(['message' => 'Sem caixa aberto'], 409);

        $fe = CaixaFechamento::create([
            'id' => (string) Str::uuid(),
            'abertura_id'   => $aberta->id,
            'funcionario_id' => $req->user()->id,
            'valor_final'   => $data['valor_final'] ?? 0,
            'observacao'    => $data['observacao'] ?? null,
        ]);

        DB::update("UPDATE app_caixa_aberturas SET aberto=0 WHERE id=?", [$aberta->id]);

        return response()->json($fe, 201);
    }
}
