<?php

if (!function_exists('modules_path')) {
    /**
     * Absolute path to the modules directory or a file inside it.
     *
     * string $path - Optional path relative to the modules directory
     *
     * return string - The absolute path
     */
    function modules_path(string $path = ''): string
    {
        $base = base_path('modules');

        return $path !== '' ? $base . '/' . ltrim($path, '/') : $base;
    }
}
