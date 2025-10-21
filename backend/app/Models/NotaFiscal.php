<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class NotaFiscal extends Model
{
    use HasUuids;

    protected $table = 'app_notas_fiscais';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'venda_id',
        'funcionario_id',
        'numero',
        'serie',
        'chave_acesso',
        'xml_url',
        'total',
        'data_emissao',
    ];
}

