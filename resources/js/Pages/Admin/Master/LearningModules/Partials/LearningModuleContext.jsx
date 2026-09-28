import { createContext, useContext } from 'react';

export const LearningModuleContext = createContext(null);

export function useLearningModule() {
    const value = useContext(LearningModuleContext);
    if (!value) throw new Error('LearningModuleDialogs requires LearningModuleContext.');
    return value;
}
