import { useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'info' | 'error';

export type Toast = {
    id: number;
    message: string;
    type: ToastType;
};

let toasts: Toast[] = [];
let listeners: Set<(t: Toast[]) => void> = new Set();

function notify(): void {
    listeners.forEach((fn) => fn(toasts));
}

export function useToast() {
    const [state, setState] = useState<Toast[]>(toasts);

    useEffect(() => {
        listeners.add(setState);
        return () => {
            listeners.delete(setState);
        };
    }, []);

    const addToast = useCallback(
        (message: string, type: ToastType = 'info'): number => {
            const id = Date.now() + Math.random();
            const newToast: Toast = { id, message, type };
            toasts = [...toasts, newToast];
            notify();

            setTimeout(() => {
                toasts = toasts.filter((t) => t.id !== id);
                notify();
            }, 3200);

            return id;
        },
        [],
    );

    const removeToast = useCallback((id: number): void => {
        toasts = toasts.filter((t) => t.id !== id);
        notify();
    }, []);

    return { toasts: state, addToast, removeToast };
}
