<?php

if (!defined('PEST_RUNNING')) {
    return;
}

beforeEach(function (): void {
    $this->createUsers();
    $this->actingAs($this->admin);
});

describe('422 > PATCH', function ($toggleData = ['name' => 'nuc_api']) {

    /**
     * NAME
     */
    $toggleData['name'] = '';
    test('name > empty string', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    $toggleData['name'] = [];
    test('name > empty array', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    $toggleData['name'] = false;
    test('name > false', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    $toggleData['name'] = true;
    test('name > true', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    $toggleData['name'] = 1;
    test('name > integer', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });

    unset($toggleData['name']);
    test('name > missing', function () use ($toggleData) {
        $this->patchJson(route('modules.toggle'), $toggleData)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    });
});
