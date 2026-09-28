import { createContext, useContext } from 'react';

export const RundownContext = createContext(null);

export function useRundown() {
    const context = useContext(RundownContext);

    if (!context) {
        throw new Error('Rundown sections must be rendered inside RundownContext.');
    }

    return context;
}
