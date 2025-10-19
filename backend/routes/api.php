<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProdutosController;
use App\Http\Controllers\ClientesController;
use App\Http\Controllers\VendasController;
use App\Http\Controllers\CaixaController;
use App\Http\Controllers\DivergenciasController;


Route::get('/health', fn() => response()->json(['ok' => true]));

Route::post('/auth/funcionario/login', [AuthController::class, 'loginFuncionario']);
Route::post('/auth/admin/login', [AuthController::class, 'loginAdmin']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/produtos', [ProdutosController::class, 'index']);
    Route::post('/produtos', [ProdutosController::class, 'store'])->middleware('role:ADMIN');

    Route::get('/clientes', [ClientesController::class, 'index']);
    Route::post('/clientes', [ClientesController::class, 'store']);
    Route::get('/clientes/{id}/compras', [ClientesController::class, 'compras']);
    Route::get('/clientes/{id}/saldo', [ClientesController::class, 'saldo']);

    Route::get('/relatorios/vendas/dia', [VendasController::class, 'doDia']);
    Route::get('/relatorios/vendas/por-funcionario', [VendasController::class, 'porFuncionario'])->middleware('role:ADMIN');
    Route::post('/vendas', [VendasController::class, 'store']);

    Route::post('/caixa/abrir', [CaixaController::class, 'abrir']);
    Route::post('/caixa/fechar', [CaixaController::class, 'fechar']);

    Route::get('/divergencias', [DivergenciasController::class, 'index'])->middleware('role:ADMIN');
    Route::post('/divergencias', [DivergenciasController::class, 'store']);
});
