<?php

if (!function_exists('getAllModules')) {
    function getAllModules(): array
    {
        if (!is_dir(module_path())) {
            return [];
        }

        $modules = [];

        foreach (glob(module_path('*'), GLOB_ONLYDIR) ?: [] as $moduleDir) {
            $name = basename($moduleDir);
            $config = module_config($name);

            $modules[$name] = !empty($config)
                ? $config
                : ['name' => $name, 'description' => 'Config file missing or invalid'];
        }

        return $modules;
    }

    try {
        $result = getAllModules();

        return is_array($result) ? $result : [];
    } catch (Exception $e) {
        return [];
    }
}
