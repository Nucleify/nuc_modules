<?php

if (!defined('PEST_RUNNING')) {
    return;
}

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('302', function (): void {
    apiTestArray([
        'put > show api' => [
            'method' => 'PUT',
            'route' => 'modules.show',
            'status' => 302,
            'id' => 1,
            'json' => false,
        ],
        'put > update api' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 302,
            'id' => 1,
            'json' => false,
        ],
        'put > delete api' => [
            'method' => 'PUT',
            'route' => 'modules.destroy',
            'status' => 302,
            'id' => 1,
            'json' => false,
        ],
    ]);
});
