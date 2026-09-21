<?php

namespace App\Policies;

use App\Models\EventParticipant;
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
     * Determine whether the user can publish the model.
     */
    public function publish(User $user, Material $material): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can archive the model.
     */
    public function archive(User $user, Material $material): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can read the digital book via the secure reader.
     */
    public function read(User $user, Material $material): bool
    {
        // Admin, Diktar, Pemateri, and Penyelenggara can always read / preview any material
        if ($user->isAdmin() || in_array($user->role, ['Diktar', 'Pemateri', 'Penyelenggara'], true)) {
            return true;
        }

        // Readers can only access published materials
        if ($material->status !== 'published') {
            return false;
        }

        // Allow enrolled participants of any event that incorporates this material
        $isEnrolledInEventWithMaterial = EventParticipant::query()
            ->whereHas('participant', fn ($q) => $q->where('user_id', $user->id))
            ->where('admin_status', 'verified')
            ->whereHas('event', function ($q) use ($material) {
                $q->whereHas('modules', fn ($m) => $m->where('material_id', $material->id))
                    ->orWhereHas('sessions', fn ($s) => $s->where('material_id', $material->id))
                    ->orWhereHas('learningModules.materials', fn ($lm) => $lm->where('materials.id', $material->id));
            })
            ->exists();

        if ($isEnrolledInEventWithMaterial) {
            return true;
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
        // Non-PDF materials cannot be downloaded
        if ($material->source_type && $material->source_type !== 'uploaded_pdf') {
            return false;
        }

        if (! $this->read($user, $material)) {
            return false;
        }

        if ($user->isAdmin() || in_array($user->role, ['Diktar', 'Pemateri'], true)) {
            return true;
        }

        return (bool) ($material->allow_download || $material->is_downloadable);
    }
}
