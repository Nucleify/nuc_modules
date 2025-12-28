<?php

if (!defined('PEST_RUNNING')) {
    return;
}

uses()->group('module-service');

use App\Models\Module;
use App\Resources\ModuleResource;
use App\Services\ModuleService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\File;

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
    $this->service = app(ModuleService::class);
    $this->testModuleName = 'nuc_api';
    $this->configPath = base_path('modules/' . $this->testModuleName . '/config.json');
    $this->originalConfig = File::get($this->configPath);
});

afterEach(function (): void {
    File::put($this->configPath, $this->originalConfig);
});

describe('ModuleService', function (): void {
    describe('index', function (): void {
        test('returns collection of modules', function (): void {
            Module::factory(3)->create();

            $request = new \Illuminate\Http\Request;
            $result = $this->service->index($request);

            expect($result)->toBeInstanceOf(AnonymousResourceCollection::class);
        });
    });

    describe('show', function (): void {
        test('returns module resource by id', function (): void {
            $module = Module::factory()->create();

            $result = $this->service->show($module->id);

            expect($result)->toBeInstanceOf(ModuleResource::class);
        });

        test('throws exception for non-existent id', function (): void {
            $this->service->show(99999);
        })->throws(ModelNotFoundException::class);
    });

    describe('create', function (): void {
        test('creates new module', function (): void {
            $result = $this->service->create(moduleData);

            expect($result)->toBeInstanceOf(ModuleResource::class);
            $this->assertDatabaseHas('modules', ['name' => moduleData['name']]);
        });
    });

    describe('update', function (): void {
        test('updates existing module', function (): void {
            $module = Module::factory()->create();

            $result = $this->service->update($module->id, updatedModuleData);

            expect($result)->toBeInstanceOf(ModuleResource::class);
            $this->assertDatabaseHas('modules', ['name' => updatedModuleData['name']]);
        });
    });

    describe('toggle', function (): void {
        test('toggles enabled from true to false', function (): void {
            $config = json_decode(File::get($this->configPath), true);
            $config['enabled'] = true;
            File::put($this->configPath, json_encode($config, JSON_PRETTY_PRINT));

            $result = $this->service->toggle($this->testModuleName);

            expect($result)->toBeArray();
            expect($result['enabled'])->toBeFalse();
        });

        test('toggles enabled from false to true', function (): void {
            $config = json_decode(File::get($this->configPath), true);
            $config['enabled'] = false;
            File::put($this->configPath, json_encode($config, JSON_PRETTY_PRINT));

            $result = $this->service->toggle($this->testModuleName);

            expect($result)->toBeArray();
            expect($result['enabled'])->toBeTrue();
        });

        test('returns complete config array', function (): void {
            $result = $this->service->toggle($this->testModuleName);

            expect($result)
                ->toBeArray()
                ->toHaveKeys(['name', 'description', 'version', 'category', 'installed', 'enabled']);
        });

        test('persists changes to config file', function (): void {
            $originalConfig = json_decode(File::get($this->configPath), true);
            $originalEnabled = $originalConfig['enabled'];

            $this->service->toggle($this->testModuleName);

            $newConfig = json_decode(File::get($this->configPath), true);
            expect($newConfig['enabled'])->toBe(!$originalEnabled);
        });

        test('throws exception for non-existent module', function (): void {
            $this->service->toggle('non_existent_module');
        })->throws(Exception::class, 'Module config file not found: non_existent_module');

        test('preserves config file formatting with 2 spaces', function (): void {
            $this->service->toggle($this->testModuleName);

            $content = File::get($this->configPath);

            expect($content)->toContain('  "name"');
            expect($content)->not->toContain('    "name"');
        });

        test('preserves trailing newline in config file', function (): void {
            $this->service->toggle($this->testModuleName);

            $content = File::get($this->configPath);

            expect(str_ends_with($content, "\n"))->toBeTrue();
        });

        test('preserves other config properties after toggle', function (): void {
            $originalConfig = json_decode(File::get($this->configPath), true);

            $result = $this->service->toggle($this->testModuleName);

            expect($result['name'])->toBe($originalConfig['name']);
            expect($result['description'])->toBe($originalConfig['description']);
            expect($result['version'])->toBe($originalConfig['version']);
            expect($result['category'])->toBe($originalConfig['category']);
        });

        test('handles missing enabled field by defaulting to true then toggling to false', function (): void {
            $config = json_decode(File::get($this->configPath), true);
            unset($config['enabled']);
            File::put($this->configPath, json_encode($config, JSON_PRETTY_PRINT));

            $result = $this->service->toggle($this->testModuleName);

            expect($result['enabled'])->toBeFalse();
        });
    });

    describe('delete', function (): void {
        test('deletes existing module', function (): void {
            $module = Module::factory()->create();

            $this->service->delete($module->id);

            $this->assertDatabaseMissing('modules', ['id' => $module->id]);
        });
    });
});
