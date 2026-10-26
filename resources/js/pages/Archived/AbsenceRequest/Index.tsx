import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

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
};

type AbsenceType = {
    id: number;
    label: string;
};

type TimeSlot = { value: string; label: string };

type FormData = {
    absence_type_id: string;
    start_date: string;
    start_time_slot: string;
    end_date: string;
    end_time_slot: string;
    reason: string;
    contact_phone: string;
};

const TIME_SLOTS: TimeSlot[] = [
    { value: 'matin-P', label: 'Matin (période)' },
    { value: 'soir-P', label: 'Soir (période)' },
    { value: 'matin-Q', label: 'Matin (quart)' },
    { value: 'apres-midi-Q', label: 'Après-midi (quart)' },
    { value: 'nuit-Q', label: 'Nuit (quart)' },
];

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function AbsenceRequestIndex() {
    const [requests, setRequests] = useState<AbsenceRequest[]>([]);
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [form, setForm] = useState<FormData>({
        absence_type_id: '',
        start_date: '',
        start_time_slot: '',
        end_date: '',
        end_time_slot: '',
        reason: '',
        contact_phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [reqRes, typeRes] = await Promise.all([
                    fetch('/api/absence-requests', { credentials: 'include' }),
                    fetch('/api/absence-types', { credentials: 'include' }),
                ]);

                if (!reqRes.ok || !typeRes.ok) {
                    throw new Error('Erreur lors du chargement des données.');
                }

                const requestsData: AbsenceRequest[] = await reqRes.json();
                const typesData: AbsenceType[] = await typeRes.json();

                setRequests(requestsData);
                setAbsenceTypes(typesData);
            } catch {
                setError('Erreur lors du chargement des données.');
            }
        };

        loadData();
    }, []);

    const handleChange = (key: keyof FormData, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/absence-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'include',
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                setError(
                    errData.message ||
                        'Erreur lors de la création de la demande.',
                );
                return;
            }

            const newRequest: AbsenceRequest = await res.json();
            setRequests((prev) => [...prev, newRequest]);
            setForm({
                absence_type_id: '',
                start_date: '',
                start_time_slot: '',
                end_date: '',
                end_time_slot: '',
                reason: '',
                contact_phone: '',
            });
        } catch {
            setError('Erreur lors de la création de la demande.');
        } finally {
            setLoading(false);
        }
    };

    const timeSlotGroup = (
        label: string,
        dateKey: keyof FormData,
        slotKey: keyof FormData,
    ) => (
        <div className="space-y-2">
            <label className="mb-1 block text-sm font-medium text-white/90">
                {label}
            </label>
            <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => (
                    <label
                        key={slot.value}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-sm text-white transition ${
                            form[slotKey] === slot.value
                                ? 'border-[#009632] bg-[#009632]/20'
                                : 'border-white/30 bg-white/10 hover:border-white/50'
                        }`}
                    >
                        <input
                            type="radio"
                            name={slotKey}
                            value={slot.value}
                            checked={form[slotKey] === slot.value}
                            onChange={(e) =>
                                handleChange(slotKey, e.target.value)
                            }
                            className="peer sr-only"
                        />
                        <span className="peer-checked:font-medium">
                            {slot.label}
                        </span>
                    </label>
                ))}
            </div>
            <input
                type="date"
                value={form[dateKey]}
                onChange={(e) => handleChange(dateKey, e.target.value)}
                required
                className="focus-ring-[#009632]/30 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#009632] focus:ring-2"
            />
        </div>
    );

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Image de fond */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/Login_BG_Light.jpg')" }}
                aria-hidden="true"
            />

            {/* Voile blanc translucide */}
            <div className="absolute inset-0 bg-white/80" aria-hidden="true" />

            {/* Contenu */}
            <div className="relative z-10">
                <Head title="Demandes d'absence" />

                <main className="min-h-screen bg-white lg:grid lg:grid-cols-[40%_60%]">
                    {/* Panneau gauche : identité SONARA */}
                    <section className="relative hidden min-h-screen overflow-hidden bg-white p-8 lg:flex lg:flex-col lg:items-center lg:justify-center">
                        <div
                            className="absolute inset-0 opacity-[0.08]"
                            style={{
                                backgroundImage:
                                    'linear-gradient(135deg, #044E9B 1px, transparent 1px), linear-gradient(45deg, #009632 1px, transparent 1px)',
                                backgroundSize: '38px 38px',
                            }}
                            aria-hidden="true"
                        />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-8 flex size-32 items-center justify-center bg-[#044E9B]/10 p-4">
                                <img
                                    src="/images/SONARA_Logo.png"
                                    alt="SONARA"
                                    className="h-full w-full object-contain"
                                />
                            </div>

                            <h1 className="text-center text-2xl font-bold tracking-wide text-[#044E9B] uppercase lg:text-3xl">
                                Demandes d'absence
                            </h1>

                            <p className="mt-6 max-w-md px-8 text-center text-base leading-relaxed text-gray-700">
                                Gérez vos demandes de congés et absences. Créez
                                une nouvelle demande ou consultez l'historique
                                de vos demandes existantes.
                            </p>
                        </div>
                    </section>

                    {/* Panneau droit : formulaire et liste */}
                    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#044E9B] p-4 lg:p-0">
                        <div className="relative z-10 mx-auto flex w-full max-w-[500px] flex-col items-center lg:mx-0 lg:h-full lg:max-w-none lg:pr-8">
                            {/* Carte de formulaire */}
                            <div className="mb-8 w-full rounded-[25px] border border-white bg-[#044E9B]/90 px-6 py-8 shadow-[0_10px_20px_10px_rgba(0,0,0,0.25)] lg:mr-8 lg:mb-0">
                                <h2 className="mb-6 text-center text-xl font-bold text-white">
                                    Nouvelle demande
                                </h2>

                                {error && (
                                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                                        {error}
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Type d'absence
                                        </label>
                                        <select
                                            value={form.absence_type_id}
                                            onChange={(e) =>
                                                handleChange(
                                                    'absence_type_id',
                                                    e.target.value,
                                                )
                                            }
                                            className="focus-ring-[#009632]/30 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white placeholder-white/60 outline-none focus:border-[#009632] focus:ring-2"
                                        >
                                            <option value="">
                                                Sélectionner un type
                                            </option>
                                            {absenceTypes.map((type) => (
                                                <option
                                                    key={type.id}
                                                    value={type.id}
                                                >
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Période/quart de début */}
                                    {timeSlotGroup(
                                        'Début — date et créneau',
                                        'start_date',
                                        'start_time_slot',
                                    )}

                                    {/* Période/quart de fin */}
                                    {timeSlotGroup(
                                        'Reprise — date et créneau',
                                        'end_date',
                                        'end_time_slot',
                                    )}

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Motif
                                        </label>
                                        <textarea
                                            value={form.reason}
                                            onChange={(e) =>
                                                handleChange(
                                                    'reason',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            rows={3}
                                            className="focus-ring-[#009632]/30 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#009632] focus:ring-2"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/90">
                                            Téléphone de contact
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.contact_phone}
                                            onChange={(e) =>
                                                handleChange(
                                                    'contact_phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="+237 6 XX XXX XXX"
                                            className="focus-ring-[#009632]/30 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-[#009632] focus:ring-2"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full rounded-lg bg-[#009632] px-4 py-3 font-medium text-white transition hover:bg-[#00852d] disabled:opacity-70"
                                    >
                                        {loading
                                            ? 'Création en cours...'
                                            : 'Créer la demande'}
                                    </button>
                                </form>
                            </div>

                            {/* Liste des demandes */}
                            <div className="w-full">
                                <h2 className="mb-4 text-center text-xl font-bold text-white">
                                    Mes demandes
                                </h2>

                                <div className="space-y-3">
                                    {requests.length === 0 ? (
                                        <div className="py-8 text-center text-white/70">
                                            Aucune demande d'absence pour le
                                            moment.
                                        </div>
                                    ) : (
                                        requests.map((request) => (
                                            <div
                                                key={request.id}
                                                className="rounded-lg border border-white/20 bg-white/10 p-4"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-sm font-medium text-white">
                                                        {request.absenceType
                                                            ?.label ||
                                                            'Type inconnu'}
                                                    </span>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                                                    >
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-white/70">
                                                    {request.start_date}
                                                    {request.start_time_slot
                                                        ? ` (${request.start_time_slot})`
                                                        : ''}
                                                    &rarr;
                                                    {request.end_date}
                                                    {request.end_time_slot
                                                        ? ` (${request.end_time_slot})`
                                                        : ''}
                                                </div>
                                                <div className="mt-2 line-clamp-1 text-xs text-white/60">
                                                    {request.reason}
                                                </div>
                                                {request.contact_phone && (
                                                    <div className="mt-1 text-xs text-white/50">
                                                        📞{' '}
                                                        {request.contact_phone}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
