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
        Schema::table('materials', function (Blueprint $table) {
            if (! Schema::hasColumn('materials', 'author')) {
                $table->string('author')->nullable()->after('type');
            }
            if (! Schema::hasColumn('materials', 'keywords')) {
                $table->string('keywords')->nullable()->after('description');
            }
            if (! Schema::hasColumn('materials', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('review_notes');
            }
        });

        if (! Schema::hasTable('material_files')) {
            Schema::create('material_files', function (Blueprint $table) {
                $table->id();
                $table->foreignId('material_id');
                $table->string('kind')->default('main');
                $table->string('disk')->default('local');
                $table->string('path');
                $table->string('storage_name')->nullable();
                $table->string('original_name');
                $table->string('mime_type');
                $table->string('extension')->default('pdf');
                $table->unsignedBigInteger('size_bytes')->default(0);
                $table->string('checksum_sha256')->nullable();
                $table->integer('page_count')->nullable();
                $table->smallInteger('sort_order')->default(0);
                $table->unsignedSmallInteger('version')->default(1);
                $table->boolean('is_active')->default(true);
                $table->foreignId('uploaded_by')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        } else {
            Schema::table('material_files', function (Blueprint $table) {
                if (! Schema::hasColumn('material_files', 'version')) {
                    $table->unsignedSmallInteger('version')->default(1)->after('size_bytes');
                }
                if (! Schema::hasColumn('material_files', 'storage_name')) {
                    $table->string('storage_name')->nullable()->after('path');
                }
                if (! Schema::hasColumn('material_files', 'uploaded_by')) {
                    $table->foreignId('uploaded_by')->nullable()->after('is_active');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('material_files', function (Blueprint $table) {
            if (Schema::hasColumn('material_files', 'uploaded_by')) {
                $table->dropColumn('uploaded_by');
            }
            if (Schema::hasColumn('material_files', 'storage_name')) {
                $table->dropColumn('storage_name');
            }
            if (Schema::hasColumn('material_files', 'version')) {
                $table->dropColumn('version');
            }
        });

        Schema::table('materials', function (Blueprint $table) {
            if (Schema::hasColumn('materials', 'admin_notes')) {
                $table->dropColumn('admin_notes');
            }
            if (Schema::hasColumn('materials', 'keywords')) {
                $table->dropColumn('keywords');
            }
            if (Schema::hasColumn('materials', 'author')) {
                $table->dropColumn('author');
            }
        });
    }
};
