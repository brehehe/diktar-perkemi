<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    /**
     * Determine whether the user can view any models in admin panel.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model in admin panel.
     */
    public function view(User $user, Material $material): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Material $material): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Material $material): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can read the digital book via the secure reader.
     */
    public function read(User $user, Material $material): bool
    {
        // Admin can always read / preview any material
        if ($user->isAdmin()) {
            return true;
        }

        // Readers can only access published materials
        if ($material->status !== 'published') {
            return false;
        }

        // Check audience restrictions if defined
        $audiencesCount = $material->audiences()->count();
        if ($audiencesCount === 0) {
            return true;
        }

        return $material->audiences()
            ->where(function ($q) use ($user) {
                $role = strtolower((string) $user->role);
                $q->whereRaw('LOWER(audiences.name) = ?', [$role])
                    ->orWhereRaw('LOWER(audiences.code) = ?', [$role]);
            })
            ->exists();
    }

    /**
     * Determine whether the user can download the raw digital book file.
     */
    public function download(User $user, Material $material): bool
    {
        if (! $this->read($user, $material)) {
            return false;
        }

        if ($user->isAdmin()) {
            return true;
        }

        return (bool) $material->is_downloadable;
    }
}
