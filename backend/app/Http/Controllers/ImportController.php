<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    // Importa produtos a partir de arquivo .sql (INSERTs) ou CSV simples (codigo;nome;valor_venda;estoque)
    public function produtos(Request $req)
    {
        $req->validate(['file' => 'required|file']);
        $content = file_get_contents($req->file('file')->getPathname());
        $added = 0;

        // Tenta CSV (separador ; ou ,)
        $lines = preg_split('/\r?\n/', trim($content));
        foreach ($lines as $line) {
            if (preg_match('/^(codigo|code)/i', $line)) continue; // header
            $parts = preg_split('/[;,\t]/', $line);
            if (count($parts) >= 2 && !str_contains($line, 'INSERT')) {
                $codigo = trim($parts[0]);
                $nome = trim($parts[1]);
                $valor = isset($parts[2]) ? floatval(str_replace([','], ['.'], preg_replace('/[^0-9,\.]/', '', $parts[2]))) : 0;
                $estoque = isset($parts[3]) ? intval($parts[3]) : 0;
                if ($codigo && $nome) {
                    Produto::updateOrCreate(['codigo' => $codigo], [
                        'nome' => $nome,
                        'valor_venda' => $valor,
                        'quantidade_estoque' => $estoque,
                    ]);
                    $added++;
                }
            }
        }

        // Tenta parsear INSERTs
        if ($added === 0 && str_contains($content, 'INSERT')) {
            $regex = '/INSERT\s+INTO\s+[^\(]*\(([^\)]+)\)\s+VALUES\s*(.+);/isU';
            if (preg_match_all($regex, $content, $matches)) {
                foreach ($matches[0] as $i => $_) {
                    $cols = array_map('trim', explode(',', str_replace('`', '', $matches[1][$i])));
                    $valuesChunk = $matches[2][$i];
                    // separa cada tupla de values
                    preg_match_all('/\(([^\)]*)\)/', $valuesChunk, $rows);
                    foreach ($rows[1] as $rowStr) {
                        $vals = preg_split('/,(?=(?:[^\']*\'[^\']*\')*[^\']*$)/', $rowStr);
                        $map = [];
                        foreach ($cols as $k => $col) {
                            $val = trim($vals[$k] ?? '');
                            $val = trim($val, "'\"");
                            $map[$col] = $val;
                        }
                        $codigo = $map['codigo'] ?? ($map['code'] ?? null);
                        $nome = $map['nome'] ?? ($map['name'] ?? null);
                        $valor = isset($map['valor_venda']) ? floatval(str_replace(',', '.', $map['valor_venda'])) : 0;
                        $estoque = intval($map['quantidade_estoque'] ?? ($map['estoque'] ?? 0));
                        if ($codigo && $nome) {
                            Produto::updateOrCreate(['codigo' => $codigo], [
                                'nome' => $nome,
                                'valor_venda' => $valor,
                                'quantidade_estoque' => $estoque,
                            ]);
                            $added++;
                        }
                    }
                }
            }
        }

        return response()->json(['importados' => $added]);
    }
}

