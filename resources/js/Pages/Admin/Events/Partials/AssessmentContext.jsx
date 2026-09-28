import { createContext, useContext } from 'react';

export const AssessmentContext = createContext(null);

export function useAssessment() {
    const value = useContext(AssessmentContext);
    if (!value) throw new Error('AssessmentMatrix requires AssessmentContext.');
    return value;
}
