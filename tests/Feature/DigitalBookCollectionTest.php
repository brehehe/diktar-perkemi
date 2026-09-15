<?php

use App\Models\Audience;
use App\Models\Category;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('admin can upload new material with PDF to private storage', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Buku Panduan', 'slug' => 'buku-panduan']);

    $pdfFile = UploadedFile::fake()->create('buku-kurikulum-2026.pdf', 2048, 'application/pdf');

    $response = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Kurikulum Tingkat I',
        'code' => 'KUR-001',
        'category_id' => $category->id,
        'type' => 'book',
        'author' => 'Dewan Guru PB PERKEMI',
        'publication_year' => 2026,
        'page_count' => 88,
        'summary' => 'Panduan kurikulum teknik dasar bagi kenshi.',
        'status' => 'published',
        'is_downloadable' => true,
        'book_file' => $pdfFile,
    ]);

    $response->assertRedirect('/admin/koleksi');

    $material = Material::where('code', 'KUR-001')->first();
    expect($material)->not->toBeNull()
        ->and($material->author)->toBe('Dewan Guru PB PERKEMI')
        ->and($material->status)->toBe('published');

    // Verify file record
    $activeFile = $material->activeFile;
    expect($activeFile)->not->toBeNull()
        ->and($activeFile->version)->toBe(1)
        ->and($activeFile->disk)->toBe('local')
        ->and($activeFile->original_name)->toBe('buku-kurikulum-2026.pdf')
        ->and($activeFile->mime_type)->toBe('application/pdf');

    // Verify physical file was stored on private disk, not public
    Storage::disk('local')->assertExists($activeFile->path);
});

test('admin can view collections index with file status and versions via Inertia', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Buku Panduan', 'slug' => 'buku-panduan']);

    $pdfFile = UploadedFile::fake()->create('buku-test.pdf', 1024, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Panduan Utama',
        'code' => 'BPU-01',
        'category_id' => $category->id,
        'type' => 'book',
        'status' => 'published',
        'book_file' => $pdfFile,
    ]);

    $response = $this->actingAs($admin)->get('/admin/koleksi');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Index')
            ->has('materials.data', 1)
            ->where('materials.data.0.file_status', 'ready')
            ->where('materials.data.0.active_version', 'v1.0')
            ->where('materials.data.0.file_format', 'PDF')
        );
});

test('admin can view collections create page with required props via Inertia', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    Category::create(['name' => 'Teknik', 'slug' => 'teknik']);
    Audience::create(['name' => 'Wasit', 'code' => 'WST']);

    $response = $this->actingAs($admin)->get('/admin/koleksi/create');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Create')
            ->has('categories', 1)
            ->has('audiences', 1)
            ->has('material_types')
            ->has('status_options')
            ->where('max_file_size_mb', 50)
        );
});

test('admin can view collections edit page with active file and version history via Inertia', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Teknik', 'slug' => 'teknik']);

    $pdfFile = UploadedFile::fake()->create('modul-teknik.pdf', 1024, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Modul Teknik Dasar',
        'code' => 'MTD-01',
        'category_id' => $category->id,
        'type' => 'module',
        'status' => 'published',
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'MTD-01')->first();

    $response = $this->actingAs($admin)->get("/admin/koleksi/{$material->id}/edit");
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Edit')
            ->where('material.title', 'Modul Teknik Dasar')
            ->where('active_file.original_name', 'modul-teknik.pdf')
            ->where('active_file.version', 1)
            ->has('file_history', 1)
        );
});

test('file validation rejects missing file, invalid mime, and oversized files', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Pedoman', 'slug' => 'pedoman']);

    // 1. Missing book_file
    $responseMissing = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Pedoman Tanpa Berkas',
        'category_id' => $category->id,
        'type' => 'guideline',
        'publication_year' => 2026,
        'status' => 'draft',
    ]);
    $responseMissing->assertSessionHasErrors(['book_file']);

    // 2. Non-PDF format
    $txtFile = UploadedFile::fake()->create('dokumen.txt', 100, 'text/plain');
    $responseInvalid = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Materi Format Salah',
        'category_id' => $category->id,
        'type' => 'guideline',
        'publication_year' => 2026,
        'status' => 'draft',
        'book_file' => $txtFile,
    ]);
    $responseInvalid->assertSessionHasErrors(['book_file']);

    // 3. Oversized file (> 50 MB / configured limit)
    $hugePdf = UploadedFile::fake()->create('raksasa.pdf', 60 * 1024, 'application/pdf');
    $responseHuge = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Materi Terlalu Besar',
        'category_id' => $category->id,
        'type' => 'guideline',
        'publication_year' => 2026,
        'status' => 'draft',
        'book_file' => $hugePdf,
    ]);
    $responseHuge->assertSessionHasErrors(['book_file']);
});

test('admin can replace active file with incremented version', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Modul', 'slug' => 'modul']);

    $initialFile = UploadedFile::fake()->create('modul-v1.pdf', 1000, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Modul Penataran Wasit',
        'code' => 'WST-01',
        'category_id' => $category->id,
        'type' => 'module',
        'status' => 'published',
        'book_file' => $initialFile,
    ]);

    $material = Material::where('code', 'WST-01')->first();
    $firstFile = $material->activeFile;
    expect($firstFile->version)->toBe(1);

    // Replace file with v2
    $replacementFile = UploadedFile::fake()->create('modul-v2-revisi.pdf', 1500, 'application/pdf');
    $replaceResponse = $this->actingAs($admin)->post("/admin/koleksi/{$material->id}/replace-file", [
        'book_file' => $replacementFile,
    ]);

    $replaceResponse->assertRedirect();

    $material->refresh();
    $activeFile = $material->activeFile;
    expect($activeFile->version)->toBe(2)
        ->and($activeFile->original_name)->toBe('modul-v2-revisi.pdf');

    // Verify first file is now deactivated but still preserved
    $oldFile = MaterialFile::find($firstFile->id);
    expect($oldFile->is_active)->toBeFalse();
    expect($material->files()->count())->toBe(2);
});

test('draft material cannot be accessed by normal reader but admin can preview it', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $reader = User::factory()->create(['role' => 'Peserta']);
    $category = Category::create(['name' => 'Draf Rahasia', 'slug' => 'draf-rahasia']);

    $pdfFile = UploadedFile::fake()->create('draf-dokumen.pdf', 500, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Modul Rahasia Belum Terbit',
        'code' => 'DRAFT-01',
        'category_id' => $category->id,
        'type' => 'module',
        'status' => 'draft',
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'DRAFT-01')->first();

    // Normal reader is blocked (403)
    $responseReader = $this->actingAs($reader)->get("/koleksi/{$material->slug}/baca");
    $responseReader->assertForbidden();

    // Reader file stream is also blocked
    $responseFile = $this->actingAs($reader)->get("/koleksi/{$material->slug}/file");
    $responseFile->assertForbidden();

    // Admin can preview the reader page
    $responseAdmin = $this->actingAs($admin)->get("/koleksi/{$material->slug}/baca");
    $responseAdmin->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Reader/Show')
            ->where('material.status', 'draft')
        );
});

test('published material respects audience role restrictions', function () {
    $pelatih = User::factory()->create(['role' => 'Pelatih']);
    $peserta = User::factory()->create(['role' => 'Peserta']);

    $category = Category::create(['name' => 'Kepelatihan', 'slug' => 'kepelatihan']);
    $audiencePelatih = Audience::create(['name' => 'Pelatih', 'code' => 'PLT']);

    $pdfFile = UploadedFile::fake()->create('pedoman-pelatih.pdf', 500, 'application/pdf');
    $material = Material::create([
        'title' => 'Pedoman Khusus Pelatih Tingkat III',
        'slug' => 'pedoman-khusus-pelatih-tingkat-iii',
        'code' => 'PLT-003',
        'type' => 'book',
        'status' => 'published',
        'created_by' => 1,
    ]);
    $material->categories()->sync([$category->id]);
    $material->audiences()->sync([$audiencePelatih->id]);

    $path = $pdfFile->storeAs("books/{$material->id}", 'v1_pelatih.pdf', 'local');
    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $path,
        'original_name' => 'pedoman-pelatih.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 500,
        'version' => 1,
        'is_active' => true,
    ]);

    // Pelatih role matches audience -> allowed
    $responsePelatih = $this->actingAs($pelatih)->get("/koleksi/{$material->slug}/baca");
    $responsePelatih->assertOk();

    // Peserta role does not match audience -> blocked (403)
    $responsePeserta = $this->actingAs($peserta)->get("/koleksi/{$material->slug}/baca");
    $responsePeserta->assertForbidden();
});

test('guest cannot access reader or file streams and is redirected to login', function () {
    $category = Category::create(['name' => 'Umum', 'slug' => 'umum']);
    $material = Material::create([
        'title' => 'Buku Publik Umum',
        'slug' => 'buku-publik-umum',
        'code' => 'PUB-01',
        'type' => 'book',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $this->get("/koleksi/{$material->slug}/baca")->assertRedirect('/login');
    $this->get("/koleksi/{$material->slug}/file")->assertRedirect('/login');
    $this->get("/koleksi/{$material->slug}/unduh")->assertRedirect('/login');
});

test('streamFile returns inline PDF response and records activity log', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $reader = User::factory()->create(['role' => 'Peserta']);
    $category = Category::create(['name' => 'Umum', 'slug' => 'umum']);

    $pdfFile = UploadedFile::fake()->create('buku-publik.pdf', 800, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Publik Umum',
        'code' => 'PUB-01',
        'category_id' => $category->id,
        'type' => 'book',
        'status' => 'published',
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'PUB-01')->first();

    // Authenticated reader receives inline stream
    $streamResponse = $this->actingAs($reader)->get("/koleksi/{$material->slug}/file");
    $streamResponse->assertOk()
        ->assertHeader('Content-Type', 'application/pdf')
        ->assertHeader('Content-Disposition', 'inline; filename="buku-publik.pdf"');

    // Verify activity log was recorded
    $this->assertDatabaseHas('activity_logs', [
        'event' => 'material.read',
        'subject_id' => $material->id,
    ]);
});

test('downloadFile respects is_downloadable flag and records activity log', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $reader = User::factory()->create(['role' => 'Peserta']);
    $category = Category::create(['name' => 'Modul', 'slug' => 'modul']);

    $pdfFile = UploadedFile::fake()->create('buku-non-downloadable.pdf', 600, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Hanya Baca',
        'code' => 'READ-ONLY-01',
        'category_id' => $category->id,
        'type' => 'book',
        'status' => 'published',
        'is_downloadable' => false,
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'READ-ONLY-01')->first();

    // Reader cannot download read-only material (403)
    $responseForbidden = $this->actingAs($reader)->get("/koleksi/{$material->slug}/unduh");
    $responseForbidden->assertForbidden();

    // Admin CAN download any material
    $responseAdmin = $this->actingAs($admin)->get("/koleksi/{$material->slug}/unduh");
    $responseAdmin->assertOk();

    // Update material to allow download
    $material->update(['is_downloadable' => true]);

    $responseAllowed = $this->actingAs($reader)->get("/koleksi/{$material->slug}/unduh");
    $responseAllowed->assertOk();

    $this->assertDatabaseHas('activity_logs', [
        'event' => 'material.download',
        'subject_id' => $material->id,
    ]);
});
