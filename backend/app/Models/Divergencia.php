<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Divergencia extends Model
{
    use HasUuids;

    protected $table = 'app_divergencias';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['funcionario_id', 'data_hora', 'descricao', 'resolvida', 'nota_admin'];
}
