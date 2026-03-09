<?php

if (!function_exists('module_config')) {
    /**
     * Read a value from a module's config.json.
     *
     * string $module - The name of the module
     * string $key - The key to the value in the config.json
     *
     * return mixed - The value of the key
     */
    function module_config(string $module, ?string $key = null): mixed
    {
        $file = module_path($module, 'config.json');

        if (!file_exists($file)) {
            return $key ? null : [];
        }

        $config = json_decode(file_get_contents($file), true) ?? [];

        return $key ? ($config[$key] ?? null) : $config;
    }
}
