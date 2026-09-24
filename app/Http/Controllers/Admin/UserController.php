<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserPasswordRequest;
use App\Http\Requests\Admin\UpdateUserRoleRequest;
use App\Models\ActivityLog;
use App\Models\Speaker;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of portal users.
     */
    public function index(Request $request): Response
    {
        $query = User::query()->with(['speaker', 'speakers'])->latest('created_at');

        if ($request->filled('q')) {
            $search = trim((string) $request->input('q'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->paginate(15)->withQueryString()->through(function (User $u) {
            $isSupervisor = $u->role === 'Pemateri' && (
                (bool) ($u->speaker?->is_supervisor) ||
                $u->speakers->contains('is_supervisor', true)
            );
            $primarySpeaker = $u->speaker ?: $u->speakers->first();

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'is_supervisor' => $isSupervisor,
                'speaker_id' => $primarySpeaker?->id,
                'event_id' => $primarySpeaker?->event_id,
                'created_at' => $u->created_at?->format('d M Y') ?? '-',
                'is_self' => auth()->id() === $u->id,
            ];
        });

        $roles = ['Peserta', 'Pelatih', 'Penguji', 'Wasit', 'Pemateri', 'Penyelenggara', 'Diktar', 'Admin'];

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'filters' => [
                'q' => $request->input('q', ''),
                'role' => $request->input('role', ''),
            ],
        ]);
    }

    /**
     * Store a newly created user from admin.
     */
    public function store(StoreUserRequest $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated, $request): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => $validated['role'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            if ($user->role === 'Pemateri') {
                $isSupervisor = $request->boolean('is_supervisor');
                Speaker::create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'contact_email' => $user->email,
                    'type' => 'internal',
                    'is_active' => true,
                    'is_supervisor' => $isSupervisor,
                ]);
            }

            ActivityLog::record('user.created', $user, [
                'name' => $user->name,
                'role' => $user->role,
            ]);

            return $user;
        });

        return redirect()->route('admin.users.index')->with('success', 'Pengguna "'.$user->name.'" berhasil ditambahkan.');
    }

    /**
     * Update user role.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated, $request): void {
            $oldRole = $user->role;
            $user->role = $validated['role'];
            $user->save();

            $isSupervisor = $request->boolean('is_supervisor');

            if ($user->role === 'Pemateri') {
                if ($user->speakers()->exists()) {
                    $user->speakers()->update(['is_supervisor' => $isSupervisor]);
                } else {
                    Speaker::create([
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'contact_email' => $user->email,
                        'type' => 'internal',
                        'is_active' => true,
                        'is_supervisor' => $isSupervisor,
                    ]);
                }
            }

            ActivityLog::record('user.role_updated', $user, [
                'from' => $oldRole,
                'to' => $user->role,
                'is_supervisor' => $user->role === 'Pemateri' ? $isSupervisor : null,
            ]);
        });

        $supervisorText = ($user->role === 'Pemateri')
            ? ($request->boolean('is_supervisor') ? ' (Supervisor)' : ' (Reguler)')
            : '';

        return back()->with('success', 'Peran pengguna "'.$user->name.'" berhasil diubah menjadi '.$user->role.$supervisorText.'.');
    }

    /**
     * Update user password by admin.
     */
    public function updatePassword(UpdateUserPasswordRequest $request, User $user): RedirectResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated): void {
            $user->password = Hash::make($validated['password']);
            $user->save();

            ActivityLog::record('user.password_updated', $user, [
                'target_user' => $user->name,
                'target_email' => $user->email,
            ]);
        });

        return back()->with('success', 'Password pengguna "'.$user->name.'" berhasil diperbarui.');
    }
}
