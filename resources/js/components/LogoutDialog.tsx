import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

type LogoutDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

export default function LogoutDialog({ isOpen, onClose }: LogoutDialogProps) {
    const handleLogout = useCallback((): void => {
        onClose();
        router.post(
            '/logout',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    window.location.href = '/login';
                },
            },
        );
    }, [router, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden={!isOpen}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined text-red-500">
                        logout
                    </span>
                    <h2 className="text-lg font-bold text-gray-900">
                        Déconnexion
                    </h2>
                </div>
                <p className="mb-6 text-gray-600">
                    Voulez-vous vraiment vous déconnecter de votre compte ?
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-200"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                    >
                        Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
