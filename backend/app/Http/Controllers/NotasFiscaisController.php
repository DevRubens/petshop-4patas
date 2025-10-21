<?php

namespace App\Http\Controllers;

use App\Models\NotaFiscal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotasFiscaisController extends Controller
{
    public function index(Request $req)
    {
        $q = NotaFiscal::query();
        if ($s = $req->query('s')) {
            $q->where('numero', 'like', "%$s%")
              ->orWhere('chave_acesso', 'like', "%$s%");
        }
        return $q->orderByDesc('data_emissao')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'venda_id' => 'nullable|uuid',
            'numero' => 'required|string',
            'serie' => 'nullable|string',
            'chave_acesso' => 'nullable|string',
            'xml_url' => 'nullable|url',
            'total' => 'required|numeric|min:0',
            'data_emissao' => 'required|date',
        ]);

        $nf = NotaFiscal::create([
            'id' => (string) Str::uuid(),
            'venda_id' => $data['venda_id'] ?? null,
            'funcionario_id' => $req->user()->id,
            'numero' => $data['numero'],
            'serie' => $data['serie'] ?? null,
            'chave_acesso' => $data['chave_acesso'] ?? null,
            'xml_url' => $data['xml_url'] ?? null,
            'total' => $data['total'],
            'data_emissao' => $data['data_emissao'],
        ]);

        return response()->json($nf, 201);
    }
}

