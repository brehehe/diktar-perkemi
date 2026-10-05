<?php

namespace App\Actions\Events;

use App\Models\CbtExamAttempt;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;

class CalculateCbtExamAttemptScore
{
    public function __construct(private readonly SubmitCbtExam $submitCbtExam) {}

    /**
     * Calculate a read-only score preview with the same scorer used when an exam is submitted.
     *
     * @return array{
     *     score: float,
     *     official_score: ?float,
     *     calculated_score: float,
     *     score_is_provisional: bool,
     *     calculated_is_passed: bool,
     *     is_terminal: bool,
     *     total_answered: int,
     *     total_questions: int
     * }
     */
    public function handle(CbtExamAttempt $attempt): array
    {
        $attempt->loadMissing(['package.questions', 'package.bankQuestions']);

        $package = $attempt->package;
        $questions = $package?->questions
            ?->where('is_active', true)
            ->sortBy('sort_order')
            ->values();

        if (! $questions || $questions->isEmpty()) {
            $questions = $package?->bankQuestions
                ?->where('status', 'active')
                ->values() ?? new EloquentCollection;
        }

        $assignedQuestions = $attempt->orderedQuestions($questions);
        $answers = is_array($attempt->answers) ? $attempt->answers : [];
        [$calculatedScore, $calculatedIsPassed, $normalizedAnswers] = $this->submitCbtExam->score(
            $assignedQuestions,
            $answers,
            (float) ($package?->passing_score ?? 70),
        );

        $isTerminal = in_array($attempt->status, CbtExamAttempt::TERMINAL_STATUSES, true);
        $officialScore = $attempt->total_score !== null ? (float) $attempt->total_score : null;
        $totalAnswered = collect($normalizedAnswers)
            ->filter(fn (mixed $answer): bool => is_array($answer) ? $answer !== [] : $answer !== null && $answer !== '')
            ->count();

        return [
            'score' => $officialScore ?? $calculatedScore,
            'official_score' => $officialScore,
            'calculated_score' => $calculatedScore,
            'score_is_provisional' => ! $isTerminal || $officialScore === null,
            'calculated_is_passed' => $calculatedIsPassed,
            'is_terminal' => $isTerminal,
            'total_answered' => $totalAnswered,
            'total_questions' => $assignedQuestions->count(),
        ];
    }
}
