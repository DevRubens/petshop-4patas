<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class VendaItem extends Model
{
    use HasUuids;

    protected $table = 'app_venda_itens';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['venda_id', 'produto_id', 'quantidade', 'valor_unitario'];
}
