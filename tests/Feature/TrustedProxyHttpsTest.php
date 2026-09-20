<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('cloudflare forwarded https request generates a secure login redirect', function () {
    $response = $this->withServerVariables([
        'REMOTE_ADDR' => '127.0.0.1',
        'HTTP_HOST' => 'internal-origin',
        'HTTP_X_FORWARDED_FOR' => '203.0.113.10',
        'HTTP_X_FORWARDED_HOST' => 'starkids.mediatamakreatif.id',
        'HTTP_X_FORWARDED_PORT' => '443',
        'HTTP_X_FORWARDED_PROTO' => 'https',
    ])->get('/admin/referensi-event');

    $response->assertRedirect('https://starkids.mediatamakreatif.id/login');
});
