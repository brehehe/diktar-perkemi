<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\AdminCbtExamAttemptController;
use App\Http\Controllers\Admin\AttendanceController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CbtController;
use App\Http\Controllers\Admin\CbtPackageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EventCertificateController;
use App\Http\Controllers\Admin\EventController;
use App\Http\Controllers\Admin\EventDocumentNumberSettingController;
use App\Http\Controllers\Admin\EventReferenceController;
use App\Http\Controllers\Admin\ExamRevisionController;
use App\Http\Controllers\Admin\HelpController;
use App\Http\Controllers\Admin\LearningModuleController;
use App\Http\Controllers\Admin\MasterTrackController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\Admin\ParticipantController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\QuestionBankController;
use App\Http\Controllers\Admin\QuestionModuleController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\ShowcaseController;
use App\Http\Controllers\Admin\SpeakerController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\EventIntegrityPactController;
use App\Http\Controllers\EventPortalController;
use App\Http\Controllers\EventRegistrationFormController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ReaderController;
use App\Http\Controllers\SpeakerPortalController;
use App\Http\Middleware\EnsureEventAccess;
use App\Http\Middleware\EnsureMasterAccess;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Portal Web Pembaca (Dynamic Inertia)
Route::get('/', [PortalController::class, 'home'])->name('home');
Route::get('/koleksi', [PortalController::class, 'collections'])->name('portal.collections.index');
Route::get('/koleksi/{slug}', [PortalController::class, 'showCollection'])->name('portal.collections.show');
Route::get('/kategori', [PortalController::class, 'categoriesIndex'])->name('portal.categories.index');
Route::get('/kategori/{slug}', [PortalController::class, 'category'])->name('portal.categories.show');
Route::get('/untuk', [PortalController::class, 'rolesIndex'])->name('portal.roles.index');
Route::get('/untuk/{role}', [PortalController::class, 'role'])->name('portal.roles.show');
Route::get('/tentang', [PortalController::class, 'about'])->name('portal.about');
Route::get('/bantuan', [PortalController::class, 'help'])->name('portal.help');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);

    Route::get('/register', [RegisterController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [RegisterController::class, 'register']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'logout'])->name('logout');

    // Portal Buku Digital - Reader Akses Pembaca
    Route::get('/koleksi/{slug}/baca', [ReaderController::class, 'show'])->name('reader.show');
    Route::get('/koleksi/{slug}/file', [ReaderController::class, 'streamFile'])->name('reader.file');
    Route::get('/koleksi/{slug}/unduh', [ReaderController::class, 'downloadFile'])->name('reader.download');
    Route::get('/koleksi/{slug}/download', [ReaderController::class, 'downloadFile'])->name('reader.download.alias');
    Route::post('/koleksi/{slug}/progres', [ReaderController::class, 'saveProgress'])->name('reader.progress');
    Route::post('/koleksi/{slug}/bookmark', [ReaderController::class, 'storeBookmark'])->name('reader.bookmark.store');
    Route::delete('/koleksi/{slug}/bookmark/{bookmark}', [ReaderController::class, 'destroyBookmark'])->name('reader.bookmark.destroy');
});

Route::middleware('auth')->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->middleware(EnsureEventAccess::class)->name('dashboard');
    Route::get('/referensi-event', [EventReferenceController::class, 'index'])->name('event.references');

    Route::middleware(EnsureUserIsAdmin::class)->group(function () {

        // Koleksi (Materials)
        Route::get('/koleksi', [MaterialController::class, 'index'])->name('materials.index');
        Route::get('/koleksi/create', [MaterialController::class, 'create'])->name('materials.create');
        Route::post('/koleksi', [MaterialController::class, 'store'])->name('materials.store');
        Route::post('/koleksi/sync-peserta', [MaterialController::class, 'syncPesertaAudienceToAll'])->name('materials.sync-peserta');
        Route::get('/koleksi/{material}/edit', [MaterialController::class, 'edit'])->name('materials.edit');
        Route::put('/koleksi/{material}', [MaterialController::class, 'update'])->name('materials.update');
        Route::post('/koleksi/{material}/replace-file', [MaterialController::class, 'replaceFile'])->name('materials.replace-file');
        Route::patch('/koleksi/{material}/status', [MaterialController::class, 'updateStatus'])->name('materials.status');
        Route::delete('/koleksi/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');

        // Kategori (Categories)
        Route::get('/kategori', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('/kategori', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('/kategori/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/kategori/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        // Pengguna (Users)
        Route::get('/pengguna', [UserController::class, 'index'])->name('users.index');
        Route::post('/pengguna', [UserController::class, 'store'])->name('users.store');
        Route::patch('/pengguna/{user}/role', [UserController::class, 'updateRole'])->name('users.role');
        Route::patch('/pengguna/{user}/password', [UserController::class, 'updatePassword'])->name('users.password');

        // Hak Akses (Permissions)
        Route::get('/hak-akses', [PermissionController::class, 'index'])->name('permissions.index');
        Route::put('/hak-akses', [PermissionController::class, 'update'])->name('permissions.update');

        // Aktivitas (Audit Log)
        Route::get('/aktivitas', [ActivityController::class, 'index'])->name('activities.index');

        // Pengaturan Portal (Settings)
        Route::get('/pengaturan', [SettingController::class, 'index'])->name('settings.index');
        Route::put('/pengaturan', [SettingController::class, 'update'])->name('settings.update');

        // Showcase Beranda (Hero Book Showcase)
        Route::get('/showcase', [ShowcaseController::class, 'index'])->name('showcase.index');
        Route::post('/showcase', [ShowcaseController::class, 'update'])->name('showcase.update');
        Route::post('/showcase/reset', [ShowcaseController::class, 'reset'])->name('showcase.reset');

        // Bantuan Admin (Help)
        Route::get('/bantuan', [HelpController::class, 'index'])->name('help.index');
    });

    // Manajemen Penataran / Event
    Route::middleware(EnsureEventAccess::class)->group(function () {
        Route::get('/event', [EventController::class, 'index'])->name('event.index');
        Route::get('/event/create', [EventController::class, 'create'])->name('event.create');
        Route::post('/event', [EventController::class, 'store'])->name('event.store');
        Route::get('/event/{event}', [EventController::class, 'show'])->name('event.show');
        Route::get('/event/{event}/edit', [EventController::class, 'edit'])->name('event.edit');
        Route::put('/event/{event}', [EventController::class, 'update'])->name('event.update');
        Route::put('/event/{event}/nomor-dokumen', [EventDocumentNumberSettingController::class, 'update'])->name('event.document-numbers.update');
        Route::delete('/event/{event}', [EventController::class, 'destroy'])->name('event.destroy');

        // Event Sub-actions (Rundown, Modul, Peserta)
        Route::post('/event/{event}/sesi', [EventController::class, 'storeSession'])->name('event.session.store');
        Route::post('/event/{event}/kehadiran-awal', [EventController::class, 'storeArrivalSession'])->name('event.arrival.store');
        Route::put('/event/{event}/sesi/{session}', [EventController::class, 'updateSession'])->name('event.session.update');
        Route::delete('/event/{event}/sesi/{session}', [EventController::class, 'destroySession'])->name('event.session.destroy');
        Route::post('/event/{event}/ruang', [EventController::class, 'storeRoom'])->name('event.room.store');
        Route::delete('/event/{event}/ruang/{room}', [EventController::class, 'destroyRoom'])->name('event.room.destroy');
        Route::post('/event/{event}/legenda', [EventController::class, 'storeLegend'])->name('event.legend.store');
        Route::delete('/event/{event}/legenda/{legend}', [EventController::class, 'destroyLegend'])->name('event.legend.destroy');
        Route::post('/event/{event}/pemateri', [EventController::class, 'storeSpeaker'])->name('event.speaker.store');
        Route::patch('/event/{event}/pemateri/{speaker}/toggle-supervisor', [EventController::class, 'toggleSpeakerSupervisor'])->name('event.speaker.toggle-supervisor');
        Route::post('/event/{event}/pemateri/{speaker}/buat-akun', [EventController::class, 'createSpeakerAccount'])->name('event.speaker.create-account');
        Route::delete('/event/{event}/pemateri/{speaker}', [EventController::class, 'destroySpeaker'])->name('event.speaker.destroy');
        Route::post('/event/{event}/persyaratan', [EventController::class, 'storeRequirement'])->name('event.requirement.store');
        Route::delete('/event/{event}/persyaratan/{index}', [EventController::class, 'destroyRequirement'])->whereNumber('index')->name('event.requirement.destroy');
        Route::post('/event/{event}/fasilitas', [EventController::class, 'storeFacility'])->name('event.facility.store');
        Route::delete('/event/{event}/fasilitas/{index}', [EventController::class, 'destroyFacility'])->whereNumber('index')->name('event.facility.destroy');

        // Sesi Attendance & QR
        Route::post('/event/{event}/sesi/{session}/absensi/buka', [AttendanceController::class, 'open'])->name('event.session.attendance.open');
        Route::post('/event/{event}/sesi/{session}/absensi/tutup', [AttendanceController::class, 'close'])->name('event.session.attendance.close');
        Route::get('/event/{event}/sesi/{session}/cetak-qr', [AttendanceController::class, 'printQr'])->name('event.session.attendance.print');
        Route::get('/event/{event}/absensi/cetak-semua-qr', [AttendanceController::class, 'printAllQr'])->name('event.attendance.print-all-qr');
        Route::post('/event/{event}/absensi/override', [AttendanceController::class, 'override'])->name('event.attendance.override');
        Route::delete('/event/{event}/absensi/{attendance}', [AttendanceController::class, 'destroy'])->name('event.attendance.destroy');
        Route::delete('/event/{event}/absensi', [AttendanceController::class, 'destroyAll'])->name('event.attendance.destroy-all');
        Route::post('/event/{event}/absensi/generate', [AttendanceController::class, 'generateAll'])->name('event.attendance.generate-all');
        Route::get('/event/{event}/rundown/export-excel', [EventController::class, 'exportRundownExcel'])->name('event.rundown.export-excel');

        // Event CBT Packages
        Route::post('/event/{event}/cbt', [CbtController::class, 'storePackage'])->name('event.cbt.package.store');
        Route::put('/event/{event}/cbt/{package}', [CbtController::class, 'updatePackage'])->name('event.cbt.package.update');
        Route::delete('/event/{event}/cbt/{package}', [CbtController::class, 'destroyPackage'])->name('event.cbt.package.destroy');
        Route::post('/cbt/{package}/soal', [CbtController::class, 'storeQuestion'])->name('cbt.question.store');

        Route::post('/event/{event}/modul', [EventController::class, 'storeModule'])->name('event.module.store');
        Route::get('/event/{event}/modul/{module}/pdf', [EventController::class, 'downloadModuleFile'])->name('event.module.download');

        Route::get('/event/{event}/peserta/export-excel', [EventController::class, 'exportParticipantsExcel'])->name('event.participants.export-excel');
        Route::post('/event/{event}/peserta', [EventController::class, 'addParticipant'])->name('event.participant.store');
        Route::post('/event/{event}/peserta-baru', [EventController::class, 'createAndAddParticipant'])->name('event.participant.create-and-add');
        Route::post('/event/{event}/jalur', [EventController::class, 'storeTrack'])->name('event.track.store');
        Route::put('/event/{event}/peserta/{eventParticipant}', [EventController::class, 'updateParticipant'])->name('event.participant.update');
        Route::delete('/event/{event}/peserta/{eventParticipant}/hasil', [AttendanceController::class, 'destroyParticipantResults'])->name('event.participant-results.destroy');
        Route::delete('/event/{event}/peserta/{eventParticipant}', [EventController::class, 'removeParticipant'])->name('event.participant.destroy');
        Route::post('/event/{event}/formulir/{form}/verifikasi', [EventRegistrationFormController::class, 'verify'])->name('event.registration-form.verify');
        Route::post('/event/{event}/formulir/upload', [EventRegistrationFormController::class, 'upload'])->name('event.registration-form.admin-upload');
        Route::get('/event/{event}/formulir/{participant}/cetak', [EventRegistrationFormController::class, 'print'])->name('event.registration-form.admin-print');
        Route::get('/event/{event}/pakta-integritas/{participant}/cetak', [EventIntegrityPactController::class, 'print'])->name('event.integrity-pact.admin-print');
        Route::post('/event/{event}/pakta-integritas/{pact}/verifikasi', [EventIntegrityPactController::class, 'verify'])->name('event.integrity-pact.verify');
        Route::post('/event/{event}/pakta-integritas/upload', [EventIntegrityPactController::class, 'upload'])->name('event.integrity-pact.admin-upload');
        Route::get('/event/{event}/cbt-attempts/{attempt}/detail', [AdminCbtExamAttemptController::class, 'showDetail'])->name('event.cbt-attempt.detail');
        Route::post('/event/{event}/cbt-attempts/{attempt}/mulai-ulang', [AdminCbtExamAttemptController::class, 'restartAttempt'])->name('event.cbt-attempt.restart');
        Route::post('/event/{event}/cbt-attempts/mulai-ulang-semua', [AdminCbtExamAttemptController::class, 'restartAllAttempts'])->name('event.cbt-attempt.restart-all');
        Route::delete('/event/{event}/cbt-attempts/{attempt}', [AdminCbtExamAttemptController::class, 'destroyAttempt'])->name('event.cbt-attempt.destroy');
        Route::delete('/event/{event}/cbt-attempts', [AdminCbtExamAttemptController::class, 'destroyAllAttempts'])->name('event.cbt-attempt.destroy-all');
        Route::post('/event/{event}/peserta/{eventParticipant}/sertifikat/generate', [EventCertificateController::class, 'generateCertificate'])->name('event.certificate.generate');
        Route::post('/event/{event}/dokumen/generate', [EventCertificateController::class, 'generateMissingDocuments'])->name('event.documents.generate');
        Route::post('/event/{event}/peserta/{eventParticipant}/sertifikat', [EventCertificateController::class, 'store'])->name('event.certificate.store');
        Route::get('/event/{event}/peserta/{eventParticipant}/sertifikat', [EventCertificateController::class, 'download'])->name('event.certificate.download');
        Route::get('/event/{event}/peserta/{eventParticipant}/sertifikat/preview', [EventCertificateController::class, 'previewCertificate'])->name('event.certificate.preview');
        Route::delete('/event/{event}/peserta/{eventParticipant}/sertifikat', [EventCertificateController::class, 'destroyCertificate'])->name('event.certificate.destroy');
        Route::post('/event/{event}/peserta/{eventParticipant}/transkrip/generate', [EventCertificateController::class, 'generateTranscript'])->name('event.transcript.generate');
        Route::post('/event/{event}/peserta/{eventParticipant}/transkrip', [EventCertificateController::class, 'storeTranscript'])->name('event.transcript.store');
        Route::get('/event/{event}/peserta/{eventParticipant}/transkrip', [EventCertificateController::class, 'downloadTranscript'])->name('event.transcript.download');
        Route::get('/event/{event}/peserta/{eventParticipant}/transkrip/preview', [EventCertificateController::class, 'previewTranscript'])->name('event.transcript.preview');
        Route::delete('/event/{event}/peserta/{eventParticipant}/transkrip', [EventCertificateController::class, 'destroyTranscript'])->name('event.transcript.destroy');
        Route::get('/event/{event}/revisi/{attempt}/pdf', [ExamRevisionController::class, 'download'])->name('event.revision.download');
        Route::get('/event/{event}/revisi/{attempt}/baca', [ExamRevisionController::class, 'reader'])->name('event.revision.reader');
        Route::get('/event/{event}/revisi/{attempt}/pratinjau', [ExamRevisionController::class, 'preview'])->name('event.revision.preview');
        Route::patch('/event/{event}/revisi/{attempt}', [ExamRevisionController::class, 'review'])->name('event.revision.review');

        // Event Modul & CBT Linking
        Route::post('/event/{event}/modul-pembelajaran', [EventController::class, 'attachLearningModule'])->name('event.learning-module.attach');
        Route::delete('/event/{event}/modul-pembelajaran/{module}', [EventController::class, 'detachLearningModule'])->name('event.learning-module.detach');
        Route::post('/event/{event}/cbt-package', [EventController::class, 'attachCbtPackage'])->name('event.cbt-package.attach');
        Route::delete('/event/{event}/cbt-package/{package}', [EventController::class, 'detachCbtPackage'])->name('event.cbt-package.detach');
    });

    Route::middleware(EnsureMasterAccess::class)->group(function () {

        // Master Pemateri
        Route::get('/master/pemateri', [SpeakerController::class, 'index'])->name('master.pemateri.index');
        Route::get('/master/pemateri/format-impor', [SpeakerController::class, 'downloadTemplate'])->name('master.pemateri.template');
        Route::post('/master/pemateri/impor', [SpeakerController::class, 'import'])->name('master.pemateri.import');
        Route::get('/master/pemateri/ekspor', [SpeakerController::class, 'export'])->name('master.pemateri.export');
        Route::post('/master/pemateri', [SpeakerController::class, 'store'])->name('master.pemateri.store');
        Route::put('/master/pemateri/{speaker}', [SpeakerController::class, 'update'])->name('master.pemateri.update');
        Route::patch('/master/pemateri/{speaker}/toggle-supervisor', [SpeakerController::class, 'toggleSupervisor'])->name('master.pemateri.toggle-supervisor');
        Route::post('/master/pemateri/{speaker}/buat-akun', [SpeakerController::class, 'createAccount'])->name('master.pemateri.create-account');
        Route::delete('/master/pemateri/{speaker}', [SpeakerController::class, 'destroy'])->name('master.pemateri.destroy');

        // Master Peserta
        Route::get('/master/peserta', [ParticipantController::class, 'index'])->name('master.peserta.index');
        Route::get('/master/peserta/format-impor', [ParticipantController::class, 'downloadTemplate'])->name('master.peserta.template');
        Route::post('/master/peserta/impor', [ParticipantController::class, 'import'])->name('master.peserta.import');
        Route::get('/master/peserta/ekspor', [ParticipantController::class, 'export'])->name('master.peserta.export');
        Route::post('/master/peserta', [ParticipantController::class, 'store'])->name('master.peserta.store');
        Route::get('/master/peserta/{participant}', [ParticipantController::class, 'show'])->name('master.peserta.show');
        Route::put('/master/peserta/{participant}', [ParticipantController::class, 'update'])->name('master.peserta.update');
        Route::patch('/master/peserta/{participant}/akun', [ParticipantController::class, 'linkAccount'])->name('master.peserta.link-account');
        Route::delete('/master/peserta/{participant}', [ParticipantController::class, 'destroy'])->name('master.peserta.destroy');

        // Master Jalur & Legenda
        Route::get('/master/jalur', [MasterTrackController::class, 'index'])->name('master.jalur.index');
        Route::get('/master/jalur/format-impor', [MasterTrackController::class, 'downloadTrackTemplate'])->name('master.jalur.template');
        Route::post('/master/jalur/impor', [MasterTrackController::class, 'importTracks'])->name('master.jalur.import');
        Route::get('/master/jalur/ekspor', [MasterTrackController::class, 'exportTracks'])->name('master.jalur.export');
        Route::post('/master/jalur', [MasterTrackController::class, 'storeTrack'])->name('master.jalur.store');
        Route::put('/master/jalur/{track}', [MasterTrackController::class, 'updateTrack'])->name('master.jalur.update');
        Route::delete('/master/jalur/{track}', [MasterTrackController::class, 'destroyTrack'])->name('master.jalur.destroy');

        Route::get('/master/legenda/format-impor', [MasterTrackController::class, 'downloadLegendTemplate'])->name('master.legenda.template');
        Route::post('/master/legenda/impor', [MasterTrackController::class, 'importLegends'])->name('master.legenda.import');
        Route::get('/master/legenda/ekspor', [MasterTrackController::class, 'exportLegends'])->name('master.legenda.export');
        Route::post('/master/legenda', [MasterTrackController::class, 'storeLegend'])->name('master.legenda.store');
        Route::put('/master/legenda/{legend}', [MasterTrackController::class, 'updateLegend'])->name('master.legenda.update');
        Route::delete('/master/legenda/{legend}', [MasterTrackController::class, 'destroyLegend'])->name('master.legenda.destroy');

        // Master Modul Pembelajaran
        Route::get('/master/modul-pembelajaran', [LearningModuleController::class, 'index'])->name('master.modul-pembelajaran.index');
        Route::get('/master/modul-pembelajaran/format-impor', [LearningModuleController::class, 'downloadImportTemplate'])->name('master.modul-pembelajaran.template');
        Route::post('/master/modul-pembelajaran/impor', [LearningModuleController::class, 'import'])->name('master.modul-pembelajaran.import');
        Route::post('/master/modul-pembelajaran', [LearningModuleController::class, 'store'])->name('master.modul-pembelajaran.store');
        Route::put('/master/modul-pembelajaran/{module}', [LearningModuleController::class, 'update'])->name('master.modul-pembelajaran.update');
        Route::put('/master/modul-pembelajaran/{module}/materi', [LearningModuleController::class, 'updateMaterials'])->name('master.modul-pembelajaran.materials.update');
        Route::post('/master/modul-pembelajaran/{module}/upload-materi', [LearningModuleController::class, 'uploadMaterial'])->name('master.modul-pembelajaran.upload-material');
        Route::patch('/master/modul-pembelajaran/{module}/arsip', [LearningModuleController::class, 'archive'])->name('master.modul-pembelajaran.archive');
        Route::delete('/master/modul-pembelajaran/{module}', [LearningModuleController::class, 'destroy'])->name('master.modul-pembelajaran.destroy');
        Route::post('/master/modul-pembelajaran/{module}/hubungkan-event', [LearningModuleController::class, 'linkToEvent'])->name('master.modul-pembelajaran.link-event');

        // Master Modul Soal
        Route::get('/master/modul-soal', [QuestionModuleController::class, 'index'])->name('master.modul-soal.index');
        Route::get('/master/modul-soal/format-kosong', [QuestionModuleController::class, 'downloadBlankTemplate'])->name('master.modul-soal.template');
        Route::post('/master/modul-soal/impor', [QuestionModuleController::class, 'import'])->name('master.modul-soal.import');
        Route::get('/master/modul-soal/ekspor', [QuestionModuleController::class, 'export'])->name('master.modul-soal.export');
        Route::post('/master/modul-soal', [QuestionModuleController::class, 'store'])->name('master.modul-soal.store');
        Route::get('/master/modul-soal/{module}', [QuestionModuleController::class, 'show'])->name('master.modul-soal.show');
        Route::put('/master/modul-soal/{module}', [QuestionModuleController::class, 'update'])->name('master.modul-soal.update');
        Route::patch('/master/modul-soal/{module}/arsip', [QuestionModuleController::class, 'archive'])->name('master.modul-soal.archive');
        Route::delete('/master/modul-soal/{module}', [QuestionModuleController::class, 'destroy'])->name('master.modul-soal.destroy');

        // Master Bank Soal
        Route::get('/master/bank-soal', [QuestionBankController::class, 'index'])->name('master.bank-soal.index');
        Route::get('/master/bank-soal/format-impor', [QuestionBankController::class, 'downloadTemplate'])->name('master.bank-soal.template');
        Route::post('/master/bank-soal/impor', [QuestionBankController::class, 'import'])->name('master.bank-soal.import');
        Route::get('/master/bank-soal/ekspor', [QuestionBankController::class, 'export'])->name('master.bank-soal.export');
        Route::post('/master/bank-soal', [QuestionBankController::class, 'store'])->name('master.bank-soal.store');
        Route::put('/master/bank-soal/{question}', [QuestionBankController::class, 'update'])->name('master.bank-soal.update');
        Route::delete('/master/bank-soal/{question}', [QuestionBankController::class, 'destroy'])->name('master.bank-soal.destroy');
        Route::post('/master/bank-soal/hapus-massal', [QuestionBankController::class, 'bulkDestroy'])->name('master.bank-soal.bulk-destroy');

        // Master CBT: Paket Ujian
        Route::get('/cbt/paket-ujian', [CbtPackageController::class, 'index'])->name('cbt.paket-ujian.index');
        Route::get('/cbt/paket-ujian/format-impor', [CbtPackageController::class, 'downloadTemplate'])->name('cbt.paket-ujian.template');
        Route::post('/cbt/paket-ujian/impor', [CbtPackageController::class, 'import'])->name('cbt.paket-ujian.import');
        Route::get('/cbt/paket-ujian/ekspor', [CbtPackageController::class, 'export'])->name('cbt.paket-ujian.export');
        Route::post('/cbt/paket-ujian', [CbtPackageController::class, 'store'])->name('cbt.paket-ujian.store');
        Route::get('/cbt/paket-ujian/{package}', [CbtPackageController::class, 'show'])->name('cbt.paket-ujian.show');
        Route::put('/cbt/paket-ujian/{package}', [CbtPackageController::class, 'update'])->name('cbt.paket-ujian.update');
        Route::patch('/cbt/paket-ujian/{package}/status', [CbtPackageController::class, 'updateStatus'])->name('cbt.paket-ujian.status');
        Route::post('/cbt/paket-ujian/{package}/soal', [CbtPackageController::class, 'syncQuestions'])->name('cbt.paket-ujian.sync-questions');
        Route::post('/cbt/paket-ujian/{package}/tarik-soal-modul', [CbtPackageController::class, 'pullFromBlueprintModules'])->name('cbt.paket-ujian.pull-module-questions');
        Route::delete('/cbt/paket-ujian/{package}', [CbtPackageController::class, 'destroy'])->name('cbt.paket-ujian.destroy');
    });
});

// Portal Peserta Event (Welcome Screen, Check-In, Ruang Belajar, Scan QR, CBT)
Route::middleware('auth')->group(function () {
    Route::get('/event-saya', [EventPortalController::class, 'index'])->name('event.mine');
    Route::get('/sertifikat-saya', [EventPortalController::class, 'certificates'])->name('event.certificates.mine');
    Route::get('/event/{slug}/welcome', [EventPortalController::class, 'welcome'])->name('event.welcome');
    Route::post('/event/{slug}/welcome/seen', [EventPortalController::class, 'markSeen'])->name('event.welcome.seen');
    Route::post('/event/{slug}/check-in', [EventPortalController::class, 'checkIn'])->name('event.check-in');
    Route::get('/event/{slug}/formulir-pendaftaran', [EventRegistrationFormController::class, 'show'])->name('event.registration-form');
    Route::post('/event/{slug}/formulir-pendaftaran', [EventRegistrationFormController::class, 'store'])->name('event.registration-form.store');
    Route::post('/event/{slug}/formulir-pendaftaran/upload', [EventRegistrationFormController::class, 'upload'])->name('event.registration-form.upload');
    Route::get('/event/{slug}/formulir-pendaftaran/cetak/{participantId?}', [EventRegistrationFormController::class, 'print'])->name('event.registration-form.print');
    Route::get('/event/{slug}/pakta-integritas', [EventIntegrityPactController::class, 'show'])->name('event.integrity-pact');
    Route::post('/event/{slug}/pakta-integritas', [EventIntegrityPactController::class, 'store'])->name('event.integrity-pact.store');
    Route::post('/event/{slug}/pakta-integritas/upload', [EventIntegrityPactController::class, 'upload'])->name('event.integrity-pact.upload');
    Route::get('/event/{slug}/pakta-integritas/cetak', [EventIntegrityPactController::class, 'print'])->name('event.integrity-pact.print');
    Route::get('/event/{event}/pakta-integritas/{participant}/cetak-admin', [EventIntegrityPactController::class, 'print'])->name('event.integrity-pact.admin-print');
    Route::get('/event/{slug}/ruang-belajar', [EventPortalController::class, 'learningRoom'])->name('event.learning-room');
    Route::get('/event/{slug}/scan', [EventPortalController::class, 'scan'])->name('event.scan');
    Route::get('/event/{slug}/sertifikat', [EventPortalController::class, 'downloadCertificate'])->name('event.certificate.mine');
    Route::get('/event/{slug}/transkrip', [EventPortalController::class, 'downloadTranscript'])->name('event.transcript.mine');
    Route::get('/event/{slug}/materi/{module}/pdf', [EventPortalController::class, 'moduleFile'])->name('event.module.file');
    Route::post('/event/{slug}/absensi/catat', [EventPortalController::class, 'recordAttendance'])->name('event.attendance.record');
    Route::get('/event/{slug}/cbt/{packageCode}', [EventPortalController::class, 'cbtExam'])->name('event.cbt.exam');
    Route::post('/event/{slug}/cbt/{packageCode}/jawaban', [EventPortalController::class, 'saveCbtAnswer'])->name('event.cbt.save-answer');
    Route::post('/event/{slug}/cbt/{packageCode}/pengawasan', [EventPortalController::class, 'storeCbtProctoringEvent'])->name('event.cbt.proctoring.store');
    Route::post('/event/{slug}/cbt/{packageCode}/submit', [EventPortalController::class, 'submitCbtExam'])->name('event.cbt.submit');
    Route::post('/event/{slug}/revisi/{attempt}', [EventPortalController::class, 'submitRevision'])->name('event.revision.submit');
    Route::get('/event/{slug}/revisi/{attempt}/baca', [EventPortalController::class, 'revisionReader'])->name('event.revision.mine.reader');
    Route::get('/event/{slug}/revisi/{attempt}/pratinjau', [EventPortalController::class, 'revisionPreview'])->name('event.revision.mine.preview');
});

// Portal Pemateri (Jadwal & Materi Mengajar)
Route::middleware('auth')->prefix('pemateri')->name('speaker.')->group(function () {
    Route::get('/jadwal', [SpeakerPortalController::class, 'schedule'])->name('schedule');
    Route::get('/sesi/{session}/materi/{material}/baca', [SpeakerPortalController::class, 'readMaterial'])->name('material.read');
    Route::get('/sesi/{session}/materi/{material}/unduh', [SpeakerPortalController::class, 'downloadMaterial'])->name('material.download');
    Route::get('/sesi/{session}/modul/{module}/pdf', [SpeakerPortalController::class, 'downloadModulePdf'])->name('module.download');
});
