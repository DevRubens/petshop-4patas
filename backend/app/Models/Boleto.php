<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Boleto extends Model
{
    use HasUuids;

    protected $table = 'app_boletos';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'descricao', 'fornecedor', 'valor', 'vencimento', 'pago', 'funcionario_id'
    ];
}

