import { createContext, useContext } from 'react';

export const CbtPackageContext = createContext(null);

export function useCbtPackage() {
    const value = useContext(CbtPackageContext);
    if (!value) throw new Error('CbtPackageDialogs requires CbtPackageContext.');
    return value;
}
