<?php

if (!function_exists('module_path')) {
    /**
     * Absolute path to a file inside a specific module.
     *
     * string $module - The name of the module
     * string $path - The path to the file inside the module
     *
     * return string - The absolute path to the file
     */
    function module_path(string $module, string $path = ''): string
    {
        $base = base_path('modules/' . $module);

        return $path !== '' ? $base . '/' . ltrim($path, '/') : $base;
    }
}
