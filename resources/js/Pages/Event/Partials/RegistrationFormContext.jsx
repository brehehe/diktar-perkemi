import { createContext, useContext } from 'react';

export const RegistrationFormContext = createContext(null);

export function useRegistrationForm() {
    const context = useContext(RegistrationFormContext);

    if (!context) {
        throw new Error('Registration sections must be rendered inside RegistrationFormContext.');
    }

    return context;
}
