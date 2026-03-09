<?php

if (!function_exists('module_enabled')) {
    /**
     * Check whether a module is marked as enabled in its config.json.
     *
     * string $module - The name of the module
     *
     * return bool - Whether the module is enabled
     */
    function module_enabled(string $module): bool
    {
        return (bool) module_config($module, 'enabled');
    }
}
