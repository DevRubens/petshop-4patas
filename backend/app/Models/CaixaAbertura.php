<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CaixaAbertura extends Model
{
    use HasUuids;

    protected $table = 'app_caixa_aberturas';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['funcionario_id', 'data_hora_abertura', 'valor_inicial', 'observacao', 'aberto'];
}
