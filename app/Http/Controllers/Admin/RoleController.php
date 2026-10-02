<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class RoleController extends Controller
{
    /**
     * Display a listing of system and custom roles.
     */
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('q', ''));

        $rolesQuery = Role::withCount('permissions')->orderBy('id');

        if ($search !== '') {
            $rolesQuery->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('label', 'ilike', "%{$search}%")
                    ->orWhere('description', 'ilike', "%{$search}%");
            });
        }

        $allRoles = $rolesQuery->get();

        $roles = $allRoles->map(function (Role $role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'label' => $role->label,
                'description' => $role->description,
                'guard_name' => $role->guard_name,
                'permissions_count' => (int) $role->permissions_count,
                'users_count' => $role->getUsersCount(),
                'is_system' => $role->isSystemRole(),
                'created_at' => $role->created_at?->format('d M Y') ?? '-',
            ];
        });

        $totalRoles = Role::count();
        $systemRolesCount = Role::whereIn('name', [
            'super-admin', 'admin', 'content-admin', 'user-admin', 'diktar',
            'organizer', 'speaker', 'coach', 'examiner', 'referee', 'participant',
        ])->count();
        $customRolesCount = max(0, $totalRoles - $systemRolesCount);
        $totalPermissions = Permission::count();

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'metrics' => [
                'total_roles' => $totalRoles,
                'system_roles' => $systemRolesCount,
                'custom_roles' => $customRolesCount,
                'total_permissions' => $totalPermissions,
            ],
            'filters' => [
                'q' => $search,
            ],
        ]);
    }

    /**
     * Store a newly created role.
     */
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $role = Role::create([
            'name' => Str::slug($validated['name']),
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
            'guard_name' => $validated['guard_name'] ?? 'web',
        ]);

        ActivityLog::record('role.created', $role, [
            'name' => $role->name,
            'label' => $role->label,
            'created_by' => auth()->user()?->name,
        ]);

        return redirect()->route('admin.roles.index')->with('success', "Peran \"{$role->label}\" berhasil ditambahkan.");
    }

    /**
     * Update the specified role.
     */
    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $validated = $request->validated();

        $updateData = [
            'label' => $validated['label'],
            'description' => $validated['description'] ?? null,
        ];

        if (! $role->isSystemRole() && ! empty($validated['name'])) {
            $updateData['name'] = Str::slug($validated['name']);
        }

        $role->update($updateData);

        ActivityLog::record('role.updated', $role, [
            'name' => $role->name,
            'label' => $role->label,
            'updated_by' => auth()->user()?->name,
        ]);

        return back()->with('success', "Peran \"{$role->label}\" berhasil diperbarui.");
    }

    /**
     * Remove the specified role from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        if ($role->isSystemRole()) {
            return back()->with('error', 'Peran bawaan sistem tidak dapat dihapus.');
        }

        $usersCount = $role->getUsersCount();
        if ($usersCount > 0) {
            return back()->with('error', "Peran \"{$role->label}\" tidak dapat dihapus karena masih digunakan oleh {$usersCount} pengguna.");
        }

        $label = $role->label;
        $role->permissions()->detach();
        $role->delete();

        ActivityLog::record('role.deleted', null, [
            'name' => $role->name,
            'label' => $label,
            'deleted_by' => auth()->user()?->name,
        ]);

        return back()->with('success', "Peran \"{$label}\" berhasil dihapus.");
    }
}
