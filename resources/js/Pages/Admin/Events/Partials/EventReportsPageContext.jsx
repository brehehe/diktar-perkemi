import { createContext, useContext } from 'react';

export const EventReportsPageContext = createContext(null);

export function useEventReportsPage() {
    const context = useContext(EventReportsPageContext);

    if (!context) {
        throw new Error('Event report tabs must be rendered inside EventReportsPageContext.');
    }

    return context;
}
