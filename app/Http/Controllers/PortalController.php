<?php

namespace App\Http\Controllers;

use App\Models\Audience;
use App\Models\Category;
use App\Models\Material;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    /**
     * Display the dynamic reader portal home page.
     */
    public function home(): Response
    {
        // 1. Portal Statistics from real database records
        $totalPublished = Material::published()->withValidSource()->count();
        $totalCategories = Category::where('is_active', true)->has('publishedMaterials')->count();
        if ($totalCategories === 0) {
            $totalCategories = Category::where('is_active', true)->count();
        }
        $totalAudiences = Audience::where('is_active', true)->count();
        $latestUpdate = Material::published()->withValidSource()->max('updated_at');

        $stats = [
            'total_materials' => $totalPublished,
            'total_categories' => $totalCategories,
            'total_roles' => $totalAudiences,
            'latest_update' => $latestUpdate ? Carbon::parse($latestUpdate)->translatedFormat('d M Y') : null,
        ];

        // 2. Featured Collections (materials marked is_featured, fallback to latest)
        $featuredQuery = Material::query()
            ->published()
            ->withValidSource()
            ->with(['categories', 'activeFile']);

        $featuredMaterials = (clone $featuredQuery)
            ->where('is_featured', true)
            ->latest('published_at')
            ->take(4)
            ->get();

        if ($featuredMaterials->isEmpty()) {
            $featuredMaterials = (clone $featuredQuery)
                ->latest('published_at')
                ->take(4)
                ->get();
        }

        $formattedFeatured = $featuredMaterials->map(fn (Material $m) => $this->formatMaterialSummary($m));

        // 3. Active Categories with published material counts
        $paletteMap = [
            'perwasitan' => '#EE9B25',
            'materi-kepelatihan' => '#20A47A',
            'materi-pengujian' => '#DD4D7C',
            'modul-penataran' => '#0B63CE',
            'pedoman-regulasi' => '#0A3F82',
            'video-pembelajaran' => '#7957D5',
        ];

        $categories = Category::where('is_active', true)
            ->withCount(['materials as published_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->orderByDesc('published_count')
            ->take(6)
            ->get()
            ->values()
            ->map(function (Category $c, int $idx) use ($paletteMap) {
                $fallbackPalette = ['#0B63CE', '#20A47A', '#EE9B25', '#DD4D7C', '#7957D5', '#0A3F82'];
                $assignedColor = $c->color ?: ($paletteMap[$c->slug] ?? $fallbackPalette[$idx % count($fallbackPalette)]);

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'description' => $c->description,
                    'color' => $assignedColor,
                    'published_count' => $c->published_count,
                ];
            });

        // 4. Latest Published Collections
        $latestMaterials = Material::query()
            ->published()
            ->withValidSource()
            ->with(['categories', 'activeFile'])
            ->latest('published_at')
            ->take(6)
            ->get()
            ->map(fn (Material $m) => $this->formatMaterialSummary($m));

        // 5. Target Roles (Audiences)
        $audiences = Audience::where('is_active', true)
            ->withCount(['materials as materials_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->orderBy('id')
            ->get()
            ->map(fn (Audience $a) => [
                'id' => $a->id,
                'name' => $a->name,
                'slug' => Str::slug($a->name),
                'code' => $a->code,
                'description' => $a->description,
                'materials_count' => $a->materials_count,
            ]);

        // 6. Hero Showcase Books
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

        return Inertia::render('Portal/Home', [
            'stats' => $stats,
            'featured_materials' => $formattedFeatured,
            'categories' => $categories,
            'latest_materials' => $latestMaterials,
            'roles' => $audiences,
            'hero_books' => $heroBooks,
        ]);
    }

    /**
     * Display the digital book catalog / collections directory with filters and search.
     */
    public function collections(Request $request): Response
    {
        $query = Material::query()
            ->published()
            ->withValidSource()
            ->with(['categories', 'activeFile', 'audiences']);

        // Search by keyword, title, code, author, or summary
        if ($request->filled('q') || $request->filled('search')) {
            $search = trim((string) ($request->input('q') ?? $request->input('search')));
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(author, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(code, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(summary, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(keywords, \'\')) LIKE ?', [$term]);
            });
        }

        // Filter by Category
        if ($request->filled('category')) {
            $categorySlug = $request->input('category');
            $query->whereHas('categories', function ($q) use ($categorySlug) {
                $q->where('categories.slug', $categorySlug)
                    ->orWhere('categories.id', is_numeric($categorySlug) ? (int) $categorySlug : null);
            });
        }

        // Filter by Type
        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by Source Type
        if ($request->filled('source_type')) {
            $query->where('source_type', $request->input('source_type'));
        }

        // Filter by Publication Year
        if ($request->filled('year')) {
            $query->where('publication_year', (int) $request->input('year'));
        }

        // Sorting
        $sort = $request->input('sort', 'latest');
        if ($sort === 'oldest') {
            $query->oldest('publication_year')->oldest('id');
        } elseif ($sort === 'title_asc') {
            $query->orderBy('title', 'asc');
        } elseif ($sort === 'title_desc') {
            $query->orderBy('title', 'desc');
        } else {
            // Default latest
            $query->latest('published_at')->latest('id');
        }

        $materials = $query->paginate(9)
            ->withQueryString()
            ->through(fn (Material $m) => $this->formatMaterialSummary($m));

        // Available filter choices from real records
        $categories = Category::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'color']);

        $availableYears = Material::published()
            ->withValidSource()
            ->select('publication_year')
            ->whereNotNull('publication_year')
            ->distinct()
            ->orderByDesc('publication_year')
            ->pluck('publication_year');

        $materialTypes = [
            ['value' => 'module', 'label' => 'Modul Penataran'],
            ['value' => 'book', 'label' => 'Buku & Monograf'],
            ['value' => 'speaker_material', 'label' => 'Bahan Ajar Pemateri'],
            ['value' => 'guideline', 'label' => 'Pedoman Teknis'],
            ['value' => 'video', 'label' => 'Materi Video'],
            ['value' => 'document', 'label' => 'Dokumen / SK'],
        ];

        $sourceTypes = [
            ['value' => 'uploaded_pdf', 'label' => 'E-Book PDF'],
            ['value' => 'external_link', 'label' => 'Buku Digital (Tautan)'],
            ['value' => 'video', 'label' => 'Video Pembelajaran'],
        ];

        return Inertia::render('Portal/Collections/Index', [
            'materials' => $materials,
            'categories' => $categories,
            'available_years' => $availableYears,
            'material_types' => $materialTypes,
            'source_types' => $sourceTypes,
            'filters' => [
                'q' => $request->input('q') ?? $request->input('search', ''),
                'category' => $request->input('category', ''),
                'type' => $request->input('type', ''),
                'source_type' => $request->input('source_type', ''),
                'year' => $request->input('year', ''),
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Display the detailed view of a single collection material before reading.
     */
    public function showCollection(Request $request, string $slug): Response
    {
        $material = Material::where('slug', $slug)
            ->published()
            ->withValidSource()
            ->with(['categories', 'audiences', 'activeFile'])
            ->firstOrFail();

        $primaryCategory = $material->categories->first();
        $user = $request->user();

        // Check if reader has read access (admin or matches audience restrictions)
        $canRead = true;
        if ($material->audiences()->count() > 0) {
            if (! $user) {
                $canRead = false; // requires login
            } else {
                $canRead = $user->isAdmin() || $material->audiences()
                    ->where(function ($q) use ($user) {
                        $role = strtolower((string) $user->role);
                        $q->whereRaw('LOWER(audiences.name) = ?', [$role])
                            ->orWhereRaw('LOWER(audiences.code) = ?', [$role]);
                    })->exists();
            }
        }

        $canDownload = $user && ($material->allow_download || $material->is_downloadable) && $material->source_type === 'uploaded_pdf' && ($user->isAdmin() || $canRead);

        // Related materials in the same category
        $relatedMaterials = Material::where('id', '!=', $material->id)
            ->published()
            ->withValidSource()
            ->when($primaryCategory, function ($q) use ($primaryCategory) {
                $q->whereHas('categories', function ($catQuery) use ($primaryCategory) {
                    $catQuery->where('categories.id', $primaryCategory->id);
                });
            })
            ->take(3)
            ->get()
            ->map(fn (Material $m) => $this->formatMaterialSummary($m));

        $keyPoints = $material->key_points ?: ($material->metadata['key_points'] ?? []);
        $learningObjectives = $material->learning_objectives ?: ($material->metadata['learning_objectives'] ?? []);

        return Inertia::render('Portal/Collections/Show', [
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'slug' => $material->slug,
                'code' => $material->code,
                'author' => $material->author ?: 'Pengurus Besar PERKEMI',
                'publication_year' => $material->publication_year,
                'page_count' => $material->page_count,
                'summary' => $material->summary,
                'description' => $material->description,
                'keywords' => $material->keywords,
                'cover_path' => $material->cover_path,
                'type' => $material->type,
                'type_label' => $material->type_label,
                'source_type' => $material->source_type ?? 'uploaded_pdf',
                'source_type_label' => $material->source_type_label,
                'source_badge_class' => $material->source_badge_class,
                'external_url' => $material->external_url,
                'external_source_name' => $material->external_source_name,
                'external_open_mode' => $material->external_open_mode ?? 'new_tab',
                'video_provider' => $material->video_provider,
                'video_id' => $material->video_id,
                'video_url' => $material->video_url,
                'embed_url' => $material->embed_url,
                'cta_label' => match ($material->source_type) {
                    'video' => 'Tonton Video',
                    'external_link' => 'Buka Buku Digital',
                    default => 'Baca E-Book',
                },
                'cta_type' => match ($material->source_type) {
                    'video' => 'video',
                    'external_link' => 'external',
                    default => 'reader',
                },
                'is_downloadable' => (bool) ($material->allow_download || $material->is_downloadable),
                'allow_download' => (bool) ($material->allow_download || $material->is_downloadable),
                'is_featured' => (bool) $material->is_featured,
                'category' => $primaryCategory ? [
                    'id' => $primaryCategory->id,
                    'name' => $primaryCategory->name,
                    'slug' => $primaryCategory->slug,
                    'color' => $primaryCategory->color ?: '#0B63CE',
                ] : null,
                'audiences' => $material->audiences->map(fn (Audience $a) => [
                    'id' => $a->id,
                    'name' => $a->name,
                    'code' => $a->code,
                ]),
                'key_points' => $keyPoints,
                'learning_objectives' => $learningObjectives,
                'active_file' => $material->activeFile ? [
                    'id' => $material->activeFile->id,
                    'original_name' => $material->activeFile->original_name,
                    'formatted_size' => $material->activeFile->formatted_size,
                    'version' => $material->activeFile->version,
                ] : null,
            ],
            'can_read' => $canRead,
            'can_download' => $canDownload,
            'reader_url' => "/koleksi/{$material->slug}/baca",
            'download_url' => "/koleksi/{$material->slug}/unduh",
            'related_materials' => $relatedMaterials,
        ]);
    }

    /**
     * Display all active categories directory.
     */
    public function categoriesIndex(): Response
    {
        $categoryColors = [
            '#0B63CE', '#20A47A', '#EE9B25', '#DD4D7C', '#7957D5', '#0A3F82',
        ];

        $categories = Category::where('is_active', true)
            ->withCount(['materials as published_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->orderBy('name')
            ->get()
            ->values()
            ->map(function (Category $c, int $idx) use ($categoryColors) {
                $defaultColor = $categoryColors[$idx % count($categoryColors)];

                return [
                    'id' => $c->id,
                    'name' => $c->name,
                    'slug' => $c->slug,
                    'description' => $c->description ?: 'Koleksi materi resmi PERKEMI untuk kategori '.$c->name.'.',
                    'color' => $c->color ?: $defaultColor,
                    'published_count' => $c->published_count,
                ];
            });

        $totalMaterials = Material::published()->withValidSource()->count();

        return Inertia::render('Portal/Categories/Index', [
            'categories' => $categories,
            'total_categories' => $categories->count(),
            'total_materials' => $totalMaterials,
        ]);
    }

    /**
     * Display published materials under a specific category.
     */
    public function category(Request $request, string $slug): Response
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = Material::published()
            ->withValidSource()
            ->whereHas('categories', function ($q) use ($category) {
                $q->where('categories.id', $category->id);
            })
            ->with(['categories', 'activeFile']);

        if ($request->filled('q') || $request->filled('search')) {
            $search = trim((string) ($request->input('q') ?? $request->input('search')));
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(author, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(code, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(summary, \'\')) LIKE ?', [$term]);
            });
        }

        if ($request->input('sort') === 'oldest') {
            $query->oldest('publication_year')->oldest('id');
        } elseif ($request->input('sort') === 'title_asc') {
            $query->orderBy('title', 'asc');
        } elseif ($request->input('sort') === 'title_desc') {
            $query->orderBy('title', 'desc');
        } else {
            $query->latest('published_at')->latest('id');
        }

        $materials = $query->paginate(9)
            ->withQueryString()
            ->through(fn (Material $m) => $this->formatMaterialSummary($m));

        $otherCategories = Category::where('id', '!=', $category->id)
            ->where('is_active', true)
            ->withCount(['materials as published_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'color' => $c->color ?: '#0B63CE',
                'published_count' => $c->published_count,
            ]);

        return Inertia::render('Portal/Categories/Show', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'color' => $category->color ?: '#0B63CE',
            ],
            'materials' => $materials,
            'other_categories' => $otherCategories,
            'filters' => [
                'q' => $request->input('q') ?? $request->input('search', ''),
                'sort' => $request->input('sort', 'latest'),
            ],
        ]);
    }

    /**
     * Display all audience roles directory and their learning needs.
     */
    public function rolesIndex(): Response
    {
        $roleNeeds = [
            'peserta' => 'Materi dasar dan modul penataran',
            'pelatih' => 'Materi pembinaan dan metodologi',
            'penguji' => 'Pedoman evaluasi dan instrumen pengujian',
            'wasit' => 'Referensi aturan dan materi perwasitan',
            'pemateri' => 'Bahan ajar dan referensi presentasi',
            'penyelenggara' => 'Panduan teknis dan administrasi kegiatan',
        ];

        $roleColors = [
            'peserta' => '#0B63CE',
            'pelatih' => '#20A47A',
            'penguji' => '#DD4D7C',
            'wasit' => '#EE9B25',
            'pemateri' => '#7957D5',
            'penyelenggara' => '#0A3F82',
        ];

        $audiences = Audience::where('is_active', true)
            ->withCount(['materials as materials_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->orderBy('id')
            ->get()
            ->map(function (Audience $a) use ($roleNeeds, $roleColors) {
                $slug = Str::slug($a->name);

                return [
                    'id' => $a->id,
                    'name' => $a->name,
                    'slug' => $slug,
                    'code' => $a->code,
                    'description' => $a->description ?: "Panduan dan materi kurikulum resmi untuk peran {$a->name} PERKEMI.",
                    'learning_needs' => $roleNeeds[$slug] ?? 'Referensi dan pedoman resmi PERKEMI',
                    'color' => $roleColors[$slug] ?? '#0B63CE',
                    'materials_count' => $a->materials_count,
                ];
            });

        return Inertia::render('Portal/Roles/Index', [
            'roles' => $audiences,
            'total_roles' => $audiences->count(),
        ]);
    }

    /**
     * Display learning track and recommended materials for a specific audience role.
     */
    public function role(Request $request, string $role): Response
    {
        $roleNeeds = [
            'peserta' => 'Materi dasar dan modul penataran',
            'pelatih' => 'Materi pembinaan dan metodologi',
            'penguji' => 'Pedoman evaluasi dan instrumen pengujian',
            'wasit' => 'Referensi aturan dan materi perwasitan',
            'pemateri' => 'Bahan ajar dan referensi presentasi',
            'penyelenggara' => 'Panduan teknis dan administrasi kegiatan',
        ];

        $roleColors = [
            'peserta' => '#0B63CE',
            'pelatih' => '#20A47A',
            'penguji' => '#DD4D7C',
            'wasit' => '#EE9B25',
            'pemateri' => '#7957D5',
            'penyelenggara' => '#0A3F82',
        ];

        $slug = strtolower($role);
        $audience = Audience::where(function ($q) use ($slug) {
            $q->whereRaw('LOWER(name) = ?', [$slug])
                ->orWhereRaw('LOWER(code) = ?', [$slug])
                ->orWhereRaw("LOWER(REPLACE(name, ' ', '-')) = ?", [$slug]);
        })->first();

        $roleName = $audience ? $audience->name : ucwords(str_replace('-', ' ', $role));
        $roleSlug = Str::slug($roleName);

        $query = Material::published()
            ->withValidSource()
            ->when($audience, function ($q) use ($audience) {
                $q->whereHas('audiences', function ($audQ) use ($audience) {
                    $audQ->where('audiences.id', $audience->id);
                });
            })
            ->with(['categories', 'activeFile']);

        if ($request->filled('q') || $request->filled('search')) {
            $search = trim((string) ($request->input('q') ?? $request->input('search')));
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(title) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(author, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(code, \'\')) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(COALESCE(summary, \'\')) LIKE ?', [$term]);
            });
        }

        if ($request->input('sort') === 'oldest') {
            $query->oldest('publication_year')->oldest('id');
        } elseif ($request->input('sort') === 'title_asc') {
            $query->orderBy('title', 'asc');
        } elseif ($request->input('sort') === 'title_desc') {
            $query->orderBy('title', 'desc');
        } else {
            $query->latest('published_at')->latest('id');
        }

        $materials = $query->paginate(9)
            ->withQueryString()
            ->through(fn (Material $m) => $this->formatMaterialSummary($m));

        $allRoles = Audience::where('is_active', true)
            ->withCount(['materials as materials_count' => function ($q) {
                $q->where('materials.status', 'published')->withValidSource();
            }])
            ->get()
            ->map(fn (Audience $a) => [
                'name' => $a->name,
                'slug' => Str::slug($a->name),
                'count' => $a->materials_count,
            ]);

        return Inertia::render('Portal/Roles/Show', [
            'role_name' => $roleName,
            'role_slug' => $roleSlug,
            'description' => $audience?->description ?: "Kumpulan modul, bahan ajar, dan pedoman kurikulum resmi PERKEMI untuk kenshi dengan peran {$roleName}.",
            'learning_needs' => $roleNeeds[$roleSlug] ?? 'Pedoman dan referensi pembelajaran resmi PERKEMI',
            'color' => $roleColors[$roleSlug] ?? '#0B63CE',
            'materials' => $materials,
            'all_roles' => $allRoles,
            'filters' => [
                'q' => $request->input('q') ?? $request->input('search', ''),
                'sort' => $request->input('sort', 'latest'),
            ],
        ]);
    }

    /**
     * Display the About page.
     */
    public function about(): Response
    {
        $stats = [
            'total_materials' => Material::published()->withValidSource()->count(),
            'total_categories' => Category::where('is_active', true)->count(),
            'total_roles' => Audience::where('is_active', true)->count(),
        ];

        return Inertia::render('Portal/About', [
            'stats' => $stats,
        ]);
    }

    /**
     * Display the Help and FAQ page.
     */
    public function help(): Response
    {
        return Inertia::render('Portal/Help');
    }

    /**
     * Format a material model into a safe, lightweight array for frontend consumption.
     */
    private function formatMaterialSummary(Material $m): array
    {
        $primaryCategory = $m->categories->first();
        $sourceType = $m->source_type ?? 'uploaded_pdf';

        return [
            'id' => $m->id,
            'title' => $m->title,
            'slug' => $m->slug,
            'code' => $m->code,
            'author' => $m->author ?: 'Pengurus Besar PERKEMI',
            'summary' => $m->summary,
            'cover_path' => $m->cover_path,
            'type' => $m->type,
            'type_label' => $m->type_label,
            'source_type' => $sourceType,
            'source_type_label' => $m->source_type_label,
            'source_badge_class' => $m->source_badge_class,
            'external_url' => $m->external_url,
            'external_source_name' => $m->external_source_name,
            'external_open_mode' => $m->external_open_mode ?? 'new_tab',
            'video_provider' => $m->video_provider,
            'video_id' => $m->video_id,
            'video_url' => $m->video_url,
            'embed_url' => $m->embed_url,
            'publication_year' => $m->publication_year,
            'page_count' => $m->page_count,
            'is_downloadable' => (bool) ($m->allow_download || $m->is_downloadable),
            'allow_download' => (bool) ($m->allow_download || $m->is_downloadable),
            'is_featured' => (bool) $m->is_featured,
            'file_format' => match ($sourceType) {
                'video' => 'VIDEO',
                'external_link' => 'LINK',
                default => 'PDF',
            },
            'file_size' => $m->activeFile ? $m->activeFile->formatted_size : null,
            'cta_label' => match ($sourceType) {
                'video' => 'Tonton Video',
                'external_link' => 'Buka Buku Digital',
                default => 'Baca E-Book',
            },
            'cta_type' => match ($sourceType) {
                'video' => 'video',
                'external_link' => 'external',
                default => 'reader',
            },
            'category' => $primaryCategory ? [
                'id' => $primaryCategory->id,
                'name' => $primaryCategory->name,
                'slug' => $primaryCategory->slug,
                'color' => $primaryCategory->color ?: '#0B63CE',
            ] : null,
            'published_at' => $m->published_at ? $m->published_at->translatedFormat('d M Y') : null,
        ];
    }
}
