<?php

use App\Services\ActivityLogger;

if (! function_exists('activity')) {
    /**
     * Spatie-compatible activity logging helper.
     */
    function activity(?string $logName = null): ActivityLogger
    {
        $logger = new ActivityLogger;

        return $logger->useLog($logName);
    }
}
