<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Venda extends Model
{
    use HasUuids;

    protected $table = 'app_vendas';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'funcionario_id',
        'cliente_id',
        'data_hora',
        'total',
        'tipo_pagamento',
        'observacao'
    ];

    public function itens()
    {
        return $this->hasMany(VendaItem::class, 'venda_id');
    }
}
