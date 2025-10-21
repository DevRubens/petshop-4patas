<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProdutosController;
use App\Http\Controllers\ClientesController;
use App\Http\Controllers\VendasController;
use App\Http\Controllers\CaixaController;
use App\Http\Controllers\NotasFiscaisController;
use App\Http\Controllers\DevolucoesController;
use App\Http\Controllers\UploadsController;
use App\Http\Controllers\BoletosController;
use App\Http\Controllers\AlertasController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\DivergenciasController;

Route::get('/health', fn() => response()->json(['ok' => true]));

Route::post('/auth/funcionario/login', [AuthController::class, 'loginFuncionario'])->middleware('throttle:10,1');
Route::post('/auth/admin/login', [AuthController::class, 'loginAdmin'])->middleware('throttle:10,1');

Route::post('/auth/admin/register', [AuthController::class, 'registerAdmin']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/auth/funcionario/register', [AuthController::class, 'registerFuncionario'])
        ->middleware('role:ADMIN');

    Route::get('/auth/funcionarios', [AuthController::class, 'listFuncionarios'])
        ->middleware('role:ADMIN');

    Route::put('/auth/admin/password', [AuthController::class, 'updateAdminPassword'])
        ->middleware('role:ADMIN');

    Route::put('/auth/funcionarios/{id}/password', [AuthController::class, 'updateFuncionarioPassword'])
        ->middleware('role:ADMIN');

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/produtos', [ProdutosController::class, 'index']);
    Route::post('/produtos', [ProdutosController::class, 'store'])->middleware('role:ADMIN');
    Route::put('/produtos/{id}', [ProdutosController::class, 'update'])->middleware('role:ADMIN');
    Route::put('/produtos/{id}/estoque', [ProdutosController::class, 'updateEstoque'])->middleware('role:ADMIN');
    Route::delete('/produtos/{id}', [ProdutosController::class, 'destroy'])->middleware('role:ADMIN');

    Route::get('/clientes', [ClientesController::class, 'index']);
    Route::post('/clientes', [ClientesController::class, 'store']);
    Route::delete('/clientes/{id}', [ClientesController::class, 'destroy'])->middleware('role:ADMIN');
    Route::get('/clientes/{id}/compras', [ClientesController::class, 'compras']);
    Route::get('/clientes/{id}/saldo', [ClientesController::class, 'saldo']);

    Route::get('/relatorios/vendas/dia', [VendasController::class, 'doDia']);
    Route::get('/relatorios/vendas/dia-detalhado', [VendasController::class, 'doDiaDetalhado']);
    Route::get('/relatorios/vendas/por-funcionario', [VendasController::class, 'porFuncionario'])->middleware('role:ADMIN');

    Route::post('/vendas', [VendasController::class, 'store']);
    Route::post('/caixa/abrir', [CaixaController::class, 'abrir']);
    Route::post('/caixa/fechar', [CaixaController::class, 'fechar']);

    Route::get('/divergencias', [DivergenciasController::class, 'index'])->middleware('role:ADMIN');
    Route::post('/divergencias', [DivergenciasController::class, 'store']);

    Route::get('/notas-fiscais', [NotasFiscaisController::class, 'index']);
    Route::post('/notas-fiscais', [NotasFiscaisController::class, 'store']);

    Route::get('/devolucoes', [DevolucoesController::class, 'index']);
    Route::post('/devolucoes', [DevolucoesController::class, 'store']);

    // Usuários / fotos / funcionários
    Route::put('/auth/me/foto', [AuthController::class, 'updateMinhaFoto']);
    Route::put('/auth/usuarios/{id}/foto', [AuthController::class, 'updateUsuarioFoto'])->middleware('role:ADMIN');
    Route::delete('/auth/funcionarios/{id}', [AuthController::class, 'deleteFuncionario'])->middleware('role:ADMIN');

    // Uploads genéricos
    Route::post('/uploads', [UploadsController::class, 'store']);

    // Boletos e alertas
    Route::get('/boletos', [BoletosController::class, 'index'])->middleware('role:ADMIN');
    Route::post('/boletos', [BoletosController::class, 'store'])->middleware('role:ADMIN');
    Route::put('/boletos/{id}/pagar', [BoletosController::class, 'pagar'])->middleware('role:ADMIN');
    Route::delete('/boletos/{id}', [BoletosController::class, 'destroy'])->middleware('role:ADMIN');
    Route::get('/alertas', [AlertasController::class, 'index']);

    // Importações
    Route::post('/import/produtos', [ImportController::class, 'produtos'])->middleware('role:ADMIN');
});
