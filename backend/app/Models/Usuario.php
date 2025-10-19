<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasUuids;

    protected $table = 'app_usuarios';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nome',
        'email',
        'senha_hash',
        'foto_url',
        'role',
        'ativo'
    ];

    public function getAuthPassword()
    {
        return $this->senha_hash;
    }
}
