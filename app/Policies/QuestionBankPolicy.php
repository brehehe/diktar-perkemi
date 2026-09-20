<?php

namespace App\Policies;

use App\Models\QuestionBank;
use App\Models\User;

class QuestionBankPolicy
{
    /**
     * Determine whether the user can view any questions in question bank.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view a question.
     */
    public function view(User $user, QuestionBank $question): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view answer key.
     */
    public function viewAnswerKey(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can create questions.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the question.
     */
    public function update(User $user, QuestionBank $question): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the question.
     * Cannot delete if question is actively used in CBT packages that have attempts.
     */
    public function delete(User $user, QuestionBank $question): bool
    {
        if (! $user->isAdmin()) {
            return false;
        }

        $usedInActivePackages = $question->cbtPackages()
            ->whereHas('attempts')
            ->exists();

        return ! $usedInActivePackages;
    }
}
