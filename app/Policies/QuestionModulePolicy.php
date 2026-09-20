<?php

namespace App\Policies;

use App\Models\QuestionModule;
use App\Models\User;

class QuestionModulePolicy
{
    /**
     * Determine whether the user can view any question modules.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the question module.
     */
    public function view(User $user, QuestionModule $questionModule): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create question modules.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the question module.
     */
    public function update(User $user, QuestionModule $questionModule): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the question module.
     * Denied if has active questions or is utilized by any CBT package.
     */
    public function delete(User $user, QuestionModule $questionModule): bool
    {
        if (! $user->isAdmin()) {
            return false;
        }

        $hasActiveQuestions = $questionModule->questions()->where('status', 'active')->exists();
        $hasCbtPackages = $questionModule->cbtPackages()->exists();

        return ! $hasActiveQuestions && ! $hasCbtPackages;
    }

    /**
     * Determine whether the user can archive the question module.
     */
    public function archive(User $user, QuestionModule $questionModule): bool
    {
        return $user->isAdmin();
    }
}
