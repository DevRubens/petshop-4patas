<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CaixaFechamento extends Model
{
    use HasUuids;

    protected $table = 'app_caixa_fechamentos';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['abertura_id', 'funcionario_id', 'data_hora_fechamento', 'valor_final', 'observacao'];
}
