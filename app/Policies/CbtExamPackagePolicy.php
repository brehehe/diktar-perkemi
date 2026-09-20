<?php

namespace App\Policies;

use App\Models\CbtExamPackage;
use App\Models\User;

class CbtExamPackagePolicy
{
    /**
     * Determine whether the user can view any CBT exam packages.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the CBT exam package.
     */
    public function view(User $user, CbtExamPackage $package): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create CBT exam packages.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the CBT exam package.
     * Deny changing composition if exam already has participant attempts.
     */
    public function update(User $user, CbtExamPackage $package): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the CBT exam package.
     */
    public function delete(User $user, CbtExamPackage $package): bool
    {
        if (! $user->isAdmin()) {
            return false;
        }

        // Cannot delete if there are already attempts or active sessions
        return $package->attempts()->count() === 0 && $package->sessions()->count() === 0;
    }

    /**
     * Determine whether the user can publish / set status ready.
     */
    public function publish(User $user, CbtExamPackage $package): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can grade essay answers.
     */
    public function gradeEssay(User $user): bool
    {
        return $user->isAdmin();
    }
}
