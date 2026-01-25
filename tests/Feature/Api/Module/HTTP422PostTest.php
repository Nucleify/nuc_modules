<?php

if (!defined('PEST_RUNNING')) {
    return;
}

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > POST', function (): void {
    apiTestArray([
        // NAME
        'name > empty string' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['name' => '']),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > empty array' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['name' => []]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > false' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['name' => false]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],
        'name > true' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['name' => true]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],
        'name > integer' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['name' => 1]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],

        // DESCRIPTION
        'description > integer' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['description' => 12345]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],
        'description > false' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['description' => false]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],
        'description > true' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['description' => true]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],

        // CATEGORY
        'category > empty array' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['category' => []]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > null' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['category' => null]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > true' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['category' => true]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > false' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['category' => false]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],

        // VERSION
        'version > empty array' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['version' => []]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field is required.']]],
        ],
        'version > float' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['version' => 1.1]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],
        'version > true' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['version' => true]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],
        'version > false' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['version' => false]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],

        // ENABLED
        'enabled > string' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['enabled' => 'string']),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field must be true or false.']]],
        ],
        'enabled > empty string' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['enabled' => '']),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],
        'enabled > empty array' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['enabled' => []]),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],
        'enabled > null' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['enabled' => null]),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],

        // INSTALLED
        'installed > string' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['installed' => 'string']),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field must be true or false.']]],
        ],
        'installed > empty string' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['installed' => '']),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
        'installed > empty array' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['installed' => []]),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
        'installed > null' => [
            'method' => 'POST',
            'route' => 'modules.store',
            'status' => 422,
            'data' => array_merge(moduleData, ['installed' => null]),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
    ]);
});
