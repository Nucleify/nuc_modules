<?php

use Illuminate\Support\Facades\Route;

/**
 *  Serve module content files (MDX, etc.)
 */
Route::get('/modules/{module}/content/{category}/{file}', function ($module, $category, $file) {
    $path = base_path("modules/{$module}/content/{$category}/{$file}");

    if (!file_exists($path)) {
        return response()->json(['error' => 'File not found'], 404);
    }

    $extension = pathinfo($file, PATHINFO_EXTENSION);
    $mimeType = match ($extension) {
        'mdx', 'md' => 'text/plain',
        'json' => 'application/json',
        default => 'text/plain'
    };

    return response()->file($path, [
        'Content-Type' => $mimeType,
        'Access-Control-Allow-Origin' => '*',
    ]);
})->where('module', '[a-z_]+')->where('category', '[a-z-]+')->where('file', '.+');
