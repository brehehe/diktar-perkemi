import { createContext, useContext } from 'react';

export const EventShowContext = createContext(null);

export function useEventShow() {
    const context = useContext(EventShowContext);

    if (!context) {
        throw new Error('Event show components must be rendered inside EventShowContext.');
    }

    return context;
}
