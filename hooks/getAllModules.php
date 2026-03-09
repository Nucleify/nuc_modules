<?php

if (!function_exists('getAllModules')) {
    function getAllModules(): array
    {
        if (!function_exists('modules_path') || !is_dir(modules_path())) {
            return [];
        }

        $modules = [];

        foreach (glob(modules_path('*'), GLOB_ONLYDIR) ?: [] as $moduleDir) {
            $name = basename($moduleDir);
            $config = function_exists('module_config') ? module_config($name) : [];

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
