import { usePage } from '@inertiajs/react';

export function getIsProdas(props = null) {
    if (props) {
        if (props.is_prodas !== undefined && props.is_prodas !== null) {
            return Boolean(props.is_prodas);
        }
        if (props.portal?.is_prodas !== undefined && props.portal?.is_prodas !== null) {
            return Boolean(props.portal.is_prodas);
        }
    }
    if (typeof window !== 'undefined' && window.__IS_PRODAS__ !== undefined) {
        return Boolean(window.__IS_PRODAS__);
    }
    return import.meta.env.VITE_IS_PRODAS === 'true';
}

export function useIsProdas() {
    try {
        const page = usePage();
        return getIsProdas(page?.props);
    } catch {
        return getIsProdas();
    }
}
