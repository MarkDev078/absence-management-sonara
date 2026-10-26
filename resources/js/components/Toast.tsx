import React from 'react';
import { cn } from '../lib/utils';
import type { Toast } from './useToast';

type ToastProps = {
    toast: Toast;
    onDismiss: (id: number) => void;
};

const TOAST_STYLES: Record<Toast['type'], string> = {
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
    error: 'bg-red-500 text-white',
};

const TOAST_ICONS: Record<Toast['type'], string> = {
    success: 'check_circle',
    info: 'info',
    error: 'error',
};

export default function Toast({ toast, onDismiss }: ToastProps) {
    return (
        <div
            key={toast.id}
            className={cn(
                'animate-in fade-in slide-in-from-right-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium shadow-md duration-300',
                TOAST_STYLES[toast.type],
            )}
        >
            <div className="flex-shrink-0">
                <span className="material-symbols-outlined">
                    {TOAST_ICONS[toast.type]}
                </span>
            </div>
            <div className="flex-1">{toast.message}</div>
            <button
                onClick={() => onDismiss(toast.id)}
                aria-label="Fermer"
                className="ml-2 rounded p-1 text-white/70 transition hover:text-white"
            >
                <span className="material-symbols-outlined">close</span>
            </button>
        </div>
    );
}
