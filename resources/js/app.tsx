import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob<{ default: any }>('./Pages/**/*.tsx'),
        ) as any,
    setup({ el, App, props }) {
        if (typeof window !== 'undefined') {
            const root = createRoot(el);
            root.render(<App {...props} />);
            return () => root.unmount();
        }
    },
    progress: {
        color: '#4B5563',
    },
});
