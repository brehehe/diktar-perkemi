<?php

namespace App\Policies;

use App\Models\Event;
use App\Models\User;

class EventPolicy
{
    public function viewReport(User $user, Event $event): bool
    {
        return $this->view($user, $event) || $event->staff()->where('user_id', $user->id)->exists();
    }

    public function manageStaff(User $user, Event $event): bool
    {
        return $this->update($user, $event);
    }

    public function viewFinance(User $user, Event $event): bool
    {
        return $this->manageStaff($user, $event)
            || $event->staff()->where('user_id', $user->id)->where('duty', 'bendahara')->exists();
    }

    public function manageFinance(User $user, Event $event): bool
    {
        return $this->viewFinance($user, $event);
    }

    public function manageActivity(User $user, Event $event, string $kind): bool
    {
        if ($this->manageStaff($user, $event)) {
            return true;
        }

        if (! in_array($kind, ['realisation', 'documentation'], true)) {
            return false;
        }

        $duty = $kind === 'realisation' ? 'acara' : 'dokumentasi';

        return $event->staff()->where('user_id', $user->id)->where('duty', $duty)->exists();
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara', 'Koordinator Acara', 'Koordinator Jadwal', 'Pemateri', 'Bendahara', 'Sie Acara', 'Dokumentasi'], true);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Event $event): bool
    {
        return $user->isAdmin() || in_array($user->role, ['Diktar', 'Koordinator Acara', 'Koordinator Jadwal'], true)
            || ($user->role === 'Penyelenggara' && $event->responsible_user_id === $user->id)
            || ($user->role === 'Pemateri');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || in_array($user->role, ['Diktar', 'Penyelenggara'], true);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Event $event): bool
    {
        return $user->isAdmin() || in_array($user->role, ['Diktar', 'Koordinator Acara', 'Koordinator Jadwal'], true)
            || ($user->role === 'Penyelenggara' && $event->responsible_user_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Event $event): bool
    {
        return $user->isAdmin() || $user->role === 'Diktar';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Event $event): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Event $event): bool
    {
        return false;
    }
}
