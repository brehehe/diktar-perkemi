<?php

namespace App\Policies;

use App\Models\LearningModule;
use App\Models\User;

class LearningModulePolicy
{
    /**
     * Determine whether the user can view any learning modules.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the learning module.
     */
    public function view(User $user, LearningModule $module): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create learning modules.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the learning module.
     */
    public function update(User $user, LearningModule $module): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the learning module.
     * Only allow delete if it hasn't been attached to any events or rundown sessions.
     */
    public function delete(User $user, LearningModule $module): bool
    {
        if (! $user->isAdmin()) {
            return false;
        }

        return $module->events()->count() === 0 && $module->sessions()->count() === 0;
    }

    /**
     * Determine whether the user can archive the learning module.
     */
    public function archive(User $user, LearningModule $module): bool
    {
        return $user->isAdmin();
    }
}
