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
            $answers = $timedOut
                ? ($attempt->answers ?? [])
                : ($submittedAnswers ?? $attempt->answers ?? []);
            [$score, $isPassed] = $this->score($questions, $answers, (float) $package->passing_score);

            $attempt->update([
                'status' => $timedOut ? 'timed_out' : 'submitted',
                'submitted_at' => now(),
                'total_score' => $score,
                'is_passed' => $isPassed,
                'answers' => $answers,
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
     * @return array{0: float, 1: bool}
     */
    private function score(Collection $questions, array $answers, float $passingScore): array
    {
        $totalPoints = 0.0;
        $earnedPoints = 0.0;

        foreach ($questions as $question) {
            $points = (float) $question->points;
            $totalPoints += $points;
            $submittedAnswer = $answers[(string) $question->id] ?? null;
            $correctAnswer = $question->correct_answer;

            if (is_array($correctAnswer)) {
                if ($submittedAnswer == $correctAnswer
                    || (is_array($submittedAnswer) && empty(array_diff($correctAnswer, $submittedAnswer)))) {
                    $earnedPoints += $points;
                }
            } elseif ((string) $submittedAnswer === (string) $correctAnswer) {
                $earnedPoints += $points;
            }
        }

        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0.0;

        return [$score, $score >= $passingScore];
    }
}
