<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('categories')) {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('parent_id')->nullable();
                $table->string('name');
                $table->string('slug');
                $table->text('description')->nullable();
                $table->string('icon')->nullable();
                $table->string('color')->nullable();
                $table->smallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('materials')) {
            Schema::create('materials', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('slug');
                $table->string('code')->nullable();
                $table->string('isbn')->nullable();
                $table->text('summary')->nullable();
                $table->text('description')->nullable();
                $table->string('cover_path')->nullable();
                $table->string('type');
                $table->string('status')->default('draft');
                $table->smallInteger('publication_year')->nullable();
                $table->string('language_code')->default('id');
                $table->integer('page_count')->nullable();
                $table->integer('duration_seconds')->nullable();
                $table->boolean('is_downloadable')->default(false);
                $table->boolean('is_featured')->default(false);
                $table->timestamp('published_at')->nullable();
                $table->timestamp('reviewed_at')->nullable();
                $table->timestamp('archived_at')->nullable();
                $table->foreignId('created_by')->default(1);
                $table->foreignId('reviewed_by')->nullable();
                $table->text('review_notes')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('category_material')) {
            Schema::create('category_material', function (Blueprint $table) {
                $table->foreignId('category_id');
                $table->foreignId('material_id');
                $table->boolean('is_primary')->default(false);
            });
        }

        if (! Schema::hasTable('roles')) {
            Schema::create('roles', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('guard_name')->default('web');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('permissions')) {
            Schema::create('permissions', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('guard_name')->default('web');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('role_has_permissions')) {
            Schema::create('role_has_permissions', function (Blueprint $table) {
                $table->foreignId('permission_id');
                $table->foreignId('role_id');
            });
        }

        if (! Schema::hasTable('audiences')) {
            Schema::create('audiences', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code');
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('audience_material')) {
            Schema::create('audience_material', function (Blueprint $table) {
                $table->foreignId('audience_id');
                $table->foreignId('material_id');
            });
        }

        if (! Schema::hasTable('activity_logs')) {
            Schema::create('activity_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('actor_id')->nullable();
                $table->string('event');
                $table->string('subject_type')->nullable();
                $table->unsignedBigInteger('subject_id')->nullable();
                $table->json('properties')->nullable();
                $table->string('ip_address')->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamp('created_at')->useCurrent();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('audience_material');
        Schema::dropIfExists('audiences');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('category_material');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('categories');
    }
};
