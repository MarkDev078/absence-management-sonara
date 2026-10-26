import React from 'react';
import { router } from '@inertiajs/react';
import type { User } from '../types/auth';

type AccountMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onEditProfile?: () => void;
};

export default function AccountMenu({
    isOpen,
    onClose,
    user,
    onEditProfile,
}: AccountMenuProps) {
    if (!isOpen) return null;

    const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        rh: 'RH',
        manager: 'Manager',
        employee: 'Employé',
    };

    return (
        <>
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="border-gray/100 fixed top-16 right-0 z-50 w-72 rounded-2xl border bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-gray/100 border-b px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-[#044E9B]/10 text-[#044E9B]">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt=""
                                    className="size-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="material-symbols-outlined">
                                    person
                                </span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                {user.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                                {roleLabels[String(user.role)] ??
                                    String(user.role)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-3">
                    {(user.department as string | null) && (
                        <>
                            <div className="mb-3 text-xs font-medium tracking-wider text-gray-400 uppercase">
                                Département
                            </div>
                            <div className="border-gray/100 bg-gray/50 mb-3 flex items-center gap-2 rounded-lg border px-3 py-2">
                                <span className="material-symbols-outlined text-xs text-gray-400">
                                    work
                                </span>
                                <span className="text-sm text-gray-700">
                                    {String(user.department)}
                                </span>
                            </div>
                        </>
                    )}
                    <div className="mb-2 text-xs font-medium tracking-wider text-gray-400 uppercase">
                        Compte
                    </div>
                    {onEditProfile && (
                        <button
                            onClick={() => {
                                onClose();
                                onEditProfile();
                            }}
                            className="hover:bg-gray/50 flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition"
                        >
                            <span className="material-symbols-outlined">
                                edit
                            </span>
                            Modifier mon profil
                        </button>
                    )}
                    <button
                        onClick={() => {
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
                        }}
                        className="hover:bg-red/50 flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 transition"
                    >
                        <span className="material-symbols-outlined">
                            logout
                        </span>
                        Se déconnecter
                    </button>
                </div>
            </div>
        </>
    );
}
