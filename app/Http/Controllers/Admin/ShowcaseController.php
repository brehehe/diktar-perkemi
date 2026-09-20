<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Material;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ShowcaseController extends Controller
{
    /**
     * Display the showcase images configuration page with live preview.
     */
    public function index(): Response
    {
        $heroBooks = [
            'book_1' => [
                'image' => Setting::get('hero_book_1_image', '/images/cover-1.jpg'),
                'title' => Setting::get('hero_book_1_title', 'Buku Modul PERKEMI 1'),
                'link' => Setting::get('hero_book_1_link', '/koleksi'),
            ],
            'book_2' => [
                'image' => Setting::get('hero_book_2_image', '/images/cover-2.jpg'),
                'title' => Setting::get('hero_book_2_title', 'Buku Modul PERKEMI 2'),
                'link' => Setting::get('hero_book_2_link', '/koleksi'),
            ],
            'book_3' => [
                'image' => Setting::get('hero_book_3_image', '/images/cover-3.jpg'),
                'title' => Setting::get('hero_book_3_title', 'Buku Utama Kurikulum PERKEMI'),
                'link' => Setting::get('hero_book_3_link', '/koleksi'),
            ],
        ];

        // Available published materials for quick selection
        $materials = Material::published()
            ->whereNotNull('cover_path')
            ->select('id', 'title', 'slug', 'cover_path')
            ->latest('published_at')
            ->take(20)
            ->get();

        return Inertia::render('Admin/Showcase/Index', [
            'hero_books' => $heroBooks,
            'available_materials' => $materials,
        ]);
    }

    /**
     * Update hero showcase books images, titles, and links.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'book_1_image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'book_1_title' => ['nullable', 'string', 'max:120'],
            'book_1_link' => ['nullable', 'string', 'max:255'],
            'book_2_image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'book_2_title' => ['nullable', 'string', 'max:120'],
            'book_2_link' => ['nullable', 'string', 'max:255'],
            'book_3_image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
            'book_3_title' => ['nullable', 'string', 'max:120'],
            'book_3_link' => ['nullable', 'string', 'max:255'],
            'book_1_existing_image' => ['nullable', 'string', 'max:255'],
            'book_2_existing_image' => ['nullable', 'string', 'max:255'],
            'book_3_existing_image' => ['nullable', 'string', 'max:255'],
        ]);

        $uploadDir = public_path('images/hero');
        if (! file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        for ($i = 1; $i <= 3; $i++) {
            $fileKey = "book_{$i}_image_file";
            $existingKey = "book_{$i}_existing_image";
            $titleKey = "book_{$i}_title";
            $linkKey = "book_{$i}_link";

            // 1. Process new uploaded file if present
            if ($request->hasFile($fileKey)) {
                $file = $request->file($fileKey);
                $ext = $file->getClientOriginalExtension();
                $filename = "hero_book_{$i}_".time().'_'.Str::random(6).'.'.$ext;
                $file->move($uploadDir, $filename);
                $imagePath = '/images/hero/'.$filename;
                Setting::set("hero_book_{$i}_image", $imagePath, 'appearance');
            } elseif (! empty($validated[$existingKey])) {
                // Keep or set existing image path
                Setting::set("hero_book_{$i}_image", $validated[$existingKey], 'appearance');
            }

            // 2. Process title & link
            if (isset($validated[$titleKey])) {
                Setting::set("hero_book_{$i}_title", $validated[$titleKey] ?: "Buku {$i}", 'appearance');
            }
            if (isset($validated[$linkKey])) {
                Setting::set("hero_book_{$i}_link", $validated[$linkKey] ?: '/koleksi', 'appearance');
            }
        }

        ActivityLog::record('showcase.updated', null, [
            'action' => 'Updated hero book showcase images and settings',
        ]);

        return back()->with('success', 'Gambar dan konfigurasi Showcase Beranda berhasil diperbarui.');
    }

    /**
     * Reset showcase books to default factory PERKEMI covers.
     */
    public function reset(): RedirectResponse
    {
        Setting::set('hero_book_1_image', '/images/cover-1.jpg', 'appearance');
        Setting::set('hero_book_1_title', 'Buku Modul PERKEMI 1', 'appearance');
        Setting::set('hero_book_1_link', '/koleksi', 'appearance');

        Setting::set('hero_book_2_image', '/images/cover-2.jpg', 'appearance');
        Setting::set('hero_book_2_title', 'Buku Modul PERKEMI 2', 'appearance');
        Setting::set('hero_book_2_link', '/koleksi', 'appearance');

        Setting::set('hero_book_3_image', '/images/cover-3.jpg', 'appearance');
        Setting::set('hero_book_3_title', 'Buku Utama Kurikulum PERKEMI', 'appearance');
        Setting::set('hero_book_3_link', '/koleksi', 'appearance');

        ActivityLog::record('showcase.reset', null, [
            'action' => 'Reset hero book showcase images to default covers',
        ]);

        return back()->with('success', 'Gambar Showcase Beranda berhasil dikembalikan ke kover bawaan.');
    }
}
