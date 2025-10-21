<?php

namespace App\Http\Controllers;

use App\Models\Boleto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BoletosController extends Controller
{
    public function index(Request $req)
    {
        $q = Boleto::query();
        if ($req->query('pendentes')) {
            $q->where('pago', false);
        }
        return $q->orderBy('vencimento')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'descricao' => 'required|string',
            'fornecedor' => 'nullable|string',
            'valor' => 'required|numeric|min:0',
            'vencimento' => 'required|date',
        ]);

        $b = Boleto::create([
            'id' => (string) Str::uuid(),
            'descricao' => $data['descricao'],
            'fornecedor' => $data['fornecedor'] ?? null,
            'valor' => $data['valor'],
            'vencimento' => $data['vencimento'],
            'pago' => false,
            'funcionario_id' => $req->user()->id,
        ]);

        return response()->json($b, 201);
    }

    public function pagar(string $id)
    {
        $b = Boleto::find($id);
        if (!$b) return response()->json(['message' => 'Boleto não encontrado'], 404);
        $b->pago = true;
        $b->save();
        return response()->json($b);
    }

    public function destroy(string $id)
    {
        $b = Boleto::find($id);
        if (!$b) return response()->json(['message' => 'Boleto não encontrado'], 404);
        $b->delete();
        return response()->json(['message' => 'Boleto excluído']);
    }
}

