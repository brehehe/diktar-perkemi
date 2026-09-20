<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Digital Library File Upload Configuration
    |--------------------------------------------------------------------------
    |
    | Centralized settings for book files, private disk, and upload limits.
    |
    */

    'disk' => env('PUSTAKA_DISK', 'local'),

    'storage_path' => 'books',

    'max_file_size_kb' => (int) env('PUSTAKA_MAX_FILE_SIZE_KB', 51200), // 50 MB

    'allowed_mimes' => [
        'application/pdf',
    ],

    'allowed_extensions' => [
        'pdf',
    ],
];
