<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePermissionsRequest;
use App\Models\ActivityLog;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
        $assignments = $roles->flatMap(function (Role $role) use ($matrix): array {
            $permissionIds = isset($matrix[$role->id]) ? array_keys((array) $matrix[$role->id]) : [];

            return array_map(fn ($permissionId) => [
                'role_id' => $role->id,
                'permission_id' => (int) $permissionId,
            ], $permissionIds);
        })->all();

        DB::transaction(function () use ($roles, $assignments): void {
            DB::table('role_has_permissions')->whereIn('role_id', $roles->modelKeys())->delete();
            if ($assignments !== []) {
                DB::table('role_has_permissions')->insert($assignments);
            }

            ActivityLog::record('permissions.updated', null, [
                'updated_by' => auth()->user()?->name,
            ]);
        });

        return back()->with('success', 'Matriks hak akses dan wewenang peran berhasil diperbarui.');
    }
}
