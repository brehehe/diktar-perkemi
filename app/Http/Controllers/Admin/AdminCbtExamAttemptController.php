<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CbtExamAttempt;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminCbtExamAttemptController extends Controller
{
    /**
     * Show full breakdown of answers, correct answers, and questions for an exam attempt.
     */
    public function showDetail(Request $request, Event $event, CbtExamAttempt $attempt): JsonResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            return response()->json(['error' => 'Akses ditolak.'], 403);
        }

        $attempt->loadMissing(['participant', 'package', 'session']);
        $package = $attempt->package;

        if (! $package) {
            return response()->json(['error' => 'Paket ujian tidak ditemukan.'], 404);
        }

        // Get questions
        $questions = $package->questions()->where('is_active', true)->orderBy('sort_order')->get();
        if ($questions->isEmpty()) {
            $questions = $package->bankQuestions()->where('status', 'active')->get();
        }

        // Sort by locked question_order if available
        if (! empty($attempt->question_order) && is_array($attempt->question_order)) {
            $orderMap = array_flip($attempt->question_order);
            $questions = $questions->sortBy(fn ($q) => $orderMap[$q->id] ?? 999999)->values();
        }

        $userAnswers = is_array($attempt->answers) ? $attempt->answers : [];
        $optionOrder = is_array($attempt->option_order) ? $attempt->option_order : [];

        $detailedQuestions = [];
        $correctCount = 0;
        $totalEarnedPoints = 0.0;
        $totalPossiblePoints = 0.0;

        foreach ($questions as $idx => $q) {
            $points = (float) ($q->points ?? 1.0);
            $totalPossiblePoints += $points;

            $submittedAnswer = $userAnswers[(string) $q->id] ?? null;
            $correctAnswer = $q->correct_answer;

            // Determine correctness
            $isCorrect = false;
            if (is_array($correctAnswer)) {
                if ($submittedAnswer == $correctAnswer
                    || (is_array($submittedAnswer) && empty(array_diff($correctAnswer, $submittedAnswer)) && empty(array_diff($submittedAnswer, $correctAnswer)))) {
                    $isCorrect = true;
                }
            } elseif ($submittedAnswer !== null && (string) $submittedAnswer === (string) $correctAnswer) {
                $isCorrect = true;
            }

            if ($isCorrect) {
                $correctCount++;
                $totalEarnedPoints += $points;
            }

            // Normalize options
            $options = $this->normalizeQuestionOptions($q->options);
            $qOptOrder = $optionOrder[(string) $q->id] ?? null;
            if (! empty($qOptOrder) && is_array($qOptOrder)) {
                $optKeyMap = array_flip($qOptOrder);
                $options = collect($options)
                    ->sortBy(fn ($opt) => $optKeyMap[$opt['key']] ?? 999999)
                    ->values()
                    ->all();
            }

            $detailedQuestions[] = [
                'number' => $idx + 1,
                'id' => $q->id,
                'question_text' => $q->question_text ?? $q->content ?? '',
                'question_type' => $q->question_type ?? 'multiple_choice',
                'options' => $options,
                'user_answer' => $submittedAnswer,
                'correct_answer' => $correctAnswer,
                'is_correct' => $isCorrect,
                'points' => $points,
                'earned_points' => $isCorrect ? $points : 0.0,
                'explanation' => $q->explanation ?? null,
            ];
        }

        $durationMinutes = ($attempt->started_at && $attempt->submitted_at)
            ? $attempt->started_at->diffInMinutes($attempt->submitted_at)
            : null;

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'attempt_number' => $attempt->attempt_number,
                'total_score' => (float) $attempt->total_score,
                'passing_score' => (float) ($package->passing_score ?? 70),
                'is_passed' => (bool) $attempt->is_passed,
                'status' => $attempt->status,
                'started_at' => $attempt->started_at?->format('d M Y, H:i'),
                'submitted_at' => $attempt->submitted_at?->format('d M Y, H:i'),
                'duration_minutes' => $durationMinutes,
                'feedback' => $attempt->feedback,
            ],
            'package' => [
                'id' => $package->id,
                'title' => $package->title,
                'code' => $package->code,
                'exam_type' => $package->exam_type,
                'exam_type_label' => $package->exam_type_label,
                'duration_minutes' => $package->duration_minutes,
            ],
            'participant' => [
                'id' => $attempt->participant?->id,
                'name' => $attempt->participant?->name ?? 'Peserta dihapus',
                'kenshi_id_number' => $attempt->participant?->kenshi_id_number ?? '-',
                'dan_rank' => $attempt->participant?->dan_rank ?? '-',
                'origin_dojo' => $attempt->participant?->origin_dojo ?? '-',
            ],
            'summary' => [
                'total_questions' => count($detailedQuestions),
                'correct_count' => $correctCount,
                'wrong_count' => count($detailedQuestions) - $correctCount,
                'score' => (float) $attempt->total_score,
                'earned_points' => round($totalEarnedPoints, 2),
                'total_possible_points' => round($totalPossiblePoints, 2),
            ],
            'questions' => $detailedQuestions,
        ]);
    }

    /**
     * Normalize question options into standard shape.
     *
     * @return array<int, array{key: string, id: string, text: string}>
     */
    private function normalizeQuestionOptions(mixed $rawOptions): array
    {
        if (! is_array($rawOptions)) {
            return [];
        }

        $normalized = [];
        $letters = range('A', 'Z');
        $index = 0;

        foreach ($rawOptions as $key => $opt) {
            if (is_array($opt)) {
                $optKey = (string) ($opt['key'] ?? $opt['id'] ?? ($letters[$index] ?? $key));
                $optText = (string) ($opt['text'] ?? $opt['label'] ?? '');
            } else {
                $optKey = is_string($key) && ! is_numeric($key) ? (string) $key : ($letters[$index] ?? (string) $key);
                $optText = (string) $opt;
            }

            $normalized[] = [
                'key' => $optKey,
                'id' => $optKey,
                'text' => $optText,
            ];
            $index++;
        }

        return $normalized;
    }

    /**
     * Restart an individual CBT exam attempt (keeps answers intact, resets timer & opens in_progress).
     */
    public function restartAttempt(Request $request, Event $event, CbtExamAttempt $attempt): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        abort_unless($attempt->event_id === $event->id, 404, 'Ujian tidak sesuai event.');

        $attempt->loadMissing(['participant', 'package']);

        $attempt->update([
            'status' => 'in_progress',
            'started_at' => now(),
            'submitted_at' => null,
            'total_score' => null,
            'is_passed' => false,
        ]);

        return back()->with(
            'success',
            "Ujian {$attempt->participant?->name} ({$attempt->package?->title}) berhasil dimulai ulang. Sesi ujian dibuka kembali dengan waktu baru dan seluruh jawaban yang telah dipilih tetap tersimpan."
        );
    }

    /**
     * Restart all CBT exam attempts for this event (keeps answers intact, resets timer & opens in_progress).
     */
    public function restartAllAttempts(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        $query = CbtExamAttempt::where('event_id', $event->id);
        if ($request->filled('package_id') && $request->input('package_id') !== 'all') {
            $query->where('cbt_exam_package_id', $request->input('package_id'));
        }

        $count = $query->count();
        $query->update([
            'status' => 'in_progress',
            'started_at' => now(),
            'submitted_at' => null,
            'total_score' => null,
            'is_passed' => false,
        ]);

        return back()->with(
            'success',
            "Sebanyak {$count} percobaan ujian berhasil dimulai ulang. Sesi ujian dibuka kembali dengan waktu baru dan seluruh jawaban yang telah dipilih kenshi tetap tersimpan."
        );
    }

    /**
     * Hapus / kosongkan satu percobaan ujian peserta.
     */
    public function destroyAttempt(Request $request, Event $event, CbtExamAttempt $attempt): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        abort_unless($attempt->event_id === $event->id, 404, 'Ujian tidak sesuai event.');

        $attempt->loadMissing(['participant', 'package']);
        $participantName = $attempt->participant?->name ?? 'Peserta';
        $packageTitle = $attempt->package?->title ?? 'Ujian CBT';

        $attempt->delete();

        return back()->with(
            'success',
            "Percobaan ujian {$participantName} ({$packageTitle}) berhasil dihapus / dikosongkan."
        );
    }

    /**
     * Hapus / kosongkan seluruh percobaan ujian untuk event ini (opsional tersaring per paket).
     */
    public function destroyAllAttempts(Request $request, Event $event): RedirectResponse
    {
        $user = $request->user();
        if (! $user || ! in_array($user->role, ['Admin', 'Penyelenggara', 'Super Admin'], true)) {
            abort(403, 'Akses ditolak.');
        }

        $query = CbtExamAttempt::where('event_id', $event->id);
        if ($request->filled('package_id') && $request->input('package_id') !== 'all') {
            $query->where('cbt_exam_package_id', $request->input('package_id'));
        }

        $count = $query->count();
        $query->delete();

        return back()->with(
            'success',
            "Sebanyak {$count} percobaan ujian berhasil dihapus / dikosongkan dari sistem."
        );
    }
}
