import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
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

const STATUS_LABELS: Record<string, string> = {
    draft: 'Brouillon',
    pending: 'En attente',
    approved: 'Approuvée',
    cancelled: 'Annulée',
};

const STATUS_ICONS: Record<string, string> = {
    draft: 'draft',
    pending: 'schedule',
    approved: 'check_circle',
    cancelled: 'cancel',
};

function formatDateLong(iso?: string): string {
    if (!iso) return 'XX/XX/XXXX';
    const d = new Date(iso + (iso.includes('T') ? '' : 'T12:00:00'));
    return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatPeriodeQuart(
    periode?: string | null,
    quart?: string | null,
): string {
    if (quart) {
        const map: Record<string, string> = {
            matin: 'Matin',
            'apres-midi': 'Après-midi',
            nuit: 'Nuit',
        };
        return map[quart] ?? quart;
    }
    if (periode) {
        return periode === 'matin'
            ? 'Matin'
            : periode === 'soir'
              ? 'Soir'
              : periode;
    }
    return 'Période/Quart';
}

function formatEmission(iso?: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const date = d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const time = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    return `${date} - ${time}`;
}

function getOperator(digits: string): string | null {
    if (!digits) return null;
    const d = digits.replace(/\D/g, '');
    if (d.length !== 9) return null;
    if (d.startsWith('2')) {
        const pref3 = d.slice(0, 3);
        if (['222', '233', '242', '243'].includes(pref3)) return 'camtel';
        return null;
    }
    if (!d.startsWith('6')) return null;
    const pref3 = d.slice(0, 3);
    const n = parseInt(pref3, 10);
    if (
        (n >= 655 && n <= 659) ||
        (n >= 685 && n <= 689) ||
        (n >= 690 && n <= 699)
    )
        return 'orange';
    if (
        (n >= 650 && n <= 654) ||
        (n >= 670 && n <= 679) ||
        (n >= 680 && n <= 684)
    )
        return 'mtn';
    if (n >= 620 && n <= 629) return 'blue';
    if (n >= 660 && n <= 669) return 'nexttel';
    return null;
}

function formatPhone(digits: string): string {
    const d = digits.replace(/\D/g, '').slice(0, 9);
    if (!d) return '';
    let out = d[0];
    for (let i = 1; i < d.length; i += 2) out += ' ' + d.slice(i, i + 2);
    return out.trim();
}

const operatorLogo: Record<string, string> = {
    orange: '/assets/orange.png',
    mtn: '/assets/mtn.png',
    camtel: '/assets/camtel.png',
    blue: '/assets/blue.png',
    nexttel: '/assets/nexttel.png',
};

export default function DemandeDetail({
    user,
    absenceRequest,
}: { user: User } & { absenceRequest: AbsenceRequest }) {
    const { addToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setMounted(true), 50);
        return () => window.clearTimeout(t);
    }, []);

    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const iv = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(iv);
    }, []);

    const handleCancelConfirm = async (): Promise<void> => {
        setCancelling(true);
        try {
            const response = await fetch(
                `/api/absence-requests/${absenceRequest.id}/cancel`,
                {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                },
            );
            if (!response.ok) {
                addToast('Erreur lors de l’annulation de la demande.', 'error');
                setCancelling(false);
                return;
            }
            setShowCancelDialog(false);
            addToast('Demande annulée.', 'success');
            router.visit('/historique');
        } catch {
            addToast('Erreur lors de l’annulation de la demande.', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const handleLogout = (): void => {
        setShowLogoutDialog(true);
    };

    const displayName = user.name;

    const a = mounted ? 'animated' : '';
    const isEnAttente = absenceRequest.status === 'pending';
    const dateDebutStr = absenceRequest.start_date
        ? `${formatDateLong(absenceRequest.start_date)} - ${formatPeriodeQuart(absenceRequest.start_time_slot, null)}`
        : 'XX/XX/XXXX - [Période/Quart]';
    const dateFinStr = absenceRequest.end_date
        ? `${formatDateLong(absenceRequest.end_date)} - ${formatPeriodeQuart(null, absenceRequest.end_time_slot)}`
        : 'XX/XX/XXXX - [Période/Quart]';
    const emissionStr = formatEmission(absenceRequest.created_at);
    const natureStr =
        absenceRequest.absenceType?.label ?? '[Nature sélectionnée]';
    const motifStr =
        absenceRequest.reason ??
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...';

    const statusLabel =
        STATUS_LABELS[absenceRequest.status] ?? absenceRequest.status;
    const statusIcon = STATUS_ICONS[absenceRequest.status] ?? 'help';
    const statutClass =
        absenceRequest.status === 'pending'
            ? 'statut-attente'
            : absenceRequest.status === 'approved'
              ? 'statut-ok'
              : 'statut-ko';

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

    return (
        <>
            <Head title={`Demande #${absenceRequest.id}`} />
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
                            <span className="nd-user-name">{displayName}</span>
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
                    <section className={`detail-card ${a}`}>
                        <div className="detail-topbar">
                            <button
                                className="detail-back"
                                onClick={() => router.visit('/historique')}
                            >
                                <span className="material-symbols-outlined">
                                    arrow_back
                                </span>
                                Retour vers l’historique
                            </button>
                            <span
                                className={`detail-statut-pill ${statutClass}`}
                            >
                                <span className="material-symbols-outlined">
                                    {statusIcon}
                                </span>
                                Statut actuel : {statusLabel}
                            </span>
                        </div>

                        <div className="detail-grid">
                            <div className="detail-col">
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Nature de l’absence sollicitée
                                    </label>
                                    <div className="detail-input">
                                        <span>{natureStr}</span>
                                        <span className="detail-input-icon">
                                            <span className="material-symbols-outlined">
                                                category
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Motif de l’absence sollicitée
                                    </label>
                                    <div className="detail-textarea">
                                        <span>{motifStr}</span>
                                        <span className="detail-input-icon">
                                            <span className="material-symbols-outlined">
                                                subject
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Mes contacts durant l’absence sollicitée
                                    </label>
                                    <div className="detail-contacts-list">
                                        {[
                                            {
                                                digits:
                                                    absenceRequest.contact_phone ??
                                                    '',
                                                operator:
                                                    absenceRequest.contact_phone
                                                        ? getOperator(
                                                              absenceRequest.contact_phone,
                                                          )
                                                        : null,
                                            },
                                        ].map((p, idx) => {
                                            const op =
                                                p.operator ??
                                                getOperator(p.digits);
                                            const display = p.digits
                                                ? `(+237) ${formatPhone(p.digits)}`
                                                : '(+237) 6 XX XX XX XX';
                                            return (
                                                <div
                                                    key={idx}
                                                    className="detail-input"
                                                >
                                                    <span>{display}</span>
                                                    <span
                                                        className={`detail-input-icon ${
                                                            op ? 'has-logo' : ''
                                                        }`}
                                                    >
                                                        {op ? (
                                                            <img
                                                                src={
                                                                    operatorLogo[
                                                                        op
                                                                    ]
                                                                }
                                                                alt={op}
                                                                className="detail-op-logo"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined">
                                                                public
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="detail-col">
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Date de début de l’absence sollicitée
                                    </label>
                                    <div className="detail-input">
                                        <span>{dateDebutStr}</span>
                                        <span className="detail-input-icon">
                                            <span className="material-symbols-outlined">
                                                calendar_month
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Date de fin prévue de l’absence
                                        sollicitée
                                    </label>
                                    <div className="detail-input">
                                        <span>{dateFinStr}</span>
                                        <span className="detail-input-icon">
                                            <span className="material-symbols-outlined">
                                                calendar_month
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="detail-field">
                                    <label className="detail-field-label">
                                        Date d’émission de l’absence sollicitée
                                    </label>
                                    <div className="detail-input">
                                        <span>{emissionStr}</span>
                                        <span className="detail-input-icon">
                                            <span className="material-symbols-outlined">
                                                send
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                {isEnAttente && (
                                    <button
                                        className="detail-cancel"
                                        onClick={() =>
                                            setShowCancelDialog(true)
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            block
                                        </span>
                                        Annuler ma demande
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                {showCancelDialog && (
                    <div
                        className="avert-overlay"
                        onClick={() => setShowCancelDialog(false)}
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
                                    Si vous confirmez cette action, cette
                                    demande sera définitivement annulée et
                                    supprimée.
                                </p>
                                <p>
                                    Au cas où il s’agirait d’une erreur, vous
                                    devrez reprendre le processus à zéro et
                                    soumettre une nouvelle demande d’absence.
                                </p>
                                <p className="avert-ask">
                                    Voulez-vous vraiment annuler cette demande ?
                                </p>
                            </div>
                            <footer className="avert-footer">
                                <button
                                    className="avert-btn avert-btn-danger"
                                    onClick={handleCancelConfirm}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <span className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-xs">
                                                hourglass_empty
                                            </span>
                                            En cours…
                                        </span>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-xs">
                                                check
                                            </span>
                                            CONFIRMER
                                        </>
                                    )}
                                </button>
                                <button
                                    className="avert-btn avert-btn-cancel"
                                    onClick={() => setShowCancelDialog(false)}
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
