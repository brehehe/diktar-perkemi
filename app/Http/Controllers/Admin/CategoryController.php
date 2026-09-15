<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Models\ActivityLog;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     */
    public function index(): Response
    {
        $categories = Category::withCount('materials')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $c) => [
                'id' => $c->id,
                'name' => $c->name,
                'slug' => $c->slug,
                'description' => $c->description,
                'color' => $c->color,
                'is_active' => (bool) $c->is_active,
                'sort_order' => $c->sort_order,
                'materials_count' => $c->materials_count,
                'created_at' => $c->created_at?->format('d M Y') ?? '-',
            ]);

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#0B63CE',
            'is_active' => $request->boolean('is_active', true),
        ]);

        ActivityLog::record('category.created', $category, ['name' => $category->name]);

        return redirect()->route('admin.categories.index')->with('success', 'Kategori "'.$category->name.'" berhasil dibuat.');
    }

    /**
     * Update the specified category.
     */
    public function update(UpdateCategoryRequest $request, Category $category): RedirectResponse
    {
        $validated = $request->validated();

        $category->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'color' => $validated['color'] ?? '#0B63CE',
            'is_active' => $request->boolean('is_active'),
        ]);

        ActivityLog::record('category.updated', $category, ['name' => $category->name]);

        return redirect()->route('admin.categories.index')->with('success', 'Kategori "'.$category->name.'" berhasil diperbarui.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Category $category): RedirectResponse
    {
        $materialsCount = $category->materials()->count();

        if ($materialsCount > 0) {
            return back()->with('error', 'Kategori "'.$category->name.'" tidak dapat dihapus karena masih memuat '.$materialsCount.' materi terkait. Pindahkan materi ke kategori lain terlebih dahulu.');
        }

        $name = $category->name;
        $category->delete();

        ActivityLog::record('category.deleted', null, ['name' => $name]);

        return redirect()->route('admin.categories.index')->with('success', 'Kategori "'.$name.'" berhasil dihapus.');
    }
}
