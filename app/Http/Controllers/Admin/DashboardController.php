<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Category;
use App\Models\Material;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the administrative overview dashboard.
     */
    public function index(): Response
    {
        $totalMaterials = Material::count();
        $publishedMaterials = Material::where('status', 'published')->count();
        $reviewMaterials = Material::whereIn('status', ['review', 'draft'])->count();
        $totalUsers = User::count();

        $pendingReviews = Material::whereIn('status', ['review', 'draft'])
            ->with(['categories', 'creator'])
            ->latest('updated_at')
            ->take(5)
            ->get()
            ->map(fn (Material $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'code' => $m->code,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'type' => $m->type,
                'type_label' => $m->type_label,
                'category' => $m->categories->first() ? [
                    'id' => $m->categories->first()->id,
                    'name' => $m->categories->first()->name,
                    'color' => $m->categories->first()->color,
                ] : null,
                'updated_at' => $m->updated_at?->diffForHumans() ?? '-',
            ]);

        $recentActivities = ActivityLog::with('actor')
            ->latest('created_at')
            ->take(6)
            ->get()
            ->map(fn (ActivityLog $a) => [
                'id' => $a->id,
                'event' => $a->event,
                'description' => $a->description,
                'created_at' => $a->created_at?->diffForHumans() ?? '-',
                'actor' => $a->actor ? [
                    'id' => $a->actor->id,
                    'name' => $a->actor->name,
                    'role' => $a->actor->role,
                ] : null,
            ]);

        $recentMaterials = Material::with('categories')
            ->latest('updated_at')
            ->take(6)
            ->get()
            ->map(fn (Material $m) => [
                'id' => $m->id,
                'title' => $m->title,
                'code' => $m->code,
                'type' => $m->type,
                'type_label' => $m->type_label,
                'status' => $m->status,
                'status_label' => $m->status_label,
                'categories' => $m->categories->map(fn ($c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'color' => $c->color,
                ]),
                'updated_at' => $m->updated_at?->format('d M Y') ?? '-',
            ]);

        $categoryDistribution = Category::withCount('materials')
            ->orderByDesc('materials_count')
            ->take(6)
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'color' => $c->color,
                'materials_count' => $c->materials_count,
            ]);

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'total_materials' => $totalMaterials,
                'published_materials' => $publishedMaterials,
                'review_materials' => $reviewMaterials,
                'total_users' => $totalUsers,
            ],
            'pending_reviews' => $pendingReviews,
            'recent_activities' => $recentActivities,
            'recent_materials' => $recentMaterials,
            'category_distribution' => $categoryDistribution,
        ]);
    }
}
