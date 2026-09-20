<?php

namespace App\Services;

class MaterialSourceService
{
    /**
     * Parse and validate video URL for supported providers (YouTube, YouTube Shorts, Vimeo).
     *
     * @return array{provider: string, video_id: string, embed_url: string}|null
     */
    public static function parseVideoUrl(?string $url): ?array
    {
        if (empty($url)) {
            return null;
        }

        $url = trim($url);

        // Disallow dangerous schemes or HTML tags
        if (preg_match('/<[^>]+>/', $url) || ! preg_match('/^https?:\/\//i', $url)) {
            return null;
        }

        $parts = parse_url($url);
        if (! isset($parts['host'])) {
            return null;
        }

        $host = strtolower($parts['host']);
        $path = $parts['path'] ?? '';
        $query = [];
        if (isset($parts['query'])) {
            parse_str($parts['query'], $query);
        }

        // 1. YouTube Shorts
        if (in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com'], true) && str_starts_with($path, '/shorts/')) {
            $videoId = trim(substr($path, 8), '/');
            if (preg_match('/^[a-zA-Z0-9_-]{6,15}$/', $videoId)) {
                return [
                    'provider' => 'youtube_shorts',
                    'video_id' => $videoId,
                    'embed_url' => "https://www.youtube-nocookie.com/embed/{$videoId}?rel=0&modestbranding=1",
                ];
            }
        }

        // 2. Standard YouTube
        if (in_array($host, ['youtube.com', 'www.youtube.com', 'm.youtube.com'], true)) {
            $videoId = $query['v'] ?? null;
            if (! $videoId && str_starts_with($path, '/embed/')) {
                $videoId = trim(substr($path, 7), '/');
            }

            if ($videoId && preg_match('/^[a-zA-Z0-9_-]{6,15}$/', $videoId)) {
                return [
                    'provider' => 'youtube',
                    'video_id' => $videoId,
                    'embed_url' => "https://www.youtube-nocookie.com/embed/{$videoId}?rel=0&modestbranding=1",
                ];
            }
        }

        // 3. YouTube Shortlink (youtu.be)
        if ($host === 'youtu.be') {
            $videoId = trim($path, '/');
            if ($videoId && preg_match('/^[a-zA-Z0-9_-]{6,15}$/', $videoId)) {
                return [
                    'provider' => 'youtube',
                    'video_id' => $videoId,
                    'embed_url' => "https://www.youtube-nocookie.com/embed/{$videoId}?rel=0&modestbranding=1",
                ];
            }
        }

        // 4. Vimeo
        if (in_array($host, ['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'], true)) {
            $videoId = null;
            if (str_starts_with($path, '/video/')) {
                $videoId = trim(substr($path, 7), '/');
            } else {
                $segments = array_values(array_filter(explode('/', $path)));
                $lastSegment = end($segments);
                if (is_numeric($lastSegment)) {
                    $videoId = $lastSegment;
                }
            }

            if ($videoId && is_numeric($videoId)) {
                return [
                    'provider' => 'vimeo',
                    'video_id' => (string) $videoId,
                    'embed_url' => "https://player.vimeo.com/video/{$videoId}?dnt=1&app_id=122963",
                ];
            }
        }

        return null;
    }

    /**
     * Validate external URL for safety:
     * - Must use HTTPS
     * - Must not be localhost or private IP addresses
     * - Must not contain raw HTML or javascript: schemes
     */
    public static function isValidExternalUrl(?string $url): bool
    {
        if (empty($url)) {
            return false;
        }

        $url = trim($url);

        // Reject raw html/scripts
        if (preg_match('/<[^>]+>/', $url) || stripos($url, 'javascript:') !== false) {
            return false;
        }

        // Strictly enforce https://
        if (! str_starts_with(strtolower($url), 'https://')) {
            return false;
        }

        $parts = parse_url($url);
        if (! isset($parts['host'])) {
            return false;
        }

        $host = strtolower($parts['host']);

        // Reject localhost, local domain, or loopback
        if ($host === 'localhost' || str_ends_with($host, '.local') || str_ends_with($host, '.test') || str_ends_with($host, '.invalid')) {
            return false;
        }

        // Check for IPv4 addresses
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            if (
                ! filter_var(
                    $host,
                    FILTER_VALIDATE_IP,
                    FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
                )
            ) {
                return false;
            }
        }

        // Check for IPv6 addresses
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            if (
                ! filter_var(
                    $host,
                    FILTER_VALIDATE_IP,
                    FILTER_FLAG_IPV6 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
                )
            ) {
                return false;
            }
        }

        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
}
