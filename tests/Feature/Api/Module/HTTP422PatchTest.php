<?php

if (!defined('PEST_RUNNING')) {
    return;
}

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > PATCH', function (): void {
    apiTestArray([
        'name > empty string' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => ['name' => ''],
            'errors' => ['name'],
        ],
        'name > empty array' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => ['name' => []],
            'errors' => ['name'],
        ],
        'name > false' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => ['name' => false],
            'errors' => ['name'],
        ],
        'name > true' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => ['name' => true],
            'errors' => ['name'],
        ],
        'name > integer' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => ['name' => 1],
            'errors' => ['name'],
        ],
        'name > missing' => [
            'method' => 'PATCH',
            'route' => 'modules.toggle',
            'status' => 422,
            'data' => [],
            'errors' => ['name'],
        ],
    ]);
});
