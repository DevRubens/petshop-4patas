<?php

namespace App\Http\Controllers;

use App\Models\Divergencia;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DivergenciasController extends Controller
{
    public function index()
    {
        return Divergencia::orderBy('data_hora', 'desc')->paginate(50);
    }

    public function store(Request $req)
    {
        $data = $req->validate([
            'descricao' => 'required|string|min:5|max:2000',
        ]);
        $d = Divergencia::create([
            'id' => (string) Str::uuid(),
            'funcionario_id' => $req->user()->id,
            'descricao' => $data['descricao'],
        ]);
        return response()->json($d, 201);
    }
}
