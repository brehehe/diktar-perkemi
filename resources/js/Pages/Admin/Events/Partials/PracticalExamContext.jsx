import { createContext, useContext } from 'react';

export const PracticalExamContext = createContext(null);

export function usePracticalExam() {
    const value = useContext(PracticalExamContext);
    if (!value) throw new Error('PracticalExamMatrix requires PracticalExamContext.');
    return value;
}
