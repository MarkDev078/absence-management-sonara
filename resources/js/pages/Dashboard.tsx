import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../components/useToast';
import ToastContainer from '../components/ToastContainer';
import MobileMenu from '../components/MobileMenu';
import AccountMenu from '../components/AccountMenu';
import LogoutDialog from '../components/LogoutDialog';
import type { User } from '../types/auth';

type AbsenceRequest = {
    id: number;
    statut: string;
    [key: string]: unknown;
};

type DashboardStats = {
    totalDemandes: number;
    demandeApprouvees: number;
    demandeEnAttente: number;
    joursRestants: number;
};

export default function Dashboard({ user }: { user: User }) {
    const { toasts, addToast, removeToast } = useToast();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showNotif, setShowNotif] = useState(false);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const dateStr = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async (): Promise<void> => {
        try {
            const response = await fetch('/api/absence-requests');
            const data = await response.json();
            const requests: AbsenceRequest[] = Array.isArray(data)
                ? data
                : (data.data ?? data.requests ?? []);

            const total = requests.length;
            const approuvees = requests.filter(
                (r) => r.statut === 'approved' || r.statut === 'Approuvée',
            ).length;
            const enAttente = requests.filter(
                (r) => r.statut === 'pending' || r.statut === 'En attente',
            ).length;

            setStats({
                totalDemandes: total,
                demandeApprouvees: approuvees,
                demandeEnAttente: enAttente,
                joursRestants: 19,
            });
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            addToast('Erreur lors du chargement des statistiques', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = (): void => {
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
    };

    const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        rh: 'RH',
        manager: 'Manager',
        employee: 'Employé',
    };

    const userRole = (user.role as string | undefined) ?? 'employé';
    const displayName = user.name;
    const userDepartment = (user.department as string | null) ?? null;

    const a = mounted ? 'animate-in' : '';

    return (
        <>
            <Head title="Tableau de bord" />
            <div className="dashboard-root min-h-screen overflow-x-hidden bg-[#eef2f7] font-sans">
                <ToastContainer />

                {/* Top Bar */}
                <header
                    className={`dash-topbar ${a} sticky top-0 z-20 flex h-16 items-center justify-between bg-[#044E9B] px-6 py-2 shadow-lg`}
                >
                    <div className="flex items-center gap-4">
                        <div className="flex size-8 items-center justify-center">
                            <span className="material-symbols-outlined rounded-full bg-white text-2xl text-[#044E9B]">
                                school
                            </span>
                        </div>
                        <div className="hidden flex-col md:flex">
                            <span className="font-bauhaus text-xl text-white">
                                {timeStr}
                            </span>
                            <span className="text-xs text-[#044E9B]/80">
                                {dateStr}
                            </span>
                        </div>
                    </div>

                    <nav
                        className="flex hidden items-center gap-2 md:flex"
                        aria-label="Actions rapides"
                    >
                        <button
                            onClick={() => router.visit('/nouvelle-demande')}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Créer"
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>
                        </button>
                        <button
                            onClick={() =>
                                addToast(
                                    'Documents → bientôt disponible',
                                    'info',
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Documents"
                        >
                            <span className="material-symbols-outlined">
                                description
                            </span>
                        </button>
                        <button
                            onClick={() => router.visit('/historique')}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Historique"
                        >
                            <span className="material-symbols-outlined">
                                history
                            </span>
                        </button>
                        <button
                            onClick={() => setShowNotif((v) => !v)}
                            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Notifications"
                        >
                            <span className="material-symbols-outlined">
                                notifications
                            </span>
                            <span className="absolute top-1 right-1 h-2 w-2 rounded-full border-2 border-[#044E9B] bg-red-500" />
                        </button>
                        <button
                            onClick={() =>
                                addToast('Centre d’aide → bientôt', 'info')
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                            aria-label="Aide"
                        >
                            <span className="material-symbols-outlined">
                                help
                            </span>
                        </button>
                        <button
                            onClick={() => setShowLogoutDialog(true)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white transition hover:bg-white/20"
                            aria-label="Déconnexion"
                        >
                            <span className="material-symbols-outlined">
                                logout
                            </span>
                        </button>
                    </nav>

                    <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white md:hidden"
                        onClick={() => setShowMobileMenu((v) => !v)}
                        aria-label={
                            showMobileMenu ? 'Fermer le menu' : 'Ouvrir le menu'
                        }
                    >
                        <span className="material-symbols-outlined">
                            {showMobileMenu ? 'close' : 'menu'}
                        </span>
                    </button>
                </header>

                <div className="sticky top-16 z-20 h-[6px] bg-[#009632]" />

                {/* Mobile Menu */}
                <MobileMenu
                    isOpen={showMobileMenu}
                    onClose={() => setShowMobileMenu(false)}
                    onLogout={() => {
                        setShowMobileMenu(false);
                        setShowLogoutDialog(true);
                    }}
                    showToast={(
                        msg: string,
                        type?: 'success' | 'info' | 'error',
                    ) => addToast(msg, type)}
                />

                {/* Account Menu (Desktop) */}
                <AccountMenu
                    isOpen={showAccountMenu}
                    onClose={() => setShowAccountMenu(false)}
                    user={user}
                />

                {/* Background */}
                <div
                    className="fixed inset-[70px,0,0,0] z-0"
                    aria-hidden="true"
                >
                    <div className="absolute inset-0 bg-[#eef2f7]/80 backdrop-blur-sm" />
                </div>

                {/* Mobile Pill */}
                <div className="mx-auto mt-4 max-w-md rounded-full bg-[#044E9B] p-1.5 shadow-lg md:hidden">
                    <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-white">
                            <span className="material-symbols-outlined text-black">
                                person
                            </span>
                        </div>
                        <button
                            onClick={() => addToast('Mes infos', 'info')}
                            className="flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-white/30 bg-transparent text-xs text-white"
                        >
                            <span className="text-xs">•••</span> Infos
                        </button>
                        <button
                            onClick={() =>
                                addToast('Édition du profil → bientôt', 'info')
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-transparent text-white"
                        >
                            <span className="material-symbols-outlined text-xs">
                                edit
                            </span>
                        </button>
                        <button
                            onClick={() => setShowLogoutDialog(true)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white"
                        >
                            <span className="material-symbols-outlined text-xs">
                                logout
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="relative z-1 mx-auto max-w-[1240px] px-4 py-6">
                    <div className="grid grid-cols-3 gap-6 md:grid-cols-12">
                        {/* Profile Sidebar */}
                        <div
                            className={`relative rounded-2xl bg-[#044E9B] p-5 text-white shadow-xl md:col-span-3 ${a}`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex size-24 items-center justify-center rounded-full bg-white shadow-lg">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt=""
                                            className="size-full rounded-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-4xl text-black">
                                            person
                                        </span>
                                    )}
                                </div>
                                <h2 className="font-bauhaus text-lg font-bold">
                                    {displayName}
                                </h2>
                                <p className="mt-1 text-xs text-[#044E9B]/20">
                                    {roleLabels[userRole] ?? userRole}
                                </p>

                                <div className="mt-6 flex w-full flex-col gap-2">
                                    <div className="flex h-7 items-center overflow-hidden rounded-full bg-white">
                                        <span className="flex h-full items-center bg-[#044E9B] px-2 text-[10px] font-bold text-white">
                                            Direction
                                        </span>
                                        <span className="flex-1 px-2 text-center text-xs font-bold text-[#044E9B]">
                                            {userDepartment ?? '—'}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex h-7 items-center overflow-hidden rounded-full bg-white">
                                        <span className="flex h-full items-center bg-[#044E9B] px-2 text-[10px] font-bold text-white">
                                            Service
                                        </span>
                                        <span className="flex-1 px-2 text-center text-xs font-bold text-[#044E9B]">
                                            —
                                        </span>
                                    </div>
                                </div>

                                <div className="my-6 h-px w-full bg-white/20" />

                                <button
                                    onClick={() =>
                                        addToast(
                                            'Édition du profil → bientôt',
                                            'info',
                                        )
                                    }
                                    className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent text-sm font-bold text-white transition hover:bg-white/10"
                                >
                                    <span className="material-symbols-outlined">
                                        edit
                                    </span>
                                    Modifier mon profil
                                </button>

                                <button
                                    onClick={() => setShowLogoutDialog(true)}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-red-600 text-sm font-bold text-white shadow-lg transition hover:bg-red-700"
                                >
                                    <span className="material-symbols-outlined">
                                        logout
                                    </span>
                                    Me déconnecter
                                </button>
                            </div>

                            {/* Floating flag */}
                            <button
                                onClick={() =>
                                    addToast('Signalement transmis', 'success')
                                }
                                className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#044E9B] text-white shadow-lg transition hover:bg-[#044E9B]/90"
                                aria-label="Signaler"
                            >
                                <span className="material-symbols-outlined">
                                    flag
                                </span>
                            </button>
                        </div>

                        {/* Dashboard Board */}
                        <div
                            className={`border-gray/50 rounded-2xl border bg-white p-5 shadow-xl md:col-span-9 ${a}`}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h1 className="font-bauhaus text-xl font-bold text-[#044E9B]">
                                        MON TABLEAU DE BORD
                                    </h1>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        Gardez un œil sur le récapitulatif de
                                        toutes vos informations concernant vos
                                        absences.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        addToast(
                                            'Tableau rafraîchi',
                                            'success',
                                        );
                                        fetchStats();
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-[#044E9B] transition hover:bg-gray-50"
                                    aria-label="Rafraîchir"
                                >
                                    <span className="material-symbols-outlined">
                                        refresh
                                    </span>
                                </button>
                            </div>

                            {/* Quick Actions */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                <button
                                    onClick={() =>
                                        router.visit('/nouvelle-demande')
                                    }
                                    className="flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        add_circle
                                    </span>
                                    <span>Nouvelle demande</span>
                                </button>
                                <button
                                    onClick={() => router.visit('/historique')}
                                    className="flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        history
                                    </span>
                                    <span>Mes demandes</span>
                                </button>
                                <button
                                    onClick={() =>
                                        addToast(
                                            'Reprise de service → formulaire',
                                            'info',
                                        )
                                    }
                                    className="flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        keyboard_return
                                    </span>
                                    <span>Reprise de service</span>
                                </button>
                                <button
                                    onClick={() => setShowNotif((v) => !v)}
                                    className="relative flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        notifications
                                    </span>
                                    <span>Notifications (3 non lues)</span>
                                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                                </button>
                                <button
                                    onClick={() =>
                                        addToast('Paramètres → bientôt', 'info')
                                    }
                                    className="flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        settings
                                    </span>
                                    <span>Paramètres</span>
                                </button>
                                <button
                                    onClick={() =>
                                        addToast('Aide → documentation', 'info')
                                    }
                                    className="flex h-8 flex-1 items-center justify-center gap-2 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-800 transition hover:border-[#044E9B] hover:bg-[#044E9B]/5 hover:text-[#044E9B] md:flex-auto"
                                >
                                    <span className="material-symbols-outlined text-sm text-[#044E9B]">
                                        help
                                    </span>
                                    <span>Aide</span>
                                </button>
                            </div>

                            {/* Mobile Quick Actions (icon circles) */}
                            <div className="mb-4 flex justify-between gap-1 md:hidden">
                                {[
                                    {
                                        label: 'Nouvelle demande',
                                        icon: 'add',
                                        path: '/nouvelle-demande',
                                    },
                                    {
                                        label: 'Mes demandes',
                                        icon: 'history',
                                        path: '/historique',
                                    },
                                    {
                                        label: 'Reprise',
                                        icon: 'keyboard_return',
                                        action: 'toast',
                                    },
                                    {
                                        label: 'Notifications',
                                        icon: 'notifications',
                                        action: 'notif',
                                    },
                                    {
                                        label: 'Paramètres',
                                        icon: 'settings',
                                        action: 'toast',
                                    },
                                    {
                                        label: 'Aide',
                                        icon: 'help',
                                        action: 'toast',
                                    },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => {
                                            if (item.path) {
                                                router.visit(item.path);
                                            } else if (
                                                item.action === 'notif'
                                            ) {
                                                setShowNotif((v) => !v);
                                            } else {
                                                addToast(item.label, 'info');
                                            }
                                        }}
                                        className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#044E9B]"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {item.icon}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                {stats && !loading ? (
                                    <>
                                        <article
                                            onClick={() =>
                                                addToast(
                                                    `${stats.totalDemandes} demandes soumises — voir détails`,
                                                    'info',
                                                )
                                            }
                                            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#D9E6F6] text-2xl text-[#044E9B] transition group-hover:bg-[#044E9B] group-hover:text-white">
                                                <span className="material-symbols-outlined">
                                                    article
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <span className="font-bauhaus text-2xl font-bold text-[#044E9B]">
                                                    {stats.totalDemandes}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                                    DEMANDES SOUMISES
                                                </span>
                                            </div>
                                        </article>
                                        <article
                                            onClick={() =>
                                                addToast(
                                                    `${stats.demandeApprouvees} demandes approuvées 🎉`,
                                                    'success',
                                                )
                                            }
                                            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#D6F0DD] text-2xl text-[#009632] transition group-hover:bg-[#009632] group-hover:text-white">
                                                <span className="material-symbols-outlined">
                                                    check_circle
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <span className="font-bauhaus text-2xl font-bold text-[#009632]">
                                                    {stats.demandeApprouvees}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                                    DEMANDES APPROUVÉES
                                                </span>
                                            </div>
                                        </article>
                                        <article
                                            onClick={() =>
                                                addToast(
                                                    `${stats.demandeEnAttente} demande en attente — action requise`,
                                                    'info',
                                                )
                                            }
                                            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#FFF0C7] text-2xl text-[#C99700] transition group-hover:bg-[#C99700] group-hover:text-white">
                                                <span className="material-symbols-outlined">
                                                    schedule
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <span className="font-bauhaus text-2xl font-bold text-[#B78A00]">
                                                    {stats.demandeEnAttente}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                                    DEMANDE EN ATTENTE
                                                </span>
                                            </div>
                                        </article>
                                        <article
                                            onClick={() =>
                                                addToast(
                                                    `${stats.joursRestants} jours restants — planifiez vos congés`,
                                                    'info',
                                                )
                                            }
                                            className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md"
                                        >
                                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-[#E6E8EB] font-bauhaus text-2xl text-[#2b3545] transition group-hover:bg-[#2b3545] group-hover:text-white">
                                                <span className="text-sm">
                                                    123
                                                </span>
                                            </div>
                                            <div className="ml-3">
                                                <span className="font-bauhaus text-2xl font-bold text-[#1a2636]">
                                                    {stats.joursRestants}
                                                </span>
                                                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                                                    JOURS RESTANTS 2026
                                                </span>
                                            </div>
                                        </article>
                                    </>
                                ) : (
                                    <>
                                        <div className="col-span-2 animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-3">
                                            <div className="h-12 w-2/3 rounded-lg bg-gray-300" />
                                            <div className="mt-2 h-4 w-1/2 rounded bg-gray-300" />
                                        </div>
                                        <div className="col-span-2 animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-3">
                                            <div className="h-12 w-2/3 rounded-lg bg-gray-300" />
                                            <div className="mt-2 h-4 w-1/2 rounded bg-gray-300" />
                                        </div>
                                        <div className="col-span-2 animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-3">
                                            <div className="h-12 w-2/3 rounded-lg bg-gray-300" />
                                            <div className="mt-2 h-4 w-1/2 rounded bg-gray-300" />
                                        </div>
                                        <div className="col-span-2 animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-3">
                                            <div className="h-12 w-2/3 rounded-lg bg-gray-300" />
                                            <div className="mt-2 h-4 w-1/2 rounded bg-gray-300" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Notifications Popover */}
                {showNotif && (
                    <div className="animate-in fixed top-[76px] right-4 z-30 w-80 rounded-xl border border-gray-100 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                            <strong className="text-sm font-bold">
                                Notifications
                            </strong>
                            <button
                                onClick={() => setShowNotif(false)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                aria-label="Fermer"
                            >
                                <span className="material-symbols-outlined text-xs">
                                    close
                                </span>
                            </button>
                        </div>
                        <ul className="py-2">
                            <li className="flex items-center gap-2 border-b border-gray-50 px-4 py-3 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                <span>Congé approuvé — 12/10/2026</span>
                            </li>
                            <li className="flex items-center gap-2 border-b border-gray-50 px-4 py-3 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#044E9B]" />
                                <span>Nouvelle politique d’absence</span>
                            </li>
                            <li className="flex items-center gap-2 px-4 py-3 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#009632]" />
                                <span>Rappel : reprise le 20/10</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => {
                                setShowNotif(false);
                                addToast(
                                    '3 notifications marquées lues',
                                    'success',
                                );
                            }}
                            className="h-9 w-full bg-gray-50 text-sm font-bold text-[#044E9B] transition hover:bg-gray-100"
                        >
                            Tout marquer comme lu
                        </button>
                    </div>
                )}

                {/* Logout Dialog */}
                <LogoutDialog
                    isOpen={showLogoutDialog}
                    onClose={() => setShowLogoutDialog(false)}
                />

                <style>{`
                    .dashboard-root {
                        font-family: "Trebuchet MS", "Trebuchet", "Segoe UI", sans-serif;
                    }
                    .animate-in {
                        animation: dashCardIn 0.6s ease-out forwards;
                    }
                    @keyframes dashCardIn {
                        from { opacity: 0; transform: translateY(16px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </div>
        </>
    );
}
