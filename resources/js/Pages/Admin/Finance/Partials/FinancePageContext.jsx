import { createContext, useContext } from 'react';

export const FinancePageContext = createContext(null);

export function useFinancePage() {
    const context = useContext(FinancePageContext);

    if (!context) {
        throw new Error('Finance tabs must be rendered inside FinancePageContext.');
    }

    return context;
}
