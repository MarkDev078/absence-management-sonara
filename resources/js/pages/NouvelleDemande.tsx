import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import ToastContainer from '../components/ToastContainer';
import MobileMenu from '../components/MobileMenu';
import AccountMenu from '../components/AccountMenu';
import LogoutDialog from '../components/LogoutDialog';
import { useToast } from '../components/useToast';
import type { User } from '../types/auth';

type PhoneEntry = {
    id: string;
    digits: string;
    operator: string | null;
};

type PeriodVal = 'matin' | 'soir' | null;
type QuartVal = 'matin' | 'apres-midi' | 'nuit' | null;

type AbsenceType = {
    id: number;
    label: string;
};

const categoriesConfig = [
    {
        label: 'Congé',
        natures: [
            'Congé annuel',
            'Congé maladie',
            'Congé paternité/maternité',
            'Reliquat congé',
        ],
    },
    {
        label: 'Absence autorisée',
        natures: [
            'Absence autorisée payée',
            'Absence autorisée non payée',
            'Absence autorisée',
        ],
    },
    {
        label: 'Autre',
        natures: ['Permission exceptionnelle', 'Formation', 'Autre'],
    },
];

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
    for (let i = 1; i < d.length; i += 2) {
        out += ' ' + d.slice(i, i + 2);
    }
    return out.trim();
}

const operatorLogo: Record<string, string> = {
    orange: '/assets/orange.png',
    mtn: '/assets/mtn.png',
    camtel: '/assets/camtel.png',
    blue: '/assets/blue.png',
    nexttel: '/assets/nexttel.png',
};

const getTodayISO = (): string => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

const getTomorrowISO = (): string => {
    const now = new Date();
    now.setDate(now.getDate() + 1);
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
};

export default function NouvelleDemande({ user }: { user: User }) {
    const { addToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [loadingTypes, setLoadingTypes] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [categorie, setCategorie] = useState<string>('');
    const [nature, setNature] = useState<string>('');
    const [motif, setMotif] = useState<string>('');
    const [dateDebut, setDateDebut] = useState<string>(() => getTodayISO());
    const [dateFin, setDateFin] = useState<string>(() => getTomorrowISO());
    const [periodeDebut, setPeriodeDebut] = useState<PeriodVal>('matin');
    const [quartDebut, setQuartDebut] = useState<QuartVal>(null);
    const [periodeFin, setPeriodeFin] = useState<PeriodVal>('matin');
    const [quartFin, setQuartFin] = useState<QuartVal>(null);

    const [phones, setPhones] = useState<PhoneEntry[]>(() => [
        { id: 'p1', digits: '', operator: null },
    ]);
    const [showNotif, setShowNotif] = useState(false);
    const [now, setNow] = useState(() => new Date());
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [tempPhones, setTempPhones] = useState<PhoneEntry[]>([]);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    useEffect(() => {
        const iv = window.setInterval(() => setNow(new Date()), 60_000);
        return () => window.clearInterval(iv);
    }, []);

    useEffect(() => {
        const t = window.setTimeout(() => setMounted(true), 50);
        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        void fetchAbsenceTypes();
    }, []);

    const fetchAbsenceTypes = async (): Promise<void> => {
        try {
            const response = await fetch('/api/absence-types', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
            });
            const data = await response.json();
            const types: AbsenceType[] = Array.isArray(data)
                ? data
                : (data.data ?? []);
            setAbsenceTypes(types);
        } catch (error) {
            console.error(
                'Erreur lors du chargement des types d’absence:',
                error,
            );
            addToast('Erreur lors du chargement des types d’absence', 'error');
        } finally {
            setLoadingTypes(false);
        }
    };

    const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    const dateStr = now.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
    const shortDate = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const handleCategoryChange = (val: string): void => {
        setCategorie(val);
        if (val) {
            if (!absenceTypes.some((t) => t.label === nature)) setNature('');
        } else {
            setNature('');
        }
    };

    const availableNatures = absenceTypes.map((t) => t.label);

    const updatePhone = (id: string, raw: string): void => {
        const digits = raw.replace(/\D/g, '').slice(0, 9);
        const op = getOperator(digits);
        setPhones((prev) =>
            prev.map((p) => (p.id === id ? { ...p, digits, operator: op } : p)),
        );
    };

    const addPhone = (): void => {
        const id = 'p' + Date.now();
        setPhones((prev) => [...prev, { id, digits: '', operator: null }]);
    };

    const removePhone = (id: string): void => {
        if (phones.length <= 1) return;
        setPhones((prev) => prev.filter((p) => p.id !== id));
    };

    const openPhoneModal = (): void => {
        setTempPhones(phones.map((p) => ({ ...p })));
        setShowPhoneModal(true);
    };

    const closePhoneModal = (): void => setShowPhoneModal(false);

    const savePhoneModal = (): void => {
        setPhones(tempPhones.map((p) => ({ ...p })));
        setShowPhoneModal(false);
        addToast('Numéros enregistrés', 'success');
    };

    const updateTempPhone = (id: string, raw: string): void => {
        const digits = raw.replace(/\D/g, '').slice(0, 9);
        const op = getOperator(digits);
        setTempPhones((prev) =>
            prev.map((p) => (p.id === id ? { ...p, digits, operator: op } : p)),
        );
    };

    const addTempPhone = (): void => {
        const id = 'p' + Date.now();
        setTempPhones((prev) => [...prev, { id, digits: '', operator: null }]);
    };

    const removeTempPhone = (id: string): void => {
        if (tempPhones.length <= 1) return;
        setTempPhones((prev) => prev.filter((p) => p.id !== id));
    };

    const selectPeriodeDebut = (v: PeriodVal): void => {
        setPeriodeDebut(v);
        if (v) setQuartDebut(null);
    };

    const selectQuartDebut = (v: QuartVal): void => {
        setQuartDebut(v);
        if (v) setPeriodeDebut(null);
    };

    const selectPeriodeFin = (v: PeriodVal): void => {
        setPeriodeFin(v);
        if (v) setQuartFin(null);
    };

    const selectQuartFin = (v: QuartVal): void => {
        setQuartFin(v);
        if (v) setPeriodeFin(null);
    };

    const formatDateFR = (iso: string): string => {
        if (!iso) return '';
        const d = new Date(iso + 'T12:00:00');
        return d.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const getNextDay = (iso: string): string => {
        if (!iso) return '';
        const d = new Date(iso + 'T12:00:00');
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
    };

    useEffect(() => {
        if (dateDebut && dateFin && dateFin <= dateDebut) {
            const nxt = getNextDay(dateDebut);
            if (nxt !== dateFin) setDateFin(nxt);
        }
    }, [dateDebut, dateFin]);

    const validate = (): boolean => {
        if (!categorie) {
            addToast('Veuillez sélectionner une catégorie.', 'error');
            return false;
        }
        if (!nature) {
            addToast('Veuillez sélectionner la nature de l’absence.', 'error');
            return false;
        }
        if (!motif.trim()) {
            addToast('Veuillez préciser le motif de l’absence.', 'error');
            return false;
        }
        if (!dateDebut) {
            addToast('Date de début obligatoire.', 'error');
            return false;
        }
        if (!dateFin) {
            addToast('Date de reprise obligatoire.', 'error');
            return false;
        }
        for (const p of phones) {
            if (p.digits) {
                if (p.digits.length !== 9) {
                    addToast(
                        'Chaque numéro doit contenir 9 chiffres.',
                        'error',
                    );
                    return false;
                }
                if (!p.digits.startsWith('6') && !p.digits.startsWith('2')) {
                    addToast(
                        'Numéro doit commencer par 6 (ou 2 pour Camtel).',
                        'error',
                    );
                    return false;
                }
            }
        }
        if (dateDebut && dateFin && dateFin <= dateDebut) {
            addToast(
                'La date de reprise doit être strictement supérieure à la date de début.',
                'error',
            );
            return false;
        }
        return true;
    };

    const handleDraft = (): void => {
        addToast('Brouillon enregistré.', 'success');
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validate()) return;

        let mappedStart = '';
        if (periodeDebut === 'matin') mappedStart = 'matin-P';
        else if (periodeDebut === 'soir') mappedStart = 'soir-P';
        else if (quartDebut === 'matin') mappedStart = 'matin-Q';
        else if (quartDebut === 'apres-midi') mappedStart = 'apres-midi-Q';
        else if (quartDebut === 'nuit') mappedStart = 'nuit-Q';

        let mappedEnd = '';
        if (periodeFin === 'matin') mappedEnd = 'matin-P';
        else if (periodeFin === 'soir') mappedEnd = 'soir-P';
        else if (quartFin === 'matin') mappedEnd = 'matin-Q';
        else if (quartFin === 'apres-midi') mappedEnd = 'apres-midi-Q';
        else if (quartFin === 'nuit') mappedEnd = 'nuit-Q';

        const primaryPhone = phones.find((p) => p.digits)?.digits || '';
        const selectedTypeId =
            absenceTypes.find((t) => t.label === nature)?.id ?? '';

        const payload = {
            absence_type_id: String(selectedTypeId),
            start_date: dateDebut,
            start_time_slot: mappedStart,
            end_date: dateFin,
            end_time_slot: mappedEnd,
            reason: motif,
            contact_phone: primaryPhone,
        };

        setSubmitting(true);
        try {
            const response = await fetch('/api/absence-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                addToast(
                    errData.message ||
                        'Erreur lors de la création de la demande.',
                    'error',
                );
                return;
            }

            const newRequest = await response.json();
            addToast('Demande soumise avec succès.', 'success');
            router.visit(`/absence-requests/${newRequest.id}`);
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
            addToast('Erreur lors de la création de la demande.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = (): void => {
        setShowLogoutDialog(true);
    };

    const displayName = user.name;

    const a = mounted ? 'animated' : '';
    const phoneSummary = phones.some((p) => p.digits)
        ? `${phones.filter((p) => p.digits).length} numéro${
              phones.filter((p) => p.digits).length > 1 ? 's' : ''
          } enregistré${phones.filter((p) => p.digits).length > 1 ? 's' : ''}`
        : '';

    return (
        <>
            <Head title="Nouvelle demande d’absence" />
            <ToastContainer />

            <div className="nd-root">
                <header className={`dash-topbar ${a}`}>
                    <div className="dash-topbar-left">
                        <button
                            className="nd-back-btn"
                            aria-label="Retour"
                            onClick={() => router.visit('/dashboard')}
                        >
                            <span className="material-symbols-outlined">
                                arrow_back
                            </span>
                        </button>
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
                            className="dash-icon-btn"
                            aria-label="Historique"
                            onClick={() => router.visit('/historique')}
                        >
                            <span className="material-symbols-outlined">
                                history
                            </span>
                        </button>
                        <button
                            className="dash-icon-btn has-dot"
                            aria-label="Notifications"
                            onClick={() => setShowNotif((v) => !v)}
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

                <div className="nd-bg" aria-hidden="true">
                    <div className="nd-bg-img" />
                    <div className="nd-bg-overlay" />
                </div>

                <main className="nd-main">
                    <button
                        className={`nd-retour-pill ${a}`}
                        onClick={() => router.visit('/dashboard')}
                    >
                        <span className="material-symbols-outlined">
                            arrow_back
                        </span>
                        Retour
                    </button>
                    <section className={`nd-left ${a}`}>
                        <h1 className="nd-title">
                            <span>NOUVELLE</span>
                            <span>DEMANDE</span>
                            <span>D’ABSENCE</span>
                        </h1>
                        <p className="nd-desc">
                            Vous souhaitez vous absenter de la{' '}
                            <strong>SO.NA.RA.</strong> ?<br />
                            Dans ce cas, veuillez remplir et soumettre ce
                            formulaire, en prenant soin de mentionner{' '}
                            <strong>le motif de votre requête</strong>.
                        </p>
                    </section>

                    <section className={`nd-card ${a}`}>
                        <div className="nd-card-grid">
                            <div className="nd-col nd-col-left">
                                <div className="nd-field">
                                    <label className="nd-label">
                                        Quelle sont la catégorie et la nature de
                                        votre prochaine absence ?
                                        <span className="nd-req">*</span>
                                    </label>
                                    <div className="nd-select-wrap">
                                        <select
                                            className="nd-select"
                                            value={categorie}
                                            onChange={(e) =>
                                                handleCategoryChange(
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                Sélectionner une catégorie
                                            </option>
                                            {categoriesConfig.map((c) => (
                                                <option
                                                    key={c.label}
                                                    value={c.label}
                                                >
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined nd-select-arrow">
                                            keyboard_arrow_down
                                        </span>
                                    </div>
                                </div>
                                <div className="nd-field">
                                    <div className="nd-select-wrap">
                                        <select
                                            className="nd-select"
                                            value={nature}
                                            onChange={(e) =>
                                                setNature(e.target.value)
                                            }
                                            disabled={
                                                !categorie || loadingTypes
                                            }
                                        >
                                            <option value="" disabled>
                                                Sélectionner une nature
                                            </option>
                                            {availableNatures.map((n) => (
                                                <option key={n} value={n}>
                                                    {n}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="material-symbols-outlined nd-select-arrow">
                                            keyboard_arrow_down
                                        </span>
                                    </div>
                                    {!categorie && (
                                        <p
                                            className="nd-hint"
                                            style={{ marginTop: 6 }}
                                        >
                                            Sélectionnez d’abord une catégorie
                                            pour voir les natures disponibles.
                                        </p>
                                    )}
                                </div>

                                <div className="nd-field">
                                    <label className="nd-label">
                                        Veuillez préciser le motif de l’absence
                                        que vous voudriez solliciter :
                                        <span className="nd-req">*</span>
                                    </label>
                                    <textarea
                                        className="nd-textarea"
                                        placeholder="Je sollicite cette absence..."
                                        value={motif}
                                        onChange={(e) =>
                                            setMotif(e.target.value)
                                        }
                                        rows={5}
                                    />
                                </div>

                                <div className="nd-field nd-phones-desktop">
                                    <label className="nd-label">
                                        Par quels contacts serez-vous joignable
                                        durant votre prochaine absence ?
                                    </label>
                                    <div className="nd-phones">
                                        {phones.map((p) => (
                                            <div
                                                key={p.id}
                                                className="nd-phone-row"
                                            >
                                                <div className="nd-phone-input-wrap">
                                                    <span className="nd-phone-prefix">
                                                        (+237)
                                                    </span>
                                                    <input
                                                        className="nd-phone-input"
                                                        type="text"
                                                        inputMode="numeric"
                                                        placeholder="6 XX XX XX XX"
                                                        value={formatPhone(
                                                            p.digits,
                                                        )}
                                                        onChange={(e) =>
                                                            updatePhone(
                                                                p.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <div
                                                        className={`nd-phone-operator ${
                                                            p.operator
                                                                ? 'has-op'
                                                                : ''
                                                        }`}
                                                    >
                                                        {p.operator ? (
                                                            <img
                                                                src={
                                                                    operatorLogo[
                                                                        p
                                                                            .operator
                                                                    ]
                                                                }
                                                                alt={p.operator}
                                                                className="nd-op-logo fill"
                                                            />
                                                        ) : (
                                                            <span className="material-symbols-outlined">
                                                                public
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                {phones.length > 1 && (
                                                    <button
                                                        className="nd-phone-remove"
                                                        onClick={() =>
                                                            removePhone(p.id)
                                                        }
                                                        aria-label="Supprimer"
                                                    >
                                                        <span className="material-symbols-outlined text-xs">
                                                            close
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <button
                                            className="nd-add-phone"
                                            onClick={addPhone}
                                        >
                                            <span className="material-symbols-outlined">
                                                add_circle
                                            </span>
                                            Ajouter un numéro
                                        </button>
                                        {phones.some(
                                            (p) =>
                                                p.digits &&
                                                p.digits.length !== 9,
                                        ) && (
                                            <p className="nd-hint">
                                                Chaque numéro doit contenir
                                                exactement 9 chiffres et
                                                commencer par 6 (ou 2 pour
                                                Camtel).
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="nd-field nd-phones-mobile">
                                    <label className="nd-label">
                                        Par quels contacts serez-vous joignable
                                        durant votre prochaine absence ?
                                    </label>
                                    <button
                                        className="nd-modifier-btn"
                                        onClick={openPhoneModal}
                                    >
                                        <span className="material-symbols-outlined">
                                            perm_contact_calendar
                                        </span>
                                        Modifier les numéros
                                    </button>
                                    {phoneSummary && (
                                        <p className="nd-phone-summary">
                                            {phoneSummary}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="nd-col nd-col-right">
                                <div className="nd-field">
                                    <label className="nd-label">
                                        Quand devra débuter votre prochaine
                                        absence ?
                                        <span className="nd-req">*</span>
                                    </label>
                                    <div className="nd-date-wrap">
                                        <input
                                            className="nd-date-display"
                                            type="text"
                                            readOnly
                                            value={formatDateFR(dateDebut)}
                                            placeholder="Sélectionner une date"
                                        />
                                        <input
                                            className="nd-date-native"
                                            type="date"
                                            value={dateDebut}
                                            min={getTodayISO()}
                                            onChange={(e) =>
                                                setDateDebut(e.target.value)
                                            }
                                            aria-label="Date début"
                                        />
                                        <span className="material-symbols-outlined nd-date-icon">
                                            calendar_month
                                        </span>
                                    </div>
                                </div>

                                <div className="nd-field">
                                    <div className="nd-row-line">
                                        <span className="nd-row-label">
                                            Période :
                                        </span>
                                        <div className="nd-chips">
                                            <button
                                                className={`nd-chip ${
                                                    periodeDebut === 'matin'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectPeriodeDebut(
                                                        periodeDebut === 'matin'
                                                            ? null
                                                            : 'matin',
                                                    )
                                                }
                                            >
                                                Matin{' '}
                                                <span className="material-symbols-outlined">
                                                    light_mode
                                                </span>
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    periodeDebut === 'soir'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectPeriodeDebut(
                                                        periodeDebut === 'soir'
                                                            ? null
                                                            : 'soir',
                                                    )
                                                }
                                            >
                                                Soir{' '}
                                                <span className="material-symbols-outlined">
                                                    dark_mode
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="nd-or">ou</div>
                                    <div className="nd-row-line">
                                        <span className="nd-row-label">
                                            Quart :
                                        </span>
                                        <div className="nd-chips">
                                            <button
                                                className={`nd-chip ${
                                                    quartDebut === 'matin'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartDebut(
                                                        quartDebut === 'matin'
                                                            ? null
                                                            : 'matin',
                                                    )
                                                }
                                            >
                                                Matin
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    quartDebut === 'apres-midi'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartDebut(
                                                        quartDebut ===
                                                            'apres-midi'
                                                            ? null
                                                            : 'apres-midi',
                                                    )
                                                }
                                            >
                                                Après-midi
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    quartDebut === 'nuit'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartDebut(
                                                        quartDebut === 'nuit'
                                                            ? null
                                                            : 'nuit',
                                                    )
                                                }
                                            >
                                                Nuit
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="nd-field">
                                    <label className="nd-label">
                                        Quand comptez-vous reprendre du service
                                        ?<span className="nd-req">*</span>
                                    </label>
                                    <div className="nd-date-wrap">
                                        <input
                                            className="nd-date-display"
                                            type="text"
                                            readOnly
                                            value={formatDateFR(dateFin)}
                                            placeholder="Sélectionner une date"
                                        />
                                        <input
                                            className="nd-date-native"
                                            type="date"
                                            value={dateFin}
                                            min={getNextDay(dateDebut)}
                                            onChange={(e) =>
                                                setDateFin(e.target.value)
                                            }
                                            aria-label="Date fin"
                                        />
                                        <span className="material-symbols-outlined nd-date-icon">
                                            calendar_month
                                        </span>
                                    </div>
                                    {dateDebut &&
                                        dateFin &&
                                        dateFin <= dateDebut && (
                                            <p className="nd-date-error">
                                                La date de reprise doit être
                                                strictement supérieure à la date
                                                de début.
                                            </p>
                                        )}
                                </div>

                                <div className="nd-field">
                                    <div className="nd-row-line">
                                        <span className="nd-row-label">
                                            Période :
                                        </span>
                                        <div className="nd-chips">
                                            <button
                                                className={`nd-chip ${
                                                    periodeFin === 'matin'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectPeriodeFin(
                                                        periodeFin === 'matin'
                                                            ? null
                                                            : 'matin',
                                                    )
                                                }
                                            >
                                                Matin{' '}
                                                <span className="material-symbols-outlined">
                                                    light_mode
                                                </span>
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    periodeFin === 'soir'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectPeriodeFin(
                                                        periodeFin === 'soir'
                                                            ? null
                                                            : 'soir',
                                                    )
                                                }
                                            >
                                                Soir{' '}
                                                <span className="material-symbols-outlined">
                                                    dark_mode
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="nd-or">ou</div>
                                    <div className="nd-row-line">
                                        <span className="nd-row-label">
                                            Quart :
                                        </span>
                                        <div className="nd-chips">
                                            <button
                                                className={`nd-chip ${
                                                    quartFin === 'matin'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartFin(
                                                        quartFin === 'matin'
                                                            ? null
                                                            : 'matin',
                                                    )
                                                }
                                            >
                                                Matin
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    quartFin === 'apres-midi'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartFin(
                                                        quartFin ===
                                                            'apres-midi'
                                                            ? null
                                                            : 'apres-midi',
                                                    )
                                                }
                                            >
                                                Après-midi
                                            </button>
                                            <button
                                                className={`nd-chip ${
                                                    quartFin === 'nuit'
                                                        ? 'active green'
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    selectQuartFin(
                                                        quartFin === 'nuit'
                                                            ? null
                                                            : 'nuit',
                                                    )
                                                }
                                            >
                                                Nuit
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="nd-field nd-bottom">
                                    <p className="nd-bottom-text">
                                        Si vous avez terminé, veuillez soumettre
                                        votre demande. Sinon, vous pouvez
                                        l’enregistrer pour plus tard.
                                    </p>
                                    <div className="nd-actions">
                                        <button
                                            className="nd-btn nd-btn-draft"
                                            onClick={handleDraft}
                                            disabled={submitting}
                                        >
                                            <span className="material-symbols-outlined">
                                                description
                                            </span>
                                            Enreg. brouillon
                                        </button>
                                        <button
                                            className="nd-btn nd-btn-submit"
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                        >
                                            <span className="material-symbols-outlined">
                                                send
                                            </span>
                                            Soumettre
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <div className="nd-fabs">
                    <button
                        className="nd-fab nd-fab--draft"
                        aria-label="Enreg. brouillon"
                        onClick={handleDraft}
                        disabled={submitting}
                    >
                        <span className="material-symbols-outlined">
                            description
                        </span>
                    </button>
                    <button
                        className="nd-fab nd-fab--submit"
                        aria-label="Soumettre"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>

                {showPhoneModal && (
                    <div className="nd-modal-overlay" onClick={closePhoneModal}>
                        <div
                            className="nd-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="nd-modal-icon">
                                <span className="material-symbols-outlined">
                                    perm_contact_calendar
                                </span>
                            </div>
                            <h2 className="nd-modal-title">
                                Modifier les numéros
                            </h2>
                            <p className="nd-modal-desc">
                                Veuillez renseigner le(s) numéro(s) de téléphone
                                par le(s)quel(s) nous pourrons vous joindre
                                durant votre absence.
                            </p>
                            <div className="nd-modal-phones">
                                {tempPhones.map((p) => (
                                    <div key={p.id} className="nd-phone-row">
                                        <div className="nd-phone-input-wrap">
                                            <span className="nd-phone-prefix">
                                                (+237)
                                            </span>
                                            <input
                                                className="nd-phone-input"
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="6 XX XX XX XX"
                                                value={formatPhone(p.digits)}
                                                onChange={(e) =>
                                                    updateTempPhone(
                                                        p.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <div
                                                className={`nd-phone-operator ${
                                                    p.operator ? 'has-op' : ''
                                                }`}
                                            >
                                                {p.operator ? (
                                                    <img
                                                        src={
                                                            operatorLogo[
                                                                p.operator
                                                            ]
                                                        }
                                                        alt={p.operator}
                                                        className="nd-op-logo fill"
                                                    />
                                                ) : (
                                                    <span className="material-symbols-outlined">
                                                        public
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {tempPhones.length > 1 && (
                                            <button
                                                className="nd-phone-remove"
                                                onClick={() =>
                                                    removeTempPhone(p.id)
                                                }
                                                aria-label="Supprimer"
                                            >
                                                <span className="material-symbols-outlined text-xs">
                                                    close
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    className="nd-add-phone"
                                    onClick={addTempPhone}
                                >
                                    <span className="material-symbols-outlined">
                                        add_circle
                                    </span>
                                    Ajouter un numéro
                                </button>
                            </div>
                            <button
                                className="nd-modal-save"
                                onClick={savePhoneModal}
                            >
                                <span className="material-symbols-outlined">
                                    save
                                </span>
                                Enregistrer
                            </button>
                            <button
                                className="nd-modal-cancel"
                                onClick={closePhoneModal}
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {showNotif && (
                    <div className="dash-notif-pop">
                        <header className="dash-notif-head">
                            <strong>Notifications</strong>
                            <button onClick={() => setShowNotif(false)}>
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </header>
                        <ul className="dash-notif-list">
                            <li>
                                <span className="dot red" /> Congé approuvé —
                                12/10/2026
                            </li>
                            <li>
                                <span className="dot blue" /> Nouvelle politique
                                d’absence
                            </li>
                        </ul>
                    </div>
                )}

                <LogoutDialog
                    isOpen={showLogoutDialog}
                    onClose={() => setShowLogoutDialog(false)}
                />
            </div>
        </>
    );
}
