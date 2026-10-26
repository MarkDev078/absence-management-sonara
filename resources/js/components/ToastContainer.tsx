import React from 'react';
import { useToast } from './useToast';
import Toast from './Toast';

export default function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div
            className="pointer-events-none fixed top-5 right-5 z-50 flex flex-col gap-2"
            aria-live="polite"
            aria-atomic="true"
        >
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="pointer-events-auto"
                    style={{
                        animationDelay: `${toasts.indexOf(toast) * 100}ms`,
                    }}
                >
                    <Toast toast={toast} onDismiss={removeToast} />
                </div>
            ))}
        </div>
    );
}
