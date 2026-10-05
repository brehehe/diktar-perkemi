<?php

namespace App\Actions\Events;

use App\Models\CbtExamAttempt;
use App\Models\CbtExamPackage;
use App\Models\CbtQuestion;
use App\Models\QuestionBank;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class NormalizeCbtExamAttemptQuestions
{
    /**
     * @param  Collection<int, CbtQuestion|QuestionBank>  $questions
     */
    public function handle(
        CbtExamAttempt $attempt,
        CbtExamPackage $package,
        Collection $questions,
    ): CbtExamAttempt {
        return DB::transaction(function () use ($attempt, $package, $questions): CbtExamAttempt {
            $lockedAttempt = CbtExamAttempt::query()
                ->lockForUpdate()
                ->findOrFail($attempt->id);

            $availableQuestionIds = collect($questions->modelKeys())
                ->map(fn (int|string $questionId): int => (int) $questionId)
                ->values();
            $availableQuestionMap = array_fill_keys($availableQuestionIds->all(), true);
            $existingQuestionOrder = collect($lockedAttempt->question_order ?? [])
                ->map(fn (mixed $questionId): int => (int) $questionId)
                ->filter(fn (int $questionId): bool => isset($availableQuestionMap[$questionId]))
                ->unique()
                ->values();

            $candidateQuestionIds = $existingQuestionOrder->isNotEmpty()
                ? $existingQuestionOrder->concat($availableQuestionIds->diff($existingQuestionOrder))->values()
                : ($package->randomize_questions ? $availableQuestionIds->shuffle() : $availableQuestionIds);

            $answers = is_array($lockedAttempt->answers) ? $lockedAttempt->answers : [];
            $answeredQuestionMap = collect($answers)
                ->reject(fn (mixed $answer): bool => $answer === null || $answer === '')
                ->keys()
                ->map(fn (int|string $questionId): int => (int) $questionId)
                ->flip()
                ->all();
            $questionLimit = $package->total_questions > 0
                ? min($package->total_questions, $availableQuestionIds->count())
                : $availableQuestionIds->count();
            $orderedCandidateQuestionIds = $existingQuestionOrder->count() > $questionLimit
                ? $candidateQuestionIds
                    ->filter(fn (int $questionId): bool => isset($answeredQuestionMap[$questionId]))
                    ->concat($candidateQuestionIds->reject(fn (int $questionId): bool => isset($answeredQuestionMap[$questionId])))
                : $candidateQuestionIds;
            $selectedQuestionIds = $orderedCandidateQuestionIds
                ->take($questionLimit)
                ->values()
                ->all();
            $selectedQuestionMap = array_fill_keys(array_map('strval', $selectedQuestionIds), true);
            $selectedAnswers = array_intersect_key($answers, $selectedQuestionMap);
            $optionOrder = is_array($lockedAttempt->option_order) ? $lockedAttempt->option_order : [];
            $selectedOptionOrder = array_intersect_key($optionOrder, $selectedQuestionMap);

            $lockedAttempt->update([
                'question_order' => $selectedQuestionIds,
                'answers' => $selectedAnswers,
                'option_order' => $selectedOptionOrder,
            ]);

            return $lockedAttempt->refresh();
        });
    }
}
