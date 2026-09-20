<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSettingsRequest;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the portal settings form with tabs.
     */
    public function index(): Response
    {
        $settings = Setting::all()->pluck('value', 'key');

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update portal settings.
     */
    public function update(UpdateSettingsRequest $request): RedirectResponse
    {
        $data = $request->except(['_token', '_method']);
        $group = $request->input('settings_group', 'general');
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
