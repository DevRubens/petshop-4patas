<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function createApplication(): Application
    {
        return require __DIR__ . '/../bootstrap/app.php';
    }
}
