import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

type AbsenceType = {
    id: number;
    label: string;
    description: string | null;
    requires_medical_visit: boolean;
    max_duration_days: number | null;
    created_at: string;
    updated_at: string;
};

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function AbsenceTypeIndex({ user }: { user: any }) {
    const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isRhOrAdmin = user?.role === 'rh' || user?.role === 'admin';

    useEffect(() => {
        const loadTypes = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/absence-types', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) {
                    throw new Error(
                        "Erreur lors du chargement des types d'absence.",
                    );
                }

                const data: AbsenceType[] = await res.json();
                setAbsenceTypes(data);
            } catch {
                setError("Erreur lors du chargement des types d'absence.");
            } finally {
                setLoading(false);
            }
        };

        loadTypes();
    }, [user?.role]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/Login_BG_Light.jpg')" }}
                aria-hidden="true"
            />

            <div className="absolute inset-0 bg-white/80" aria-hidden="true" />

            <div className="relative z-10">
                <Head title="Types d'absence" />

                <main className="min-h-screen bg-white lg:grid lg:grid-cols-[40%_60%]">
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
                                Types d'absence
                            </h1>

                            <p className="mt-6 max-w-md px-8 text-center text-base leading-relaxed text-gray-700">
                                Consultez la liste des types d'absences
                                autorisés au sein de l'entreprise.
                            </p>
                        </div>
                    </section>

                    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#044E9B] p-4 lg:p-0">
                        <div className="relative z-10 mx-auto flex w-full max-w-[500px] flex-col items-center lg:mx-0 lg:h-full lg:max-w-none lg:pr-8">
                            <div className="mb-8 w-full rounded-[25px] border border-white bg-[#044E9B]/90 px-6 py-8 shadow-[0_10px_20px_10px_rgba(0,0,0,0.25)] lg:mr-8 lg:mb-0">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">
                                        Types d'absence
                                    </h2>
                                    {error && (
                                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="py-8 text-center text-white/70">
                                        Chargement...
                                    </div>
                                ) : absenceTypes.length === 0 ? (
                                    <div className="py-8 text-center text-white/70">
                                        Aucun type d'absence configuré.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {absenceTypes.map((type) => (
                                            <div
                                                key={type.id}
                                                className="rounded-lg border border-white/20 bg-white/10 p-4"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-white">
                                                        {type.label}
                                                    </h3>
                                                    <span className="rounded border border-white/30 px-2 py-1 text-xs font-medium text-white/80">
                                                        {type.requires_medical_visit
                                                            ? 'Visite médicale requise'
                                                            : 'Sans visite médicale'}
                                                    </span>
                                                </div>

                                                {type.description && (
                                                    <div className="mb-2 line-clamp-2 text-xs text-white/70">
                                                        {type.description}
                                                    </div>
                                                )}

                                                <div className="space-y-1 text-xs text-white/60">
                                                    {type.max_duration_days !==
                                                        null && (
                                                        <div className="flex justify-between">
                                                            <span>
                                                                Durée maximale
                                                            </span>
                                                            <span>
                                                                {
                                                                    type.max_duration_days
                                                                }{' '}
                                                                jours
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between">
                                                        <span>Créé le</span>
                                                        <span>
                                                            {new Date(
                                                                type.created_at,
                                                            ).toLocaleDateString(
                                                                'fr-FR',
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {!isRhOrAdmin && (
                                <div className="w-full py-4 text-center text-xs text-white/50">
                                    Seuls les RH et l'administrateur peuvent
                                    gérer les types d'absence.
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
