<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('module-installer-api-302');
uses()->group('api-302');

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('302', function (): void {
    apiTestArray([
        'post > install api' => [
            'method' => 'POST',
            'route' => 'modules.install',
            'status' => 302,
            'json' => false,
        ],
        'put > install api' => [
            'method' => 'PUT',
            'route' => 'modules.install',
            'status' => 302,
            'json' => false,
        ],
        'post > uninstall api' => [
            'method' => 'POST',
            'route' => 'modules.uninstall',
            'status' => 302,
            'json' => false,
        ],
        'put > uninstall api' => [
            'method' => 'PUT',
            'route' => 'modules.uninstall',
            'status' => 302,
            'json' => false,
        ],
    ]);
});
