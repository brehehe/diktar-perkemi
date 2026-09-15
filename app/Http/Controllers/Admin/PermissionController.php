<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePermissionsRequest;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PermissionController extends Controller
{
    /**
     * Display role and permission matrix.
     */
    public function index(): Response
    {
        $roles = Role::with('permissions')
            ->orderBy('id')
            ->get()
            ->map(fn (Role $r) => [
                'id' => $r->id,
                'name' => $r->name,
                'description' => $r->description,
                'permission_ids' => $r->permissions->pluck('id')->toArray(),
            ]);

        $permissions = Permission::orderBy('id')
            ->get()
            ->map(fn (Permission $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'label' => $p->label,
                'module' => $p->module,
                'description' => $p->description,
            ]);

        return Inertia::render('Admin/Permissions/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Update the permission matrix for roles.
     */
    public function update(UpdatePermissionsRequest $request): RedirectResponse
    {
        $matrix = (array) $request->input('matrix', []);
        $roles = Role::all();

        foreach ($roles as $role) {
            $permissionIds = isset($matrix[$role->id]) ? array_keys((array) $matrix[$role->id]) : [];
            $role->permissions()->sync($permissionIds);
        }

        ActivityLog::record('permissions.updated', null, [
            'updated_by' => auth()->user()?->name,
        ]);

        return back()->with('success', 'Matriks hak akses dan wewenang peran berhasil diperbarui.');
    }
}
