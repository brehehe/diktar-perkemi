<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveEventActivityRequest;
use App\Http\Requests\Admin\SaveEventFinanceRequest;
use App\Models\Event;
use App\Models\EventActivityRecord;
use App\Models\EventFinance;
use App\Models\EventStaff;
use App\Models\FinanceCategory;
use App\Models\User;
use App\Services\EventFinanceAnalysisService;
use App\Services\EventFinanceNarrativeService;
use App\Services\EventReportExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EventReportController extends Controller
{
    public function index(Request $request, Event $event, EventFinanceAnalysisService $analysis, EventFinanceNarrativeService $narrative): Response
    {
        Gate::authorize('viewReport', $event);
        $canManageStaff = $request->user()->can('manageStaff', $event);
        $canViewFinance = $request->user()->can('viewFinance', $event);
        $canManageFinance = $request->user()->can('manageFinance', $event);
        $canManageRealisation = $request->user()->can('manageActivity', [$event, 'realisation']);
        $canManageDocumentation = $request->user()->can('manageActivity', [$event, 'documentation']);

        return Inertia::render('Admin/Events/Reports', [
            'event' => $event->only(['id', 'name', 'slug', 'date_formatted', 'place', 'organizer', 'status_label']),
            'finances' => $canViewFinance ? $event->finances()->with(['creator:id,name', 'categoryMaster:id,code,name'])->latest('occurred_on')->latest('id')->get()->map(fn (EventFinance $entry) => [
                'id' => $entry->id,
                'type' => $entry->type,
                'category' => $entry->category,
                'category_name' => $entry->categoryMaster?->name ?? $entry->category,
                'description' => $entry->description,
                'sponsor_name' => $entry->sponsor_name,
                'amount' => $entry->amount,
                'occurred_on' => $entry->occurred_on->format('Y-m-d'),
                'evidence_url' => $entry->evidence_path ? route('admin.event.reports.finance.evidence', [$event, $entry]) : null,
                'creator_name' => $entry->creator?->name,
            ]) : [],
            'financeAnalysis' => $canViewFinance ? $narrative->annotate($analysis->forEvent($event)) : null,
            'financeCategories' => $this->financeCategories(),
            'activities' => $event->activityRecords()->with(['creator:id,name', 'session:id,topic'])->latest('occurred_on')->latest('id')->get()->map(fn (EventActivityRecord $record) => [
                'id' => $record->id,
                'kind' => $record->kind,
                'title' => $record->title,
                'activity_type' => $record->activity_type,
                'occurred_on' => $record->occurred_on->format('Y-m-d'),
                'notes' => $record->notes,
                'session_id' => $record->event_session_id,
                'session_title' => $record->session?->topic,
                'media_url' => $record->file_path ? route('admin.event.reports.activity.media', [$event, $record]) : null,
                'media_type' => $record->file_mime,
                'creator_name' => $record->creator?->name,
            ]),
            'staff' => $event->staff()->with('user:id,name,email,role')->orderBy('duty')->get()->map(fn (EventStaff $staff) => [
                'id' => $staff->id,
                'duty' => $staff->duty,
                'user' => $staff->user,
            ]),
            'staffCandidates' => $canManageStaff ? User::query()->whereIn('role', ['Bendahara', 'Sie Acara', 'Dokumentasi', 'Penyelenggara', 'Admin'])->orderBy('name')->get(['id', 'name', 'email', 'role']) : [],
            'sessions' => $event->sessions()->get(['id', 'topic', 'date', 'session_type_code'])->map(fn ($session) => [
                'id' => $session->id,
                'label' => $session->topic.' · '.($session->date?->format('d M Y') ?? 'Tanggal belum diatur'),
            ]),
            'outcomesSummary' => [
                'total_participants' => $event->eventParticipants()->count(),
                'passed_count' => $event->eventParticipants()->where('graduation_status', 'Lulus')->count(),
                'total_sessions' => $event->sessions()->count(),
                'total_attendances' => $event->attendances()->whereIn('status', ['present', 'late', 'manual_override'])->count(),
                'late_count' => $event->attendances()->where('status', 'late')->count(),
            ],
            'permissions' => [
                'manage_staff' => $canManageStaff,
                'view_finance' => $canViewFinance,
                'manage_finance' => $canManageFinance,
                'manage_realisation' => $canManageRealisation,
                'manage_documentation' => $canManageDocumentation,
            ],
        ]);
    }

    public function documentationRedirect(Request $request): RedirectResponse
    {
        return $this->redirectToEventTab($request, 'dokumentasi');
    }

    public function realisationRedirect(Request $request): RedirectResponse
    {
        return $this->redirectToEventTab($request, 'realisasi');
    }

    public function staffRedirect(Request $request): RedirectResponse
    {
        return $this->redirectToEventTab($request, 'petugas');
    }

    protected function redirectToEventTab(Request $request, string $tab): RedirectResponse
    {
        $eventId = $request->integer('event') ?: $request->integer('event_id');
        $event = $eventId ? Event::find($eventId) : null;

        if (! $event) {
            $today = now()->toDateString();
            $event = Event::where('status', 'ongoing')->first()
                ?? Event::where('status', 'registration_open')->first()
                ?? Event::whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today)->first()
                ?? Event::latest('start_date')->first()
                ?? Event::first();
        }

        if (! $event) {
            return redirect()->route('admin.event.index')->with('info', 'Belum ada event penataran.');
        }

        $tabMap = [
            'dokumentasi' => 'dokumentasi',
            'realisasi' => 'realisasi',
            'petugas' => 'petugas',
            'keuangan' => 'keuangan',
            'rekap' => 'rekap-laporan',
        ];

        $targetTab = $tabMap[$tab] ?? 'ringkasan';

        return redirect()->route('admin.event.show', ['event' => $event->id, 'tab' => $targetTab]);
    }

    public function masterFinance(Request $request, EventFinanceAnalysisService $analysis, EventFinanceNarrativeService $narrative): Response
    {
        $user = $request->user();
        $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::where('user_id', $user->id)->where('duty', 'bendahara')->exists();
        abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);

        $eventId = $request->integer('event') ?: null;
        $type = $request->string('type')->toString() ?: null;
        $category = $request->string('category')->toString() ?: null;
        $startDate = $request->string('start_date')->toString() ?: null;
        $endDate = $request->string('end_date')->toString() ?: null;
        $search = $request->string('search')->toString() ?: null;

        $allowedEventIds = $isAssignedTreasurer ? EventStaff::query()->where('user_id', $user->id)->where('duty', 'bendahara')->pluck('event_id')->all() : null;
        abort_if($eventId && $allowedEventIds !== null && ! in_array($eventId, $allowedEventIds, true), 404);

        $transactionsQuery = EventFinance::query()
            ->with(['event:id,title,slug', 'creator:id,name', 'categoryMaster:id,code,name'])
            ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($category, fn ($query) => $query->where('category', $category))
            ->when($startDate, fn ($query) => $query->whereDate('occurred_on', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('occurred_on', '<=', $endDate))
            ->when($search, fn ($query) => $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('sponsor_name', 'like', "%{$search}%");
            }))
            ->latest('occurred_on')
            ->latest('id');

        $filteredTotals = [
            'income' => (int) (clone $transactionsQuery)->where('type', 'income')->sum('amount'),
            'expense' => (int) (clone $transactionsQuery)->where('type', 'expense')->sum('amount'),
            'sponsor' => (int) (clone $transactionsQuery)->where('type', 'income')->where('category', 'sponsorship')->sum('amount'),
            'count' => (int) (clone $transactionsQuery)->count(),
        ];
        $filteredTotals['balance'] = $filteredTotals['income'] - $filteredTotals['expense'];

        $transactions = $transactionsQuery
            ->paginate(50)
            ->withQueryString()
            ->through(fn (EventFinance $entry) => [
                'id' => $entry->id,
                'event_id' => $entry->event_id,
                'event_name' => $entry->event?->name,
                'type' => $entry->type,
                'category' => $entry->category,
                'category_name' => $entry->categoryMaster?->name ?? $entry->category,
                'description' => $entry->description,
                'sponsor_name' => $entry->sponsor_name,
                'amount' => $entry->amount,
                'occurred_on' => $entry->occurred_on->format('Y-m-d'),
                'creator_name' => $entry->creator?->name,
                'has_evidence' => (bool) $entry->evidence_path,
                'evidence_url' => $entry->evidence_path ? route('admin.event.reports.finance.evidence', ['event' => $entry->event_id, 'finance' => $entry->id]) : null,
            ]);

        $scopedTransactions = EventFinance::query()
            ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
            ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
            ->when($startDate, fn ($q) => $q->whereDate('occurred_on', '>=', $startDate))
            ->when($endDate, fn ($q) => $q->whereDate('occurred_on', '<=', $endDate))
            ->get(['type', 'category', 'amount', 'occurred_on']);

        $allTransactions = ($eventId || $startDate || $endDate) ? EventFinance::query()
            ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
            ->get(['type', 'category', 'amount', 'occurred_on']) : null;

        $eventSummaries = Event::query()
            ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('id', $allowedEventIds))
            ->with(['finances:id,event_id,type,amount,category'])
            ->whereHas('finances')
            ->latest('start_date')
            ->get(['id', 'title', 'start_date', 'location'])
            ->map(fn (Event $ev) => [
                'id' => $ev->id,
                'name' => $ev->name,
                'date' => $ev->date_formatted,
                'location' => $ev->place,
                'income' => (int) $ev->finances->where('type', 'income')->sum('amount'),
                'expense' => (int) $ev->finances->where('type', 'expense')->sum('amount'),
                'balance' => (int) ($ev->finances->where('type', 'income')->sum('amount') - $ev->finances->where('type', 'expense')->sum('amount')),
                'sponsor_amount' => (int) $ev->finances->where('type', 'income')->where('category', 'sponsorship')->sum('amount'),
                'transaction_count' => $ev->finances->count(),
            ]);

        $categoryBreakdown = [
            'income' => EventFinance::query()
                ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
                ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
                ->when($startDate, fn ($q) => $q->whereDate('occurred_on', '>=', $startDate))
                ->when($endDate, fn ($q) => $q->whereDate('occurred_on', '<=', $endDate))
                ->where('type', 'income')
                ->selectRaw('category, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('category')
                ->get()
                ->map(fn ($item) => [
                    'category' => $item->category,
                    'count' => (int) $item->count,
                    'total' => (int) $item->total,
                ]),
            'expense' => EventFinance::query()
                ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
                ->when($eventId, fn ($q) => $q->where('event_id', $eventId))
                ->when($startDate, fn ($q) => $q->whereDate('occurred_on', '>=', $startDate))
                ->when($endDate, fn ($q) => $q->whereDate('occurred_on', '<=', $endDate))
                ->where('type', 'expense')
                ->selectRaw('category, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('category')
                ->get()
                ->map(fn ($item) => [
                    'category' => $item->category,
                    'count' => (int) $item->count,
                    'total' => (int) $item->total,
                ]),
        ];

        $canCreateTransaction = $user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer;

        return Inertia::render('Admin/Finance/Index', [
            'transactions' => $transactions,
            'analysis' => $narrative->annotate($analysis->summarize($scopedTransactions)),
            'overallAnalysis' => $allTransactions ? $analysis->summarize($allTransactions) : null,
            'eventSummaries' => $eventSummaries,
            'categoryBreakdown' => $categoryBreakdown,
            'filteredTotals' => $filteredTotals,
            'events' => Event::query()->when($allowedEventIds !== null, fn ($query) => $query->whereIn('id', $allowedEventIds))->latest('start_date')->get(['id', 'title'])->map(fn (Event $event) => ['id' => $event->id, 'name' => $event->name]),
            'filters' => [
                'event' => $eventId,
                'type' => $type,
                'category' => $category,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
            ],
            'canCreateTransaction' => $canCreateTransaction,
            'financeCategories' => $this->financeCategories(),
        ]);
    }

    public function generateFinanceNarrative(Request $request, EventFinanceAnalysisService $analysis, EventFinanceNarrativeService $narrative): RedirectResponse
    {
        $validated = $request->validate(['event' => ['nullable', 'integer', 'exists:events,id']]);
        $eventId = $validated['event'] ?? null;
        $user = $request->user();

        if ($eventId) {
            $event = Event::findOrFail($eventId);
            abort_unless($user->can('viewFinance', $event), 404);
            $summary = $analysis->forEvent($event);
        } else {
            $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::query()->where('user_id', $user->id)->where('duty', 'bendahara')->exists();
            abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);

            $allowedEventIds = $isAssignedTreasurer ? EventStaff::query()->where('user_id', $user->id)->where('duty', 'bendahara')->pluck('event_id')->all() : null;
            $transactions = EventFinance::query()
                ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
                ->get(['type', 'category', 'amount', 'occurred_on']);
            $summary = $analysis->summarize($transactions);
        }

        if ($summary['transaction_count'] === 0) {
            return back()->with('info', 'Catat transaksi terlebih dahulu agar analisis AI dapat dibuat.');
        }

        if (! $narrative->configured()) {
            return back()->with('error', 'SUMOPOD_API_KEY belum dikonfigurasi pada server.');
        }

        try {
            $narrative->generate($summary);
        } catch (\Throwable $exception) {
            report($exception);

            return back()->with('error', 'Analisis Sumopod belum dapat dibuat. Silakan coba lagi nanti.');
        }

        return back()->with('success', 'Analisis Sumopod berhasil dibuat.');
    }

    public function printMasterFinance(Request $request): Response
    {
        $user = $request->user();
        $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::where('user_id', $user->id)->where('duty', 'bendahara')->exists();
        abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);

        $eventId = $request->integer('event') ?: null;
        $type = $request->string('type')->toString() ?: null;
        $category = $request->string('category')->toString() ?: null;
        $startDate = $request->string('start_date')->toString() ?: null;
        $endDate = $request->string('end_date')->toString() ?: null;
        $search = $request->string('search')->toString() ?: null;

        $allowedEventIds = $isAssignedTreasurer ? EventStaff::query()->where('user_id', $user->id)->where('duty', 'bendahara')->pluck('event_id')->all() : null;
        abort_if($eventId && $allowedEventIds !== null && ! in_array($eventId, $allowedEventIds, true), 404);

        $selectedEvent = $eventId ? Event::find($eventId) : null;

        $transactions = EventFinance::query()
            ->with(['event:id,title,slug', 'creator:id,name', 'categoryMaster:id,code,name'])
            ->when($allowedEventIds !== null, fn ($query) => $query->whereIn('event_id', $allowedEventIds))
            ->when($eventId, fn ($query) => $query->where('event_id', $eventId))
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($category, fn ($query) => $query->where('category', $category))
            ->when($startDate, fn ($query) => $query->whereDate('occurred_on', '>=', $startDate))
            ->when($endDate, fn ($query) => $query->whereDate('occurred_on', '<=', $endDate))
            ->when($search, fn ($query) => $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('sponsor_name', 'like', "%{$search}%");
            }))
            ->orderBy('occurred_on')
            ->orderBy('id')
            ->get()
            ->map(fn (EventFinance $entry) => [
                'id' => $entry->id,
                'event_name' => $entry->event?->name,
                'type' => $entry->type,
                'category' => $entry->category,
                'category_name' => $entry->categoryMaster?->name ?? $entry->category,
                'description' => $entry->description,
                'sponsor_name' => $entry->sponsor_name,
                'amount' => $entry->amount,
                'occurred_on' => $entry->occurred_on->format('d/m/Y'),
                'creator_name' => $entry->creator?->name,
                'has_evidence' => (bool) $entry->evidence_path,
            ]);

        $totalIncome = (int) $transactions->where('type', 'income')->sum('amount');
        $totalExpense = (int) $transactions->where('type', 'expense')->sum('amount');
        $totalSponsor = (int) $transactions->where('type', 'income')->where('category', 'sponsorship')->sum('amount');
        $netBalance = $totalIncome - $totalExpense;

        return Inertia::render('Admin/Finance/Print', [
            'selectedEvent' => $selectedEvent ? [
                'id' => $selectedEvent->id,
                'name' => $selectedEvent->name,
                'date' => $selectedEvent->date_formatted,
                'place' => $selectedEvent->place,
                'organizer' => $selectedEvent->organizer,
            ] : null,
            'transactions' => $transactions,
            'summary' => [
                'income' => $totalIncome,
                'expense' => $totalExpense,
                'balance' => $netBalance,
                'sponsor' => $totalSponsor,
                'count' => $transactions->count(),
            ],
            'filters' => [
                'event' => $eventId,
                'type' => $type,
                'category' => $category,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'search' => $search,
            ],
            'categoryLabels' => FinanceCategory::query()->pluck('name', 'code'),
            'printedBy' => $user->name,
            'printDate' => now()->translatedFormat('d F Y, H:i'),
        ]);
    }

    public function destroyMasterFinance(Request $request, EventFinance $finance): RedirectResponse
    {
        $user = $request->user();
        /** @var Event $event */
        $event = $finance->event;
        abort_unless($event && $user->can('manageFinance', $event), 403);

        if ($finance->evidence_path) {
            Storage::disk('local')->delete($finance->evidence_path);
        }
        $finance->delete();

        return back()->with('success', 'Transaksi keuangan berhasil dihapus.');
    }

    public function storeMasterFinance(Request $request): RedirectResponse
    {
        $user = $request->user();
        $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::where('user_id', $user->id)->where('duty', 'bendahara')->exists();
        abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);

        $validated = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'type' => ['required', 'in:income,expense'],
            'category' => [
                'required',
                Rule::exists('finance_categories', 'code')->where(
                    fn ($query) => $query->whereIn('transaction_type', [$request->input('type'), 'both'])
                ),
            ],
            'description' => ['required', 'string', 'max:255'],
            'sponsor_name' => ['nullable', 'string', 'max:255', 'required_if:category,sponsorship'],
            'amount' => ['required', 'integer', 'min:1', 'max:999999999999'],
            'occurred_on' => ['required', 'date'],
            'evidence' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ]);

        /** @var Event $event */
        $event = Event::findOrFail($validated['event_id']);
        abort_unless($user->can('manageFinance', $event), 403);

        $data = collect($validated)->except(['event_id', 'evidence'])->toArray();
        $data['created_by'] = $user->id;
        $data['event_id'] = $event->id;

        if ($request->hasFile('evidence')) {
            $data['evidence_path'] = $request->file('evidence')->store("event-finances/{$event->id}", 'local');
        }

        EventFinance::create($data);

        return back()->with('success', 'Transaksi keuangan berhasil dicatat.');
    }

    public function exportMasterFinance(Request $request, EventReportExportService $exporter): BinaryFileResponse
    {
        $user = $request->user();
        $isAssignedTreasurer = $user->role === 'Bendahara' && EventStaff::where('user_id', $user->id)->where('duty', 'bendahara')->exists();
        abort_unless($user->isAdmin() || $user->role === 'Diktar' || $isAssignedTreasurer, 403);

        $eventId = $request->integer('event') ?: null;
        $allowedEventIds = $isAssignedTreasurer ? EventStaff::query()->where('user_id', $user->id)->where('duty', 'bendahara')->pluck('event_id')->all() : null;
        abort_if($eventId && $allowedEventIds !== null && ! in_array($eventId, $allowedEventIds, true), 404);

        $filters = [
            'type' => $request->string('type')->toString() ?: null,
            'category' => $request->string('category')->toString() ?: null,
            'start_date' => $request->string('start_date')->toString() ?: null,
            'end_date' => $request->string('end_date')->toString() ?: null,
            'search' => $request->string('search')->toString() ?: null,
        ];

        return $exporter->masterFinances($eventId, $allowedEventIds, $filters);
    }

    public function storeFinance(SaveEventFinanceRequest $request, Event $event): RedirectResponse
    {
        $data = $request->safe()->except('evidence');
        $data['created_by'] = $request->user()->id;
        if ($request->hasFile('evidence')) {
            $data['evidence_path'] = $request->file('evidence')->store("event-finances/{$event->id}", 'local');
        }
        $event->finances()->create($data);

        return back()->with('success', 'Transaksi keuangan berhasil dicatat.');
    }

    public function updateFinance(SaveEventFinanceRequest $request, Event $event, EventFinance $finance): RedirectResponse
    {
        $this->ensureFinanceBelongsToEvent($event, $finance);
        $data = $request->safe()->except('evidence');
        if ($request->hasFile('evidence')) {
            $oldPath = $finance->evidence_path;
            $data['evidence_path'] = $request->file('evidence')->store("event-finances/{$event->id}", 'local');
            if ($oldPath) {
                Storage::disk('local')->delete($oldPath);
            }
        }
        $finance->update($data);

        return back()->with('success', 'Transaksi keuangan berhasil diperbarui.');
    }

    public function destroyFinance(Request $request, Event $event, EventFinance $finance): RedirectResponse
    {
        Gate::authorize('manageFinance', $event);
        $this->ensureFinanceBelongsToEvent($event, $finance);
        if ($finance->evidence_path) {
            Storage::disk('local')->delete($finance->evidence_path);
        }
        $finance->delete();

        return back()->with('success', 'Transaksi keuangan berhasil dihapus.');
    }

    public function financeEvidence(Request $request, Event $event, EventFinance $finance): StreamedResponse
    {
        Gate::authorize('viewFinance', $event);
        $this->ensureFinanceBelongsToEvent($event, $finance);
        abort_unless($finance->evidence_path && Storage::disk('local')->exists($finance->evidence_path), 404);

        return Storage::disk('local')->download($finance->evidence_path, basename($finance->evidence_path));
    }

    public function storeActivity(SaveEventActivityRequest $request, Event $event): RedirectResponse
    {
        $data = $request->safe()->except('media');
        $data['created_by'] = $request->user()->id;
        if ($request->hasFile('media')) {
            $data['file_path'] = $request->file('media')->store("event-documentation/{$event->id}", 'local');
            $data['file_mime'] = $request->file('media')->getMimeType();
        }
        $event->activityRecords()->create($data);

        return back()->with('success', $data['kind'] === 'documentation' ? 'Dokumentasi kegiatan berhasil disimpan.' : 'Realisasi acara berhasil disimpan.');
    }

    public function updateActivity(SaveEventActivityRequest $request, Event $event, EventActivityRecord $eventActivity): RedirectResponse
    {
        $this->ensureActivityBelongsToEvent($event, $eventActivity);
        $data = $request->safe()->except('media');
        if ($request->hasFile('media')) {
            $oldPath = $eventActivity->file_path;
            $data['file_path'] = $request->file('media')->store("event-documentation/{$event->id}", 'local');
            $data['file_mime'] = $request->file('media')->getMimeType();
            if ($oldPath) {
                Storage::disk('local')->delete($oldPath);
            }
        }
        $eventActivity->update($data);

        return back()->with('success', 'Catatan kegiatan berhasil diperbarui.');
    }

    public function destroyActivity(Request $request, Event $event, EventActivityRecord $eventActivity): RedirectResponse
    {
        $this->ensureActivityBelongsToEvent($event, $eventActivity);
        Gate::authorize('manageActivity', [$event, $eventActivity->kind]);
        if ($eventActivity->file_path) {
            Storage::disk('local')->delete($eventActivity->file_path);
        }
        $eventActivity->delete();

        return back()->with('success', 'Catatan kegiatan berhasil dihapus.');
    }

    public function activityMedia(Request $request, Event $event, EventActivityRecord $eventActivity): StreamedResponse
    {
        Gate::authorize('viewReport', $event);
        $this->ensureActivityBelongsToEvent($event, $eventActivity);
        abort_unless($eventActivity->file_path && Storage::disk('local')->exists($eventActivity->file_path), 404);

        return Storage::disk('local')->response($eventActivity->file_path, basename($eventActivity->file_path), ['Content-Type' => $eventActivity->file_mime]);
    }

    public function storeStaff(Request $request, Event $event): RedirectResponse
    {
        Gate::authorize('manageStaff', $event);
        $validated = $request->validate([
            'user_id' => ['required', 'integer', Rule::exists('users', 'id')->whereIn('role', ['Bendahara', 'Sie Acara', 'Dokumentasi', 'Penyelenggara', 'Admin'])],
            'duty' => ['required', Rule::in(['bendahara', 'acara', 'dokumentasi'])],
        ]);
        EventStaff::updateOrCreate(['event_id' => $event->id, 'user_id' => $validated['user_id'], 'duty' => $validated['duty']]);

        return back()->with('success', 'Petugas event berhasil ditugaskan.');
    }

    public function destroyStaff(Request $request, Event $event, EventStaff $staff): RedirectResponse
    {
        Gate::authorize('manageStaff', $event);
        abort_unless($staff->event_id === $event->id, 404);
        $staff->delete();

        return back()->with('success', 'Penugasan petugas berhasil dihapus.');
    }

    public function exportAttendance(Event $event, EventReportExportService $exporter): BinaryFileResponse
    {
        Gate::authorize('viewReport', $event);

        return $exporter->attendance($event);
    }

    public function preview(Event $event, string $report, EventReportExportService $exporter): JsonResponse
    {
        Gate::authorize('viewReport', $event);

        if ($report === 'finance') {
            Gate::authorize('viewFinance', $event);
        }

        return response()->json($exporter->preview($event, $report));
    }

    public function exportOutcomes(Event $event, EventReportExportService $exporter): BinaryFileResponse
    {
        Gate::authorize('viewReport', $event);

        return $exporter->outcomes($event);
    }

    public function exportCompleteness(Event $event, EventReportExportService $exporter): BinaryFileResponse
    {
        Gate::authorize('viewReport', $event);

        return $exporter->completenessAndAttempts($event);
    }

    public function exportFinance(Event $event, EventReportExportService $exporter): BinaryFileResponse
    {
        Gate::authorize('viewFinance', $event);

        return $exporter->finances($event);
    }

    private function ensureFinanceBelongsToEvent(Event $event, EventFinance $finance): void
    {
        abort_unless($finance->event_id === $event->id, 404);
    }

    private function ensureActivityBelongsToEvent(Event $event, EventActivityRecord $record): void
    {
        abort_unless($record->event_id === $event->id, 404);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function financeCategories(): Collection
    {
        return FinanceCategory::query()
            ->withCount('finances')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'code', 'name', 'transaction_type', 'sort_order'])
            ->map(fn (FinanceCategory $category) => [
                'id' => $category->id,
                'code' => $category->code,
                'name' => $category->name,
                'transaction_type' => $category->transaction_type,
                'transactions_count' => $category->finances_count,
            ]);
    }
}
