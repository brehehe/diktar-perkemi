<?php

namespace App\Actions\Events;

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\Participant;
use App\Models\QuestionBank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class SubmitCbtExam
{
    /**
     * @param  array<string, mixed>|null  $submittedAnswers
     * @param  Collection<int, CbtQuestion|QuestionBank>  $questions
     */
    public function handle(
        Event $event,
        CbtExamPackage $package,
        Participant $participant,
        EventParticipant $enrollment,
        ?array $submittedAnswers,
        Collection $questions,
    ): CbtExamAttempt {
        return DB::transaction(function () use ($event, $package, $participant, $enrollment, $submittedAnswers, $questions): CbtExamAttempt {
            $attemptQuery = CbtExamAttempt::query()
                ->where('event_id', $event->id)
                ->where('cbt_exam_package_id', $package->id)
                ->where('participant_id', $participant->id);
            $attempt = (clone $attemptQuery)
                ->where('status', 'in_progress')
                ->lockForUpdate()
                ->first();

            if (! $attempt) {
                return (clone $attemptQuery)
                    ->whereIn('status', CbtExamAttempt::TERMINAL_STATUSES)
                    ->latest('submitted_at')
                    ->firstOrFail();
            }

            $timedOut = $attempt->hasExpired($package);
            $storedAnswers = is_array($attempt->answers) ? $attempt->answers : [];
            $incomingAnswers = is_array($submittedAnswers) ? $submittedAnswers : [];
            $answers = array_merge($storedAnswers, $incomingAnswers);

            [$score, $isPassed, $finalAnswers] = $this->score($questions, $answers, (float) $package->passing_score);

            $attempt->update([
                'status' => $timedOut ? 'timed_out' : 'submitted',
                'submitted_at' => now(),
                'total_score' => $score,
                'is_passed' => $isPassed,
                'answers' => $finalAnswers,
                'feedback' => $timedOut
                    ? 'Waktu ujian berakhir. Jawaban yang telah tersimpan dikumpulkan otomatis.'
                    : $attempt->feedback,
            ]);
            $enrollment->update(['score_theory' => $score]);

            return $attempt->refresh();
        });
    }

    /**
     * @param  Collection<int, CbtQuestion|QuestionBank>  $questions
     * @param  array<string, mixed>  $answers
     * @return array{0: float, 1: bool, 2: array<string, mixed>}
     */
    private function score(Collection $questions, array $answers, float $passingScore): array
    {
        $totalPoints = 0.0;
        $earnedPoints = 0.0;

        // Check if question IDs match directly or if IDs shifted due to re-syncing
        $hasDirectKeyMatch = false;
        foreach ($questions as $question) {
            if (array_key_exists((string) $question->id, $answers)) {
                $hasDirectKeyMatch = true;
                break;
            }
        }

        $normalizedAnswers = $answers;
        if (! $hasDirectKeyMatch && ! empty($answers)) {
            $answerValues = array_values($answers);
            $normalizedAnswers = [];
            foreach ($questions as $idx => $question) {
                if (array_key_exists($idx, $answerValues)) {
                    $normalizedAnswers[(string) $question->id] = $answerValues[$idx];
                }
            }
        }

        foreach ($questions as $question) {
            $points = (float) $question->points;
            $totalPoints += $points;
            $submittedAnswer = $normalizedAnswers[(string) $question->id] ?? null;
            $correctAnswer = $question->correct_answer;

            $isCorrect = false;
            if (is_array($correctAnswer)) {
                $normCorrect = array_map(fn ($v) => strtoupper(trim((string) $v)), $correctAnswer);
                sort($normCorrect);
                $normSubmitted = is_array($submittedAnswer)
                    ? array_map(fn ($v) => strtoupper(trim((string) $v)), $submittedAnswer)
                    : ($submittedAnswer !== null && $submittedAnswer !== '' ? [strtoupper(trim((string) $submittedAnswer))] : []);
                sort($normSubmitted);
                if (! empty($normCorrect) && $normCorrect === $normSubmitted) {
                    $isCorrect = true;
                }
            } elseif ($submittedAnswer !== null && $submittedAnswer !== '') {
                $normCorrect = strtoupper(trim((string) $correctAnswer));
                $normSubmitted = strtoupper(trim((string) $submittedAnswer));
                if ($normSubmitted === $normCorrect) {
                    $isCorrect = true;
                }
            }

            if ($isCorrect) {
                $earnedPoints += $points;
            }
        }

        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0.0;

        return [$score, $score >= $passingScore, $normalizedAnswers];
    }
}
