import { useCallback } from 'react';
import { router } from '@inertiajs/react';

type MobileMenuProps = {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void;
};

type MenuItem = {
    label: string;
    icon: string;
    path: string;
    toast?: string;
    toastType?: 'success' | 'info' | 'error';
};

const MENU_ITEMS: MenuItem[] = [
    {
        label: 'NOUVELLE DEMANDE D’ABSENCE',
        icon: 'add_circle',
        path: '/nouvelle-demande',
    },
    {
        label: 'MES BROUILLONS',
        icon: 'description',
        path: '',
        toast: 'Brouillons → bientôt disponible',
        toastType: 'info',
    },
    {
        label: 'MON HISTORIQUE',
        icon: 'history',
        path: '/historique',
    },
    {
        label: 'TYPES D’ABSENCE',
        icon: 'category',
        path: '/absence-types',
    },
    {
        label: 'APPROBATIONS',
        icon: 'check_circle',
        path: '/approvals',
    },
    {
        label: 'NOTIFICATIONS',
        icon: 'notifications',
        path: '',
        toast: '3 notifications non lues',
        toastType: 'info',
    },
    {
        label: 'CENTRE D’AIDE',
        icon: 'help',
        path: '',
        toast: 'Centre d’aide → bientôt',
        toastType: 'info',
    },
    {
        label: 'MON PROFIL',
        icon: 'person',
        path: '',
        toast: 'Mon profil → bientôt',
        toastType: 'info',
    },
];

export default function MobileMenu({
    isOpen,
    onClose,
    onLogout,
    showToast,
}: MobileMenuProps) {
    const handleNav = useCallback(
        (item: MenuItem): void => {
            onClose();
            if (item.path) {
                router.visit(item.path, { preserveScroll: true });
            } else if (item.toast && showToast) {
                showToast(item.toast, item.toastType);
            }
        },
        [router, onClose, showToast],
    );

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl sm:w-80 sm:max-w-sm"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="border-gray/100 border-b p-6">
                    <h2 className="text-sm font-bold tracking-wider text-gray-900 uppercase">
                        Navigation
                    </h2>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto px-6 py-4">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => handleNav(item)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-[#044E9B]/50 hover:text-[#044E9B]"
                        >
                            <span className="material-symbols-outlined text-[#044E9B]">
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="border-gray/100 border-t p-6">
                    <button
                        onClick={onLogout}
                        className="hover:bg-red/50 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 transition"
                    >
                        <span className="material-symbols-outlined">
                            logout
                        </span>
                        Me déconnecter
                    </button>
                </div>
            </div>
        </>
    );
}
