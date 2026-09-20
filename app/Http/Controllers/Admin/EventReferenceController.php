<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\EventLegend;
use App\Models\EventModule;
use App\Models\LearningModule;
use App\Models\Participant;
use App\Models\ParticipantTrack;
use App\Models\QuestionBank;
use App\Models\QuestionModule;
use App\Models\Speaker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class EventReferenceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('view-event-references');

        $tabs = [
            'modul' => 'Modul Pembelajaran',
            'modul-event' => 'Materi Event',
            'modul-soal' => 'Modul Soal',
            'bank-soal' => 'Bank Soal',
            'soal-event' => 'Soal Event',
            'ujian-event' => 'Ujian Event',
            'pemateri' => 'Pemateri',
            'peserta' => 'Peserta',
            'jalur' => 'Jalur Peserta',
            'legenda' => 'Legenda & Singkatan',
        ];
        $tab = (string) $request->query('tab', 'modul');
        abort_unless(array_key_exists($tab, $tabs), 404);

        $items = match ($tab) {
            'modul' => LearningModule::query()->withCount('events')->latest('id')->paginate(20)->through(fn (LearningModule $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->title,
                'detail' => $item->category, 'status' => $item->status,
                'source' => $item->events_count.' event',
            ]),
            'modul-event' => EventModule::query()->with('event:id,title')->latest('id')->paginate(20)->through(fn (EventModule $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->title,
                'detail' => $item->source_type, 'status' => $item->publication_status,
                'source' => $item->event?->title,
            ]),
            'modul-soal' => QuestionModule::query()->withCount('questions')->latest('id')->paginate(20)->through(fn (QuestionModule $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->title,
                'detail' => $item->category, 'status' => $item->status,
                'source' => $item->questions_count.' soal',
            ]),
            'bank-soal' => QuestionBank::query()->latest('id')->paginate(20)->through(fn (QuestionBank $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->question_text,
                'detail' => $item->question_type, 'status' => $item->status,
                'source' => null,
            ]),
            'soal-event' => CbtQuestion::query()->whereHas('package', fn ($query) => $query->whereNotNull('event_id'))
                ->with('package.event:id,title')->latest('id')->paginate(20)->through(fn (CbtQuestion $item) => [
                    'id' => $item->id, 'code' => null, 'name' => $item->question_text,
                    'detail' => $item->question_type_label, 'status' => $item->is_active ? 'Aktif' : 'Nonaktif',
                    'source' => $item->package?->event?->title,
                ]),
            'ujian-event' => CbtExamPackage::query()->whereNotNull('event_id')->with('event:id,title')->latest('id')->paginate(20)->through(fn (CbtExamPackage $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->title,
                'detail' => $item->exam_type_label, 'status' => $item->status,
                'source' => $item->event?->title,
            ]),
            'pemateri' => Speaker::query()->with('event:id,title')->orderBy('name')->paginate(20)->through(fn (Speaker $item) => [
                'id' => $item->id, 'code' => null, 'name' => $item->full_name_with_title,
                'detail' => $item->type_label, 'status' => $item->is_active ? 'Aktif' : 'Nonaktif',
                'source' => $item->event?->title ?? 'Master',
            ]),
            'peserta' => Participant::query()->withCount('eventParticipants')->orderBy('name')->paginate(20)->through(fn (Participant $item) => [
                'id' => $item->id, 'code' => $item->kenshi_id_number, 'name' => $item->name,
                'detail' => $item->origin, 'status' => null,
                'source' => $item->event_participants_count.' event',
            ]),
            'jalur' => ParticipantTrack::query()->with('event:id,title')->orderBy('name')->paginate(20)->through(fn (ParticipantTrack $item) => [
                'id' => $item->id, 'code' => $item->code, 'name' => $item->name,
                'detail' => $item->description, 'status' => $item->is_active ? 'Aktif' : 'Nonaktif',
                'source' => $item->event?->title ?? 'Master',
            ]),
            'legenda' => EventLegend::query()->with('event:id,title')->orderBy('acronym')->paginate(20)->through(fn (EventLegend $item) => [
                'id' => $item->id, 'code' => $item->acronym, 'name' => $item->full_name,
                'detail' => $item->category, 'status' => null,
                'source' => $item->event?->title ?? 'Master',
            ]),
        };

        return Inertia::render('Admin/EventReferences', [
            'tabs' => $tabs,
            'activeTab' => $tab,
            'items' => $items->withQueryString(),
        ]);
    }
}
