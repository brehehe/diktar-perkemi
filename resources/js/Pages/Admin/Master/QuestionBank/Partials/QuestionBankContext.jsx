import { createContext, useContext } from 'react';

export const QuestionBankContext = createContext(null);

export function useQuestionBank() {
    const value = useContext(QuestionBankContext);
    if (!value) throw new Error('QuestionBankDialogs requires QuestionBankContext.');
    return value;
}
