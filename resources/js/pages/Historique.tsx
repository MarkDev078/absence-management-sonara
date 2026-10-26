import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import ToastContainer from '../components/ToastContainer';
import MobileMenu from '../components/MobileMenu';
import AccountMenu from '../components/AccountMenu';
import LogoutDialog from '../components/LogoutDialog';
import { useToast } from '../components/useToast';
import type { User } from '../types/auth';

type AbsenceRequest = {
    id: number;
    absence_type_id: number;
    start_date: string;
    start_time_slot: string | null;
    end_date: string;
    end_time_slot: string | null;
    reason: string;
    contact_phone: string | null;
    status: string;
    absenceType?: { id: number; label: string };
    created_at: string;
    updated_at: string;
};

type SearchScope = 'tout' | 'numero' | 'nature' | 'date' | 'etat';

const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    approved: 'Approuvée',
    cancelled: 'Annulée',
};

const scopeLabel: Record<SearchScope, string> = {
    tout: 'Chercher dans : Tout',
    numero: 'Chercher dans : N°',
    nature: 'Chercher dans : Nature absence',
    date: 'Chercher dans : Date soumission',
    etat: 'Chercher dans : État',
};

const formatDateSoumission = (iso: string): { main: string; sub: string } => {
    const d = new Date(iso);
    const main =
        d.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        }) +
        ' ' +
        d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    const mainCap = main.charAt(0).toUpperCase() + main.slice(1);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    let sub = '';
    if (diffDays < 1) sub = "Aujourd'hui";
    else if (diffDays === 1) sub = 'Il y a 1 jour';
    else if (diffDays < 30) sub = `Il y a ${diffDays} jours`;
    else if (diffDays < 60) sub = 'Il y a 1 mois';
    else if (diffDays < 365) sub = `Il y a ${Math.floor(diffDays / 30)} mois`;
    else if (diffDays < 730) sub = 'Il y a 1 an';
    else sub = `Il y a ${Math.floor(diffDays / 365)} ans`;
    return { main: mainCap, sub };
};

export default function Historique({ user }: { user: User }) {
    const { addToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [requests, setRequests] = useState<AbsenceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [scope, setScope] = useState<SearchScope>('tout');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const iv = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(iv);
    }, []);

    useEffect(() => {
        const t = window.setTimeout(() => setMounted(true), 50);
        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        void loadRequests();
    }, []);

    const loadRequests = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch('/api/absence-requests', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des demandes.');
            }
            const data: AbsenceRequest[] = await response.json();
            setRequests(
                data.sort(
                    (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                ),
            );
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            addToast('Erreur lors du chargement des demandes.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const qRaw = search.trim().toLowerCase();
        if (!qRaw) return requests;
        return requests.filter((d) => {
            const { main, sub } = formatDateSoumission(d.created_at);
            const dateHay = `${main} ${sub} ${d.created_at}`.toLowerCase();
            const idHay = String(d.id).toLowerCase();
            const natureHay = (d.absenceType?.label ?? '').toLowerCase();
            const etatHay =
                STATUS_LABELS[d.status]?.toLowerCase() ??
                d.status.toLowerCase();
            const toutHay = `${idHay} ${natureHay} ${dateHay} ${etatHay}`;
            switch (scope) {
                case 'numero':
                    return idHay.includes(qRaw);
                case 'nature':
                    return natureHay.includes(qRaw);
                case 'date':
                    return dateHay.includes(qRaw);
                case 'etat':
                    return etatHay.includes(qRaw);
                case 'tout':
                default:
                    return toutHay.includes(qRaw);
            }
        });
    }, [requests, search, scope]);

    const toggleSelectionMode = (): void => {
        setIsSelectionMode((v) => !v);
        setSelectedIds(new Set());
    };
    const exitSelectionMode = (): void => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
    };
    const toggleSelect = (id: number): void => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };
    const selectAll = (): void => {
        setSelectedIds(new Set(filtered.map((d) => d.id)));
    };
    const deselectAll = (): void => {
        setSelectedIds(new Set());
    };
    const invertSelection = (): void => {
        const allIds = filtered.map((d) => d.id);
        setSelectedIds((prev) => {
            const next = new Set<number>();
            for (const id of allIds) {
                if (!prev.has(id)) next.add(id);
            }
            return next;
        });
    };
    const handleDeleteClick = (): void => {
        if (selectedIds.size === 0) {
            addToast('Sélectionnez au moins une demande', 'info');
            return;
        }
        setShowDeleteDialog(true);
    };
    const confirmDelete = async (): Promise<void> => {
        const toDelete = new Set(selectedIds);
        let successCount = 0;
        let failCount = 0;
        for (const id of toDelete) {
            try {
                const response = await fetch(`/api/absence-requests/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                });
                if (response.ok) successCount++;
                else failCount++;
            } catch {
                failCount++;
            }
        }
        setRequests((prev) => prev.filter((d) => !toDelete.has(d.id)));
        setShowDeleteDialog(false);
        setSelectedIds(new Set());
        setIsSelectionMode(false);
        if (successCount > 0) {
            addToast(
                `${successCount} demande${successCount > 1 ? 's' : ''} supprimée${
                    successCount > 1 ? 's' : ''
                }`,
                'success',
            );
        }
        if (failCount > 0) {
            addToast(
                `${failCount} suppression${failCount > 1 ? 's' : ''} échouée${
                    failCount > 1 ? 's' : ''
                }`,
                'error',
            );
        }
    };
    const handleCancel = async (id: number): Promise<void> => {
        try {
            const response = await fetch(`/api/absence-requests/${id}/cancel`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                addToast('Erreur lors de l’annulation de la demande.', 'error');
                return;
            }
            setRequests((prev) =>
                prev.map((d) =>
                    d.id === id ? { ...d, status: 'cancelled' } : d,
                ),
            );
            addToast('Demande annulée.', 'success');
        } catch {
            addToast('Erreur lors de l’annulation de la demande.', 'error');
        }
    };
    const handleRefresh = (): void => {
        void loadRequests();
        addToast('Historique rafraîchi', 'success');
    };
    const handleRowClick = (d: AbsenceRequest): void => {
        if (isSelectionMode) {
            toggleSelect(d.id);
        } else {
            router.visit(`/absence-requests/${d.id}`);
        }
    };
    const handleLogout = (): void => {
        setShowLogoutDialog(true);
    };

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
    const shortDate = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const a = mounted ? 'animated' : '';

    const statusLabel = (status: string): string =>
        STATUS_LABELS[status] ?? status;

    return (
        <>
            <Head title="Historique des demandes d’absence" />
            <ToastContainer />

            <div className={`dashboard-root hist-root ${a}`}>
                <header className={`dash-topbar ${a}`}>
                    <div className="dash-topbar-left">
                        <div className="dash-logo-wrap">
                            <img
                                src="/assets/SONARA_Logo.png"
                                alt="SONARA"
                                className="dash-logo"
                            />
                        </div>
                        <div className="dash-time">
                            <span className="dash-time-hour">{timeStr}</span>
                            <span className="dash-time-date">{dateStr}</span>
                            <span className="dash-time-short">{shortDate}</span>
                        </div>
                    </div>
                    <nav
                        className="dash-topbar-right nd-desktop-nav"
                        aria-label="Actions rapides"
                    >
                        <button
                            className="dash-icon-btn"
                            aria-label="Accueil"
                            onClick={() => router.visit('/dashboard')}
                        >
                            <span className="material-symbols-outlined">
                                home
                            </span>
                        </button>
                        <button
                            className="dash-icon-btn"
                            aria-label="Créer"
                            onClick={() => router.visit('/nouvelle-demande')}
                        >
                            <span className="material-symbols-outlined">
                                add
                            </span>
                        </button>
                        <button
                            className="dash-icon-btn"
                            aria-label="Documents"
                            onClick={() =>
                                addToast('Documents → bientôt', 'info')
                            }
                        >
                            <span className="material-symbols-outlined">
                                description
                            </span>
                        </button>
                        <button
                            className="dash-icon-btn has-dot"
                            aria-label="Notifications"
                            onClick={() =>
                                addToast('3 notifications non lues', 'info')
                            }
                        >
                            <span className="material-symbols-outlined">
                                notifications
                            </span>
                        </button>
                        <button
                            className="dash-icon-btn"
                            aria-label="Aide"
                            onClick={() =>
                                addToast('Centre d’aide → bientôt', 'info')
                            }
                        >
                            <span className="material-symbols-outlined">
                                help
                            </span>
                        </button>
                        <button
                            className="nd-user-pill"
                            aria-label="Profil"
                            onClick={() => setShowAccountMenu((v) => !v)}
                        >
                            <span className="nd-user-name">{user.name}</span>
                            <span className="nd-user-avatar">
                                <span className="material-symbols-outlined">
                                    person
                                </span>
                            </span>
                        </button>
                    </nav>
                    <button
                        className="dash-topbar-burger"
                        aria-label={showMobileMenu ? 'Fermer' : 'Menu'}
                        onClick={() => setShowMobileMenu((v) => !v)}
                    >
                        <span className="material-symbols-outlined">
                            {showMobileMenu ? 'close' : 'menu'}
                        </span>
                    </button>
                </header>
                <div className="dash-green-line" />
                <AccountMenu
                    isOpen={showAccountMenu}
                    onClose={() => setShowAccountMenu(false)}
                    user={user}
                />
                <MobileMenu
                    isOpen={showMobileMenu}
                    onClose={() => setShowMobileMenu(false)}
                    onLogout={handleLogout}
                    showToast={(
                        msg: string,
                        type?: 'success' | 'info' | 'error',
                    ) => addToast(msg, type)}
                />

                <div className="dash-bg" aria-hidden="true">
                    <div className="dash-bg-img" />
                    <div className="dash-bg-overlay" />
                </div>

                <main className="dash-main">
                    <section className={`hist-card ${a}`}>
                        <header className="hist-header">
                            {isSelectionMode ? (
                                <>
                                    <div>
                                        <h1 className="hist-title">
                                            MON HISTORIQUE{' '}
                                            <span className="hist-title-count">
                                                ({selectedIds.size} sélection
                                                {selectedIds.size !== 1
                                                    ? 's'
                                                    : ''}
                                                )
                                            </span>
                                        </h1>
                                        <p className="hist-subtitle">
                                            Vous êtes actuellement en mode
                                            Sélection. Sélectionnez toutes les
                                            demandes que vous souhaitez
                                            supprimer, puis cliquez sur le
                                            bouton Supprimer ci-dessous.
                                        </p>
                                    </div>
                                    <button
                                        className="hist-icon-btn hist-icon-close"
                                        aria-label="Quitter sélection"
                                        onClick={exitSelectionMode}
                                    >
                                        <span className="material-symbols-outlined">
                                            close
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <h1 className="hist-title">
                                            MON HISTORIQUE
                                        </h1>
                                        <p className="hist-subtitle">
                                            Consultez rapidement et accédez
                                            simplement à toutes vos demandes
                                            d’absences que vous avez soumises
                                            jusqu’à ce jour.
                                        </p>
                                    </div>
                                    <div className="hist-header-actions">
                                        <button
                                            className="hist-icon-btn"
                                            aria-label="Mode sélection"
                                            onClick={toggleSelectionMode}
                                        >
                                            <span className="material-symbols-outlined">
                                                checklist
                                            </span>
                                        </button>
                                        <button
                                            className="hist-icon-btn"
                                            aria-label="Rafraîchir"
                                            onClick={handleRefresh}
                                        >
                                            <span className="material-symbols-outlined">
                                                refresh
                                            </span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </header>

                        {isSelectionMode && (
                            <div className="hist-select-toolbar">
                                <div>
                                    <button
                                        className="hist-select-btn hist-select-delete"
                                        onClick={handleDeleteClick}
                                        disabled={selectedIds.size === 0}
                                    >
                                        <span className="material-symbols-outlined">
                                            delete
                                        </span>
                                    </button>
                                    <button
                                        className="hist-select-btn"
                                        onClick={selectAll}
                                        title="Tout sélectionner"
                                    >
                                        <span className="material-symbols-outlined">
                                            select_all
                                        </span>
                                    </button>
                                    <button
                                        className="hist-select-btn"
                                        onClick={deselectAll}
                                        title="Tout désélectionner"
                                    >
                                        <span className="material-symbols-outlined">
                                            deselect
                                        </span>
                                    </button>
                                    <button
                                        className="hist-select-btn"
                                        onClick={invertSelection}
                                        title="Inverser"
                                    >
                                        <span className="material-symbols-outlined">
                                            swap_horiz
                                        </span>
                                    </button>
                                </div>
                                <div className="hist-select-search">
                                    <div className="hist-search-wrap">
                                        <div className="hist-search-filter">
                                            <select
                                                value={scope}
                                                onChange={(e) =>
                                                    setScope(
                                                        e.target
                                                            .value as SearchScope,
                                                    )
                                                }
                                            >
                                                <option value="tout">
                                                    {scopeLabel.tout}
                                                </option>
                                                <option value="numero">
                                                    {scopeLabel.numero}
                                                </option>
                                                <option value="nature">
                                                    {scopeLabel.nature}
                                                </option>
                                                <option value="date">
                                                    {scopeLabel.date}
                                                </option>
                                                <option value="etat">
                                                    {scopeLabel.etat}
                                                </option>
                                            </select>
                                            <span className="material-symbols-outlined">
                                                keyboard_arrow_down
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Rechercher..."
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                        />
                                        <button className="hist-search-btn">
                                            <span className="material-symbols-outlined">
                                                search
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isSelectionMode && (
                            <div className="hist-search-wrap">
                                <div className="hist-search-filter">
                                    <select
                                        value={scope}
                                        onChange={(e) =>
                                            setScope(
                                                e.target.value as SearchScope,
                                            )
                                        }
                                    >
                                        <option value="tout">
                                            {scopeLabel.tout}
                                        </option>
                                        <option value="numero">
                                            {scopeLabel.numero}
                                        </option>
                                        <option value="nature">
                                            {scopeLabel.nature}
                                        </option>
                                        <option value="date">
                                            {scopeLabel.date}
                                        </option>
                                        <option value="etat">
                                            {scopeLabel.etat}
                                        </option>
                                    </select>
                                    <span className="material-symbols-outlined">
                                        keyboard_arrow_down
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button className="hist-search-btn">
                                    <span className="material-symbols-outlined">
                                        search
                                    </span>
                                </button>
                            </div>
                        )}

                        <div className="hist-table-wrap">
                            <table className="hist-table">
                                <thead>
                                    <tr>
                                        <th>N°</th>
                                        <th>Nature absence</th>
                                        <th>Date soumission</th>
                                        <th>État</th>
                                        <th className="hist-th-icon"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="hist-empty"
                                            >
                                                Chargement des demandes…
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="hist-empty"
                                            >
                                                Aucune demande correspondante.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((d) => {
                                            const { main, sub } =
                                                formatDateSoumission(
                                                    d.created_at,
                                                );
                                            const isSelected = selectedIds.has(
                                                d.id,
                                            );
                                            const rowStatut =
                                                d.status === 'pending'
                                                    ? 'row-attente'
                                                    : d.status === 'approved'
                                                      ? 'row-ok'
                                                      : 'row-ko';
                                            const rowClass = isSelectionMode
                                                ? isSelected
                                                    ? 'selected'
                                                    : ''
                                                : rowStatut;
                                            const etatClass =
                                                d.status === 'pending'
                                                    ? 'statut-attente'
                                                    : d.status === 'approved'
                                                      ? 'statut-ok'
                                                      : 'statut-ko';
                                            const iconAttenteClass =
                                                isSelectionMode
                                                    ? isSelected
                                                        ? 'icon-selected'
                                                        : 'icon-neutral'
                                                    : 'icon-attente';
                                            const iconOkClass = isSelectionMode
                                                ? isSelected
                                                    ? 'icon-selected'
                                                    : 'icon-neutral'
                                                : 'icon-ok';
                                            const iconKoClass = isSelectionMode
                                                ? isSelected
                                                    ? 'icon-selected'
                                                    : 'icon-neutral'
                                                : 'icon-ko';
                                            return (
                                                <tr
                                                    key={d.id}
                                                    className={`${rowClass} ${
                                                        isSelectionMode
                                                            ? 'selectable'
                                                            : ''
                                                    }`}
                                                    onClick={() =>
                                                        handleRowClick(d)
                                                    }
                                                >
                                                    <td className="hist-td-num">
                                                        <span className="hist-num-wrap">
                                                            {isSelectionMode && (
                                                                <span
                                                                    className={`hist-check ${
                                                                        isSelected
                                                                            ? 'checked'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <span className="material-symbols-outlined">
                                                                        {isSelected
                                                                            ? 'check'
                                                                            : 'circle'}
                                                                    </span>
                                                                </span>
                                                            )}
                                                            <span>{d.id}</span>
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`hist-td-nature ${
                                                            isSelected
                                                                ? 'blue'
                                                                : ''
                                                        }`}
                                                    >
                                                        {d.absenceType?.label ??
                                                            'Type inconnu'}
                                                    </td>
                                                    <td className="hist-td-date">
                                                        <span
                                                            className={`hist-date-main ${
                                                                isSelected &&
                                                                isSelectionMode
                                                                    ? 'blue'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {main}
                                                        </span>
                                                        <span className="hist-date-sub">
                                                            {sub}
                                                        </span>
                                                    </td>
                                                    <td
                                                        className={`hist-td-etat ${etatClass}`}
                                                    >
                                                        {statusLabel(d.status)}
                                                    </td>
                                                    <td className="hist-td-icon">
                                                        {d.status ===
                                                            'pending' && (
                                                            <span
                                                                className={`material-symbols-outlined ${iconAttenteClass}`}
                                                            >
                                                                schedule
                                                            </span>
                                                        )}
                                                        {d.status ===
                                                            'approved' && (
                                                            <span
                                                                className={`material-symbols-outlined ${iconOkClass}`}
                                                            >
                                                                check_circle
                                                            </span>
                                                        )}
                                                        {d.status ===
                                                            'cancelled' && (
                                                            <span
                                                                className={`material-symbols-outlined ${iconKoClass}`}
                                                            >
                                                                cancel
                                                            </span>
                                                        )}
                                                        {d.status ===
                                                            'draft' && (
                                                            <span
                                                                className={`material-symbols-outlined ${iconKoClass}`}
                                                            >
                                                                draft
                                                            </span>
                                                        )}
                                                        {d.status ===
                                                            'pending' && (
                                                            <button
                                                                className="hist-cancel-link"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    void handleCancel(
                                                                        d.id,
                                                                    );
                                                                }}
                                                            >
                                                                Annuler
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                {showDeleteDialog && (
                    <div
                        className="avert-overlay"
                        onClick={() => setShowDeleteDialog(false)}
                    >
                        <div
                            className="avert-dialog"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <header className="avert-header">
                                <h2>AVERTISSEMENT</h2>
                                <span className="material-symbols-outlined">
                                    warning
                                </span>
                            </header>
                            <div className="avert-body">
                                <p>
                                    Si vous confirmez cette action, les demandes
                                    sélectionnées seront définitivement retirées
                                    de votre historique. Veuillez noter que
                                    cette action est irréversible.
                                </p>
                                <p className="avert-ask">
                                    Voulez-vous vraiment supprimer ces demandes
                                    de votre historique ?
                                </p>
                            </div>
                            <footer className="avert-footer">
                                <button
                                    className="avert-btn avert-btn-danger"
                                    onClick={confirmDelete}
                                >
                                    <span className="material-symbols-outlined">
                                        delete
                                    </span>
                                    SUPPRIMER
                                </button>
                                <button
                                    className="avert-btn avert-btn-cancel"
                                    onClick={() => setShowDeleteDialog(false)}
                                >
                                    <span className="material-symbols-outlined">
                                        undo
                                    </span>
                                    REVENIR
                                </button>
                            </footer>
                        </div>
                    </div>
                )}

                <LogoutDialog
                    isOpen={showLogoutDialog}
                    onClose={() => setShowLogoutDialog(false)}
                />

                <button
                    className="dash-fab"
                    aria-label="Signaler"
                    onClick={() =>
                        addToast('Signalement → admin notifié', 'success')
                    }
                >
                    <span className="material-symbols-outlined">flag</span>
                </button>
            </div>
        </>
    );
}
