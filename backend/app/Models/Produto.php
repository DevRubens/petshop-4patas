<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Produto extends Model
{
    use HasUuids;

    protected $table = 'app_produtos';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'codigo',
        'nome',
        'data_entrada',
        'validade',
        'valor_compra',
        'valor_venda',
        'quantidade_estoque'
    ];
}
