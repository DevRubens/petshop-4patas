<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadsController extends Controller
{
    public function store(Request $req)
    {
        $req->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
            'folder' => 'nullable|string',
        ]);

        $file = $req->file('file');
        $folder = trim($req->input('folder', 'uploads'), '/');
        $name = Str::uuid()->toString() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("public/{$folder}", $name);

        // URL pública absoluta (evita falha de validação 'url')
        $url = asset(Storage::url($path)); // requires storage:link

        return response()->json([
            'path' => $path,
            'url'  => $url,
        ], 201);
    }
}
