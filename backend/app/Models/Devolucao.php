<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Devolucao extends Model
{
    use HasUuids;

    protected $table = 'app_devolucoes';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'venda_id',
        'produto_id',
        'funcionario_id',
        'quantidade',
        'motivo',
        'data_hora',
    ];
}

