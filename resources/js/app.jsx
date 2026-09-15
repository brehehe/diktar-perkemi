import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

function initInertia() {
    const appElement = document.getElementById('app');
    if (!appElement || !appElement.dataset.page) {
        return;
    }

    createInertiaApp({
        title: (title) => (title ? `${title} — Pustaka Penataran` : 'Pustaka Penataran'),
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.jsx', { eager: true });
            const page = pages[`./Pages/${name}.jsx`];
            if (!page) {
                throw new Error(`Inertia page not found: ${name}`);
            }
            return page;
        },
        setup({ el, App, props }) {
            const root = createRoot(el);
            root.render(<App {...props} />);
        },
        progress: {
            color: '#0B63CE',
            showSpinner: true,
        },
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInertia);
} else {
    initInertia();
}
