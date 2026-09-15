<?php

use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\HelpController;
use App\Http\Controllers\Admin\MaterialController;
use App\Http\Controllers\Admin\PermissionController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\ReaderController;
use App\Http\Middleware\EnsureUserIsAdmin;
use Illuminate\Support\Facades\Route;

// Portal Web Pembaca (Public & Dynamic Inertia)
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
});

Route::middleware(['auth', EnsureUserIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Koleksi (Materials)
    Route::get('/koleksi', [MaterialController::class, 'index'])->name('materials.index');
    Route::get('/koleksi/create', [MaterialController::class, 'create'])->name('materials.create');
    Route::post('/koleksi', [MaterialController::class, 'store'])->name('materials.store');
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

    // Hak Akses (Permissions)
    Route::get('/hak-akses', [PermissionController::class, 'index'])->name('permissions.index');
    Route::put('/hak-akses', [PermissionController::class, 'update'])->name('permissions.update');

    // Aktivitas (Audit Log)
    Route::get('/aktivitas', [ActivityController::class, 'index'])->name('activities.index');

    // Pengaturan Portal (Settings)
    Route::get('/pengaturan', [SettingController::class, 'index'])->name('settings.index');
    Route::put('/pengaturan', [SettingController::class, 'update'])->name('settings.update');

    // Bantuan Admin (Help)
    Route::get('/bantuan', [HelpController::class, 'index'])->name('help.index');
});
