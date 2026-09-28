import { createContext, useContext } from 'react';

export const CbtPackagesContext = createContext(null);

export function useCbtPackages() {
    const value = useContext(CbtPackagesContext);
    if (!value) throw new Error('CbtPackagesDialogs requires CbtPackagesContext.');
    return value;
}
