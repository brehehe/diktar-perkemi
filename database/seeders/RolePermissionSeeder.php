<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'dashboard.view' => 'web',
            'materials.view' => 'web',
            'materials.create' => 'web',
            'materials.update' => 'web',
            'materials.review' => 'web',
            'materials.publish' => 'web',
            'materials.archive' => 'web',
            'materials.delete' => 'web',
            'materials.restore' => 'web',
            'users.view' => 'web',
            'users.update' => 'web',
            'users.suspend' => 'web',
            'roles.manage' => 'web',
            'reports.view' => 'web',
            'reports.export' => 'web',
            'settings.manage' => 'web',
        ];

        $permissionModels = [];
        foreach ($permissions as $name => $guard) {
            $permissionModels[$name] = Permission::firstOrCreate(
                ['name' => $name],
                ['guard_name' => $guard]
            );
        }

        $roles = [
            'super-admin' => array_keys($permissions),
            'content-admin' => [
                'dashboard.view',
                'materials.view',
                'materials.create',
                'materials.update',
                'materials.review',
                'materials.publish',
                'materials.archive',
                'reports.view',
            ],
            'user-admin' => [
                'dashboard.view',
                'users.view',
                'users.update',
                'users.suspend',
                'roles.manage',
                'reports.view',
            ],
            'reviewer' => [
                'dashboard.view',
                'materials.view',
                'materials.review',
                'reports.view',
            ],
            'organizer' => [
                'dashboard.view',
                'materials.view',
                'reports.view',
            ],
            'speaker' => [
                'materials.view',
            ],
            'coach' => [
                'materials.view',
            ],
            'examiner' => [
                'materials.view',
            ],
            'referee' => [
                'materials.view',
            ],
            'participant' => [
                'materials.view',
            ],
        ];

        foreach ($roles as $roleName => $rolePermissions) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                ['guard_name' => 'web']
            );

            $permIds = collect($rolePermissions)
                ->map(fn ($perm) => $permissionModels[$perm]->id ?? null)
                ->filter();

            $role->permissions()->sync($permIds);
        }
    }
}
