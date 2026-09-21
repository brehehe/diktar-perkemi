<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\ActivityLog;
use App\Models\Setting;
use App\Services\EventDocumentGenerator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the portal settings form with tabs.
     */
    public function index(EventDocumentGenerator $documentGenerator): Response
    {
        $settings = Setting::all()->pluck('value', 'key');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'documentNumberLabels' => EventDocumentGenerator::NUMBER_LABELS,
            'documentNumberDefaults' => $documentGenerator->adminNumberSettings(),
        ]);
    }

    /**
     * Update portal settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $group = $request->input('settings_group', 'general');
        $data = $group === 'certificate_numbers'
            ? collect($request->validated())->except('settings_group')->all()
            : $request->except(['_token', '_method']);
        $timestamp = now();
        $settings = collect($data)
            ->except('settings_group')
            ->map(fn ($value, string $key) => [
                'key' => $key,
                'value' => (string) $value,
                'group' => $group,
                'created_at' => $timestamp,
                'updated_at' => $timestamp,
            ])
            ->values()
            ->all();

        DB::transaction(function () use ($settings, $group): void {
            if ($settings !== []) {
                Setting::query()->upsert($settings, ['key'], ['value', 'group', 'updated_at']);
            }

            ActivityLog::record('settings.updated', null, ['group' => $group]);
        });

        return back()->with('success', 'Pengaturan portal berhasil disimpan.');
    }
}
