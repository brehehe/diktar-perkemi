<?php

namespace App\Services;

use App\Models\Participant;
use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ParticipantPhotoService
{
    /**
     * Store and auto-orient an uploaded participant photo.
     */
    public static function storePhoto(UploadedFile $file, int $participantId): string
    {
        $path = $file->store("participants/{$participantId}", 'public');

        self::normalizeRelativePath($path);

        return $path;
    }

    /**
     * Apply EXIF orientation to a GD image instance if needed.
     */
    public static function autoOrientGdImage(GdImage $gd, string $path): GdImage
    {
        if (! function_exists('exif_read_data') || ! file_exists($path) || ! is_readable($path)) {
            return $gd;
        }

        $exif = @exif_read_data($path);
        if (! is_array($exif) || empty($exif['Orientation'])) {
            return $gd;
        }

        $orientation = (int) $exif['Orientation'];

        return self::applyOrientation($gd, $orientation);
    }

    /**
     * Normalize an image file stored in public disk by its relative path.
     */
    public static function normalizeRelativePath(string $relativePath): bool
    {
        if (! Storage::disk('public')->exists($relativePath)) {
            return false;
        }

        $fullPath = Storage::disk('public')->path($relativePath);

        $orientation = 1;
        if (function_exists('exif_read_data')) {
            $exif = @exif_read_data($fullPath);
            if (is_array($exif) && ! empty($exif['Orientation'])) {
                $orientation = (int) $exif['Orientation'];
            }
        }

        if ($orientation <= 1) {
            return false;
        }

        $raw = @file_get_contents($fullPath);
        if (! $raw) {
            return false;
        }

        $gd = @imagecreatefromstring($raw);
        if (! $gd) {
            return false;
        }

        $oriented = self::applyOrientation($gd, $orientation);

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        ob_start();
        match ($ext) {
            'png' => imagepng($oriented, null, 8),
            'webp' => imagewebp($oriented, null, 92),
            default => imagejpeg($oriented, null, 95),
        };
        $bytes = (string) ob_get_clean();

        if ($oriented !== $gd) {
            imagedestroy($oriented);
        }
        imagedestroy($gd);

        if ($bytes !== '') {
            return Storage::disk('public')->put($relativePath, $bytes);
        }

        return false;
    }

    /**
     * Normalize an image file on disk so its raw pixels are upright and EXIF is cleanly updated.
     */
    public static function normalizeImageFile(string $fullPath): bool
    {
        $orientation = 1;
        if (function_exists('exif_read_data')) {
            $exif = @exif_read_data($fullPath);
            if (is_array($exif) && ! empty($exif['Orientation'])) {
                $orientation = (int) $exif['Orientation'];
            }
        }

        if ($orientation <= 1) {
            return false;
        }

        $raw = @file_get_contents($fullPath);
        if (! $raw) {
            return false;
        }

        $gd = @imagecreatefromstring($raw);
        if (! $gd) {
            return false;
        }

        $oriented = self::applyOrientation($gd, $orientation);

        $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
        ob_start();
        match ($ext) {
            'png' => imagepng($oriented, null, 8),
            'webp' => imagewebp($oriented, null, 92),
            default => imagejpeg($oriented, null, 95),
        };
        $bytes = (string) ob_get_clean();

        if ($oriented !== $gd) {
            imagedestroy($oriented);
        }
        imagedestroy($gd);

        if ($bytes !== '') {
            return (bool) @file_put_contents($fullPath, $bytes);
        }

        return false;
    }

    /**
     * Apply rotation/flip for a given EXIF orientation tag.
     */
    public static function applyOrientation(GdImage $gd, int $orientation): GdImage
    {
        return match ($orientation) {
            2 => (imageflip($gd, IMG_FLIP_HORIZONTAL) ? $gd : $gd),
            3 => imagerotate($gd, 180, 0),
            4 => (imageflip($gd, IMG_FLIP_VERTICAL) ? $gd : $gd),
            5 => (function () use ($gd) {
                $rotated = imagerotate($gd, 270, 0);
                imageflip($rotated, IMG_FLIP_HORIZONTAL);

                return $rotated;
            })(),
            6 => imagerotate($gd, -90, 0), // 90 deg CW (imagerotate is CCW, so -90 rotates 90 clockwise)
            7 => (function () use ($gd) {
                $rotated = imagerotate($gd, 90, 0);
                imageflip($rotated, IMG_FLIP_HORIZONTAL);

                return $rotated;
            })(),
            8 => imagerotate($gd, 90, 0), // 270 deg CW / 90 deg CCW
            default => $gd,
        };
    }

    /**
     * Normalize all existing participant photos in public storage.
     *
     * @return array<int, array{id: int, name: string, photo_path: string}>
     */
    public static function normalizeExistingPhotos(): array
    {
        $participants = Participant::whereNotNull('photo_path')->get();
        $updated = [];

        foreach ($participants as $participant) {
            if (self::normalizeRelativePath($participant->photo_path)) {
                $updated[] = [
                    'id' => $participant->id,
                    'name' => $participant->name,
                    'photo_path' => $participant->photo_path,
                ];
            }
        }

        return $updated;
    }
}
