import { createContext, useContext } from 'react';

export const EventReportsTabContext = createContext(null);

export function useEventReportsTab() {
    const context = useContext(EventReportsTabContext);

    if (!context) {
        throw new Error('Event report panels must be rendered inside EventReportsTabContext.');
    }

    return context;
}
