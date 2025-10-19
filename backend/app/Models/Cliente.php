<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Cliente extends Model
{
    use HasUuids;

    protected $table = 'app_clientes';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['nome', 'telefone', 'endereco', 'referencia', 'especial'];
}
