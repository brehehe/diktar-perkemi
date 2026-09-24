<?php

use App\Models\Audience;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Material;
use App\Models\MaterialFile;
use App\Models\Participant;
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
            ->component('Portal/Reader/Show')
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

test('reader back navigation follows a verified event context and otherwise returns to collection detail', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $participant = Participant::create([
        'user_id' => $user->id,
        'name' => 'Peserta Konteks Reader',
    ]);
    $event = Event::create([
        'title' => 'Event Konteks Reader',
        'slug' => 'event-konteks-reader',
        'start_date' => '2026-09-19',
        'end_date' => '2026-09-20',
        'location' => 'Pusdiklat PERKEMI',
        'status' => 'ongoing',
    ]);
    EventParticipant::create([
        'event_id' => $event->id,
        'participant_id' => $participant->id,
        'track_code' => 'PD',
        'admin_status' => 'verified',
    ]);
    $material = Material::create([
        'title' => 'Buku Dari Ruang Belajar',
        'slug' => 'buku-dari-ruang-belajar',
        'code' => 'EVT-BOOK-01',
        'type' => 'book',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'created_by' => $user->id,
    ]);
    $pdf = UploadedFile::fake()->create('buku-event.pdf', 500, 'application/pdf');
    MaterialFile::create([
        'material_id' => $material->id,
        'kind' => 'primary',
        'disk' => 'local',
        'path' => $pdf->storeAs("books/{$material->id}", 'v1.pdf', 'local'),
        'original_name' => 'buku-event.pdf',
        'mime_type' => 'application/pdf',
        'size_bytes' => 500,
        'version' => 1,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get("/koleksi/{$material->slug}/baca?event={$event->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('back_url', route('event.learning-room', $event->slug))
            ->where('back_label', 'Kembali ke ruang belajar event')
        );

    $unrelatedUser = User::factory()->create(['role' => 'Peserta']);
    $this->actingAs($unrelatedUser)
        ->get("/koleksi/{$material->slug}/baca?event={$event->slug}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('back_url', route('portal.collections.show', $material->slug))
            ->where('back_label', 'Kembali ke detail koleksi')
        );
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

test('admin can create material with external digital book link', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Referensi', 'slug' => 'referensi']);

    $response = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Referensi Daring PERKEMI',
        'code' => 'REF-EXT-01',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://perkemi.or.id/pustaka/buku-pedoman-2026',
        'external_source_name' => 'Perpustakaan Digital Nasional',
        'external_open_mode' => 'new_tab',
        'status' => 'published',
    ]);

    $response->assertRedirect('/admin/koleksi');

    $material = Material::where('code', 'REF-EXT-01')->first();
    expect($material)->not->toBeNull()
        ->and($material->source_type)->toBe('external_link')
        ->and($material->external_url)->toBe('https://perkemi.or.id/pustaka/buku-pedoman-2026')
        ->and($material->external_source_name)->toBe('Perpustakaan Digital Nasional')
        ->and($material->hasValidSource())->toBeTrue();
});

test('admin can create material with video lecture from YouTube', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Video', 'slug' => 'video']);

    $response = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Video Pembelajaran Goho & Juho',
        'code' => 'VID-001',
        'category_id' => $category->id,
        'type' => 'video',
        'source_type' => 'video',
        'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'video_allow_portal' => true,
        'status' => 'published',
    ]);

    $response->assertRedirect('/admin/koleksi');

    $material = Material::where('code', 'VID-001')->first();
    expect($material)->not->toBeNull()
        ->and($material->source_type)->toBe('video')
        ->and($material->video_provider)->toBe('youtube')
        ->and($material->video_id)->toBe('dQw4w9WgXcQ')
        ->and($material->embed_url)->toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
        ->and($material->hasValidSource())->toBeTrue();
});

test('store material rejects invalid video provider or dangerous external url', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Validasi', 'slug' => 'validasi']);

    // Dangerous external URL: localhost / private IP
    $respLocalhost = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Link Localhost Ilegal',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://localhost/buku.pdf',
        'status' => 'draft',
    ]);
    $respLocalhost->assertSessionHasErrors('external_url');

    // Unsupported video provider (e.g. dailymotion or raw iframe)
    $respVideo = $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Video Ilegal',
        'category_id' => $category->id,
        'type' => 'video',
        'source_type' => 'video',
        'video_url' => 'https://dailymotion.com/video/x7xyz',
        'status' => 'draft',
    ]);
    $respVideo->assertSessionHasErrors('video_url');
});

test('portal collections catalog displays published materials with valid sources across all source types', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Kategori Uji', 'slug' => 'kategori-uji']);

    // 1. PDF
    $pdf = UploadedFile::fake()->create('modul-pdf.pdf', 500, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Modul PDF Terbit',
        'code' => 'MOD-PDF',
        'category_id' => $category->id,
        'type' => 'module',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'book_file' => $pdf,
    ]);

    // 2. External Link
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Tautan Eksternal',
        'code' => 'EXT-BOOK',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://perkemi.or.id/buku-terbit',
        'status' => 'published',
    ]);

    // 3. Video
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Video Pembelajaran Terbit',
        'code' => 'VID-PLAY',
        'category_id' => $category->id,
        'type' => 'video',
        'source_type' => 'video',
        'video_url' => 'https://youtu.be/dQw4w9WgXcQ',
        'status' => 'published',
    ]);

    $response = $this->get('/koleksi');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Index')
            ->has('materials.data', 3)
            ->where('materials.data.0.cta_label', fn ($val) => in_array($val, ['Baca E-Book', 'Buka Buku Digital', 'Tonton Video']))
        );
});

test('download route alias /koleksi/{slug}/download functions identically to /unduh', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $reader = User::factory()->create(['role' => 'Peserta']);
    $category = Category::create(['name' => 'Modul', 'slug' => 'modul']);

    $pdfFile = UploadedFile::fake()->create('buku-download-alias.pdf', 600, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Download Alias',
        'code' => 'ALIAS-01',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'allow_download' => true,
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'ALIAS-01')->first();

    $responseUnduh = $this->actingAs($reader)->get("/koleksi/{$material->slug}/unduh");
    $responseUnduh->assertOk();

    $responseDownload = $this->actingAs($reader)->get("/koleksi/{$material->slug}/download");
    $responseDownload->assertOk();
});

test('admin can update material and replace book file via update route', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Modul Update', 'slug' => 'modul-update']);

    $pdfFile = UploadedFile::fake()->create('buku-awal.pdf', 600, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Buku Versi Pertama',
        'code' => 'VER-01',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'VER-01')->first();
    expect($material->activeFile->version)->toBe(1);

    $updatedPdf = UploadedFile::fake()->create('buku-versi-dua.pdf', 800, 'application/pdf');
    $response = $this->actingAs($admin)->put("/admin/koleksi/{$material->id}", [
        'title' => 'Buku Versi Pertama (Revisi)',
        'category_id' => $category->id,
        'type' => 'book',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'book_file' => $updatedPdf,
    ]);

    $response->assertRedirect('/admin/koleksi');

    $material->refresh();
    expect($material->title)->toBe('Buku Versi Pertama (Revisi)')
        ->and($material->activeFile->version)->toBe(2)
        ->and($material->activeFile->original_name)->toBe('buku-versi-dua.pdf')
        ->and($material->files()->count())->toBe(2);
});

test('admin can access collection create page with required props', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    Category::create(['name' => 'Kategori Baru', 'slug' => 'kategori-baru']);

    $response = $this->actingAs($admin)->get('/admin/koleksi/create');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Create')
            ->has('categories')
            ->has('source_types')
            ->has('material_types')
            ->has('status_options')
            ->has('max_file_size_mb')
        );
});

test('admin can access collection edit page with active_file and file_history props', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $category = Category::create(['name' => 'Modul Edit', 'slug' => 'modul-edit']);

    $pdfFile = UploadedFile::fake()->create('modul-edit-test.pdf', 500, 'application/pdf');
    $this->actingAs($admin)->post('/admin/koleksi', [
        'title' => 'Modul Edit Test',
        'code' => 'EDIT-01',
        'category_id' => $category->id,
        'type' => 'module',
        'source_type' => 'uploaded_pdf',
        'status' => 'draft',
        'book_file' => $pdfFile,
    ]);

    $material = Material::where('code', 'EDIT-01')->first();

    $response = $this->actingAs($admin)->get("/admin/koleksi/{$material->id}/edit");
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Edit')
            ->has('material')
            ->where('material.title', 'Modul Edit Test')
            ->has('active_file')
            ->where('active_file.original_name', 'modul-edit-test.pdf')
            ->where('active_file.version', 1)
            ->has('file_history', 1)
            ->has('max_file_size_mb')
        );
});

test('reader route redirects to external url when accessing external link with new_tab', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $material = Material::create([
        'title' => 'Buku Eksternal Tab Baru',
        'slug' => 'buku-eksternal-tab-baru',
        'code' => 'EXT-01',
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://perpusnas.go.id/buku-kempo',
        'external_open_mode' => 'new_tab',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $response = $this->actingAs($user)->get("/koleksi/{$material->slug}/baca");
    $response->assertRedirect('https://perpusnas.go.id/buku-kempo');
});

test('reader route redirects to detail page when accessing external link with embed', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $material = Material::create([
        'title' => 'Buku Eksternal Tersemat',
        'slug' => 'buku-eksternal-tersemat',
        'code' => 'EXT-02',
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://player.flipsnack.com/?hash=123',
        'external_open_mode' => 'embed',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $response = $this->actingAs($user)->get("/koleksi/{$material->slug}/baca");
    $response->assertRedirect("/koleksi/{$material->slug}");
});

test('reader route redirects to detail page when accessing uploaded_pdf without file', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $material = Material::create([
        'title' => 'PDF Tanpa File',
        'slug' => 'pdf-tanpa-file',
        'code' => 'PDF-99',
        'type' => 'book',
        'source_type' => 'uploaded_pdf',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $response = $this->actingAs($user)->get("/koleksi/{$material->slug}/baca");
    $response->assertRedirect("/koleksi/{$material->slug}");
    $response->assertSessionHas('error');
});

test('portal detail page passes embed_url for embeddable external links', function () {
    $user = User::factory()->create(['role' => 'Peserta']);
    $material = Material::create([
        'title' => 'Dokumen Google Drive Tersemat',
        'slug' => 'drive-tersemat',
        'code' => 'DRV-01',
        'type' => 'book',
        'source_type' => 'external_link',
        'external_url' => 'https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing',
        'external_open_mode' => 'embed',
        'status' => 'published',
        'created_by' => 1,
    ]);

    $response = $this->actingAs($user)->get("/koleksi/{$material->slug}");
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Portal/Collections/Show')
            ->where('material.embed_url', 'https://drive.google.com/file/d/1a2b3c4d5e/preview')
        );
});

test('admin can sync Peserta audience to all materials at once', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $pesertaAudience = Audience::create(['name' => 'Peserta', 'code' => 'participant']);
    $pelatihAudience = Audience::create(['name' => 'Pelatih', 'code' => 'coach']);

    $m1 = Material::create([
        'title' => 'Materi Satu',
        'slug' => 'materi-satu',
        'code' => 'M-01',
        'type' => 'book',
        'status' => 'published',
        'created_by' => $admin->id,
    ]);
    $m1->audiences()->sync([$pelatihAudience->id]);

    $m2 = Material::create([
        'title' => 'Materi Dua',
        'slug' => 'materi-dua',
        'code' => 'M-02',
        'type' => 'book',
        'status' => 'published',
        'created_by' => $admin->id,
    ]);

    expect($m1->audiences()->where('audiences.id', $pesertaAudience->id)->exists())->toBeFalse();
    expect($m2->audiences()->where('audiences.id', $pesertaAudience->id)->exists())->toBeFalse();

    $response = $this->actingAs($admin)->post('/admin/koleksi/sync-peserta');
    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect($m1->fresh()->audiences()->where('audiences.id', $pesertaAudience->id)->exists())->toBeTrue();
    expect($m2->fresh()->audiences()->where('audiences.id', $pesertaAudience->id)->exists())->toBeTrue();
    // Existing audience pelatih should remain intact
    expect($m1->fresh()->audiences()->where('audiences.id', $pelatihAudience->id)->exists())->toBeTrue();
});

test('collections index renders audiences list and sync stats via Inertia', function () {
    $admin = User::factory()->create(['role' => 'Admin']);
    $pesertaAudience = Audience::create(['name' => 'Peserta', 'code' => 'participant']);

    $material = Material::create([
        'title' => 'Materi Tes Akses',
        'slug' => 'materi-tes-akses',
        'code' => 'MTA-01',
        'type' => 'book',
        'status' => 'published',
        'created_by' => $admin->id,
    ]);
    $material->audiences()->sync([$pesertaAudience->id]);

    $response = $this->actingAs($admin)->get('/admin/koleksi');
    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Collections/Index')
            ->has('audiences_list')
            ->has('sync_peserta_stats')
            ->where('sync_peserta_stats.total', 1)
            ->where('sync_peserta_stats.with_peserta', 1)
            ->where('materials.data.0.has_peserta_audience', true)
        );
});

test('unauthenticated Inertia request returns 409 with X-Inertia-Location to login route', function () {
    $response = $this->withHeaders([
        'X-Inertia' => 'true',
    ])->delete('/admin/koleksi/1');

    $response->assertStatus(409);
    $response->assertHeader('X-Inertia-Location', route('login'));
});

test('MethodNotAllowedHttpException on login route redirects to login GET route', function () {
    $response = $this->delete('/login');

    $response->assertRedirect(route('login'));
});
