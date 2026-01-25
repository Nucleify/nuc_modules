<?php

if (!defined('PEST_RUNNING')) {
    return;
}

describe('405 > Unauthorized', function (): void {
    apiTestArray([
        'put > index api' => [
            'method' => 'PUT',
            'route' => 'modules.index',
            'status' => 405,
            'id' => 1,
            'json' => false,
        ],
        'put json > index api' => [
            'method' => 'PUT',
            'route' => 'modules.index',
            'status' => 405,
            'id' => 1,
        ],
        'delete > index api' => [
            'method' => 'DELETE',
            'route' => 'modules.index',
            'status' => 405,
            'id' => 1,
            'json' => false,
        ],
        'delete json > index api' => [
            'method' => 'DELETE',
            'route' => 'modules.index',
            'status' => 405,
            'id' => 1,
        ],
        'post json > show api' => [
            'method' => 'POST',
            'route' => 'modules.show',
            'status' => 405,
            'id' => 1,
        ],
        'put json > post api' => [
            'method' => 'PUT',
            'route' => 'modules.store',
            'status' => 405,
            'id' => 1,
        ],
        'delete json > post api' => [
            'method' => 'DELETE',
            'route' => 'modules.store',
            'status' => 405,
            'id' => 1,
        ],
        'post json > update api' => [
            'method' => 'POST',
            'route' => 'modules.update',
            'status' => 405,
            'id' => 1,
        ],
        'post > delete api' => [
            'method' => 'POST',
            'route' => 'modules.destroy',
            'status' => 405,
            'id' => 1,
            'json' => false,
        ],
        'post json > delete api' => [
            'method' => 'POST',
            'route' => 'modules.destroy',
            'status' => 405,
            'id' => 1,
        ],
    ]);
});
