<?php

namespace App\Actions\Materials;

use App\Http\Requests\Admin\StoreMaterialRequest;
use App\Http\Requests\Admin\UpdateMaterialRequest;
use App\Models\ActivityLog;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Services\MaterialSourceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class SaveMaterial
{
    public function handle(StoreMaterialRequest|UpdateMaterialRequest $request, ?Material $material = null): Material
    {
        $validated = $request->validated();
        $disk = config('pustaka.disk', 'local');
        $savedFilePath = null;
        $savedCoverPath = null;
        $isCreating = $material === null;
        $material ??= new Material;

        try {
            $coverPath = $this->storeCover($request, $material, $savedCoverPath);
            $source = $this->sourceAttributes($request, $material);

            return DB::transaction(function () use (
                $request,
                $validated,
                $disk,
                $material,
                $isCreating,
                $coverPath,
                $source,
                &$savedFilePath,
            ): Material {
                if ($isCreating) {
                    $material->slug = $this->uniqueSlug($validated['title']);
                    $material->created_by = $request->user()?->id ?? 1;
                }

                $wasPublished = $material->status === 'published';
                $this->fillMaterial($material, $request, $validated, $source, $coverPath);
                if ($isCreating && $material->status === 'published') {
                    $material->published_at = now();
                } elseif (! $wasPublished && $material->status === 'published') {
                    $material->published_at = now();
                    $material->reviewed_by = $request->user()?->id;
                    $material->reviewed_at = now();
                }
                $material->save();

                $material->categories()->sync([$validated['category_id'] => ['is_primary' => true]]);
                if (($isCreating && $request->filled('audiences')) || (! $isCreating && $request->has('audiences'))) {
                    $material->audiences()->sync((array) $request->input('audiences'));
                }

                if ($source['source_type'] === 'uploaded_pdf' && $request->hasFile('book_file')) {
                    $lockedMaterial = Material::query()->lockForUpdate()->findOrFail($material->id);
                    $nextVersion = ((int) $lockedMaterial->files()->max('version')) + 1;
                    $lockedMaterial->files()->update(['is_active' => false]);

                    $bookFile = $request->file('book_file');
                    $storageName = "v{$nextVersion}_".Str::random(24).'.pdf';
                    $savedFilePath = $bookFile->storeAs("books/{$material->id}", $storageName, $disk);

                    MaterialFile::create([
                        'material_id' => $material->id,
                        'kind' => 'primary',
                        'disk' => $disk,
                        'path' => $savedFilePath,
                        'storage_name' => $storageName,
                        'original_name' => $bookFile->getClientOriginalName(),
                        'mime_type' => 'application/pdf',
                        'extension' => 'pdf',
                        'size_bytes' => $bookFile->getSize(),
                        'version' => $nextVersion,
                        'is_active' => true,
                        'uploaded_by' => $request->user()?->id,
                    ]);
                }

                ActivityLog::record($isCreating ? 'material.created' : 'material.updated', $material, [
                    'title' => $material->title,
                    'source_type' => $material->source_type,
                    'status' => $material->status,
                ]);

                return $material->refresh();
            });
        } catch (Throwable $exception) {
            if ($savedFilePath !== null && Storage::disk($disk)->exists($savedFilePath)) {
                Storage::disk($disk)->delete($savedFilePath);
            }
            if ($savedCoverPath !== null && is_file($savedCoverPath)) {
                unlink($savedCoverPath);
            }

            throw $exception;
        }
    }

    private function storeCover(
        StoreMaterialRequest|UpdateMaterialRequest $request,
        Material $material,
        ?string &$savedCoverPath,
    ): ?string {
        if (! $request->hasFile('cover_file')) {
            return $material->cover_path;
        }

        $file = $request->file('cover_file');
        $filename = time().'_'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->getClientOriginalExtension();
        $file->move(public_path('images'), $filename);
        $savedCoverPath = public_path('images/'.$filename);

        return '/images/'.$filename;
    }

    /**
     * @return array<string, mixed>
     */
    private function sourceAttributes(
        StoreMaterialRequest|UpdateMaterialRequest $request,
        Material $material,
    ): array {
        $validated = $request->validated();
        $sourceType = $validated['source_type'] ?? $material->source_type ?? 'uploaded_pdf';
        $attributes = [
            'source_type' => $sourceType,
            'external_url' => null,
            'external_source_name' => null,
            'external_open_mode' => 'new_tab',
            'video_provider' => null,
            'video_id' => null,
            'video_url' => null,
            'video_allow_portal' => true,
        ];

        if ($sourceType === 'external_link') {
            $attributes['external_url'] = $validated['external_url'] ?? null;
            $attributes['external_source_name'] = $validated['external_source_name'] ?? null;
            $attributes['external_open_mode'] = $validated['external_open_mode'] ?? 'new_tab';
        } elseif ($sourceType === 'video') {
            $rawVideoUrl = $validated['video_url'] ?? null;
            $parsedVideo = MaterialSourceService::parseVideoUrl($rawVideoUrl);
            if ($parsedVideo) {
                $attributes['video_provider'] = $parsedVideo['provider'];
                $attributes['video_id'] = $parsedVideo['video_id'];
                $attributes['video_url'] = $rawVideoUrl;
            }
            $attributes['video_allow_portal'] = $request->boolean('video_allow_portal', true);
        }

        return $attributes;
    }

    /**
     * @param  array<string, mixed>  $validated
     * @param  array<string, mixed>  $source
     */
    private function fillMaterial(
        Material $material,
        StoreMaterialRequest|UpdateMaterialRequest $request,
        array $validated,
        array $source,
        ?string $coverPath,
    ): void {
        $allowDownload = $request->boolean('allow_download') || $request->boolean('is_downloadable');
        $material->fill([
            'title' => $validated['title'],
            'code' => $validated['code'] ?? $material->code ?? strtoupper(Str::random(6)),
            'author' => $validated['author'] ?? null,
            'type' => $validated['type'],
            ...$source,
            'access_scope' => $validated['access_scope'] ?? $material->access_scope ?? 'all',
            'publication_year' => $validated['publication_year'] ?? $material->publication_year ?? date('Y'),
            'page_count' => $validated['page_count'] ?? $material->page_count,
            'summary' => $validated['summary'] ?? $material->summary,
            'description' => $validated['description'] ?? $material->description,
            'keywords' => $validated['keywords'] ?? null,
            'admin_notes' => $validated['admin_notes'] ?? null,
            'status' => $validated['status'],
            'cover_path' => $coverPath,
            'is_downloadable' => $allowDownload,
            'allow_download' => $allowDownload,
            'is_featured' => $request->boolean('is_featured'),
        ]);

        $metadata = is_array($material->metadata) ? $material->metadata : [];
        if (! $material->exists || $request->has('key_points')) {
            $material->key_points = array_values(array_filter(array_map('trim', (array) $request->input('key_points'))));
            $metadata['key_points'] = $material->key_points;
        }
        if (! $material->exists || $request->has('learning_objectives')) {
            $material->learning_objectives = array_values(array_filter(array_map('trim', (array) $request->input('learning_objectives'))));
            $metadata['learning_objectives'] = $material->learning_objectives;
        }
        if ($material->exists && $request->has('table_of_contents')) {
            $metadata['table_of_contents'] = array_values(array_filter(
                (array) $request->input('table_of_contents'),
                fn ($item) => ! empty($item['title']),
            ));
        }
        if ($source['source_type'] === 'external_link' && $source['external_open_mode'] === 'embed' && $source['external_url']) {
            $metadata['embed_url'] = Material::resolveExternalEmbedUrl($source['external_url'], $material->exists ? $material : null);
        } else {
            unset($metadata['embed_url']);
        }
        $material->metadata = $metadata;
    }

    private function uniqueSlug(string $title): string
    {
        $baseSlug = Str::slug($title);
        $existingSlugs = Material::query()
            ->where(fn ($query) => $query
                ->where('slug', $baseSlug)
                ->orWhere('slug', 'like', "{$baseSlug}-%"))
            ->pluck('slug')
            ->flip();
        $slug = $baseSlug;
        $counter = 1;
        while ($existingSlugs->has($slug)) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
