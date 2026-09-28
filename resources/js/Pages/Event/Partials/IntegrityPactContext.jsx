import { createContext, useContext } from 'react';

export const IntegrityPactContext = createContext(null);

export function useIntegrityPact() {
    const value = useContext(IntegrityPactContext);
    if (!value) throw new Error('Pact sections require IntegrityPactContext.');
    return value;
}
