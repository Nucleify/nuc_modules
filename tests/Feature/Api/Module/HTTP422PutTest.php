<?php

if (!defined('PEST_RUNNING')) {
    return;
}

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > PUT', function (): void {
    apiTestArray([
        // NAME
        'name > empty string' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['name' => '']),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > empty array' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['name' => []]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field is required.']]],
        ],
        'name > false' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['name' => false]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],
        'name > true' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['name' => true]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],
        'name > integer' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['name' => 1]),
            'structure' => ['errors' => ['name']],
            'fragment' => ['errors' => ['name' => ['The name field must be a string.']]],
        ],

        // DESCRIPTION
        'description > integer' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['description' => 12345]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],
        'description > false' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['description' => false]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],
        'description > true' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['description' => true]),
            'structure' => ['errors' => ['description']],
            'fragment' => ['errors' => ['description' => ['The description field must be a string.']]],
        ],

        // CATEGORY
        'category > empty array' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['category' => []]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > null' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['category' => null]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > true' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['category' => true]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],
        'category > false' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['category' => false]),
            'structure' => ['errors' => ['category']],
            'fragment' => ['errors' => ['category' => ['The category field must be a string.']]],
        ],

        // VERSION
        'version > empty array' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['version' => []]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field is required.']]],
        ],
        'version > float' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['version' => 1.1]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],
        'version > true' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['version' => true]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],
        'version > false' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['version' => false]),
            'structure' => ['errors' => ['version']],
            'fragment' => ['errors' => ['version' => ['The version field must be a string.']]],
        ],

        // ENABLED
        'enabled > string' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['enabled' => 'string']),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field must be true or false.']]],
        ],
        'enabled > empty string' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['enabled' => '']),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],
        'enabled > empty array' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['enabled' => []]),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],
        'enabled > null' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['enabled' => null]),
            'structure' => ['errors' => ['enabled']],
            'fragment' => ['errors' => ['enabled' => ['The enabled field is required.']]],
        ],

        // INSTALLED
        'installed > string' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['installed' => 'string']),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field must be true or false.']]],
        ],
        'installed > empty string' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['installed' => '']),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
        'installed > empty array' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['installed' => []]),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
        'installed > null' => [
            'method' => 'PUT',
            'route' => 'modules.update',
            'status' => 422,
            'id' => 1,
            'data' => array_merge(updatedModuleData, ['installed' => null]),
            'structure' => ['errors' => ['installed']],
            'fragment' => ['errors' => ['installed' => ['The installed field is required.']]],
        ],
    ]);
});
