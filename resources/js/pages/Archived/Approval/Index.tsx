import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

type Approval = {
    id: number;
    step: number;
    status: string | null;
    approved_at: string | null;
    absenceRequest: {
        id: number;
        start_date: string;
        end_date: string;
        reason: string;
        status: string;
        employee: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
        };
        absenceType: {
            id: number;
            label: string;
        } | null;
    };
};

const STATUS_STYLES: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
};

export default function ApprovalIndex({ user }: { user: any }) {
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const canApprove =
        user?.role === 'manager' ||
        user?.role === 'rh' ||
        user?.role === 'admin';

    useEffect(() => {
        if (!canApprove) {
            setError(
                "Vous n'avez pas les droits pour consulter les approbations.",
            );
            return;
        }

        const loadApprovals = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/approvals/pending', {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!res.ok) {
                    throw new Error(
                        'Erreur lors du chargement des approbations.',
                    );
                }

                const data: Approval[] = await res.json();
                setApprovals(data);
            } catch {
                setError('Erreur lors du chargement des approbations.');
            } finally {
                setLoading(false);
            }
        };

        loadApprovals();
    }, [canApprove, user?.id]);

    const handleAction = async (
        approvalId: number,
        action: 'approve' | 'reject',
    ) => {
        if (!canApprove) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch(`/api/approvals/${approvalId}/${action}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(
                    errData.message ||
                        `Erreur lors de l'${action === 'approve' ? 'approbation' : 'rejet'}.`,
                );
            }

            setSuccess(
                `Demande ${action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`,
            );

            setApprovals((prev) =>
                prev.map((a) =>
                    a.id === approvalId
                        ? {
                              ...a,
                              status:
                                  action === 'approve'
                                      ? 'approved'
                                      : 'rejected',
                          }
                        : a,
                ),
            );
        } catch (err: any) {
            setError(
                err.message ||
                    `Erreur lors de l'${action === 'approve' ? 'approbation' : 'rejet'}.`,
            );
        } finally {
            setLoading(false);
        }
    };

    if (!canApprove) {
        return (
            <div className="relative min-h-screen overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/images/Login_BG_Light.jpg')",
                    }}
                    aria-hidden="true"
                />

                <div
                    className="absolute inset-0 bg-white/80"
                    aria-hidden="true"
                />

                <div className="relative z-10">
                    <Head title="Approbations" />

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
                                    Approbations
                                </h1>

                                <p className="mt-6 max-w-md px-8 text-center text-base leading-relaxed text-gray-700">
                                    Accès réservé aux gestionnaires (managers,
                                    RH, administrateurs).
                                </p>
                            </div>
                        </section>

                        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#044E9B] p-4 lg:p-0">
                            <div className="relative z-10 mx-auto flex w-full max-w-[500px] flex-col items-center lg:mx-0 lg:h-full lg:max-w-none lg:pr-8">
                                <div className="w-full rounded-[25px] border border-white bg-[#044E9B]/90 px-6 py-8 shadow-[0_10px_20px_10px_rgba(0,0,0,0.25)]">
                                    <h2 className="mb-6 text-center text-xl font-bold text-white">
                                        Approbations
                                    </h2>

                                    <div className="py-12 text-center text-white/70">
                                        Vous n'avez pas les droits pour accéder
                                        à cette page.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/Login_BG_Light.jpg')" }}
                aria-hidden="true"
            />

            <div className="absolute inset-0 bg-white/80" aria-hidden="true" />

            <div className="relative z-10">
                <Head title="Approbations" />

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
                                Approbations
                            </h1>

                            <p className="mt-6 max-w-md px-8 text-center text-base leading-relaxed text-gray-700">
                                Traitez les demandes d'absence en attente de
                                votre validation.
                            </p>
                        </div>
                    </section>

                    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#044E9B] p-4 lg:p-0">
                        <div className="relative z-10 mx-auto flex w-full max-w-[500px] flex-col items-center lg:mx-0 lg:h-full lg:max-w-none lg:pr-8">
                            <div className="mb-8 w-full rounded-[25px] border border-white bg-[#044E9B]/90 px-6 py-8 shadow-[0_10px_20px_10px_rgba(0,0,0,0.25)] lg:mr-8 lg:mb-0">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">
                                        Demandes en attente
                                    </h2>

                                    {error && (
                                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                                            {error}
                                        </div>
                                    )}

                                    {success && (
                                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
                                            {success}
                                        </div>
                                    )}
                                </div>

                                {loading ? (
                                    <div className="py-8 text-center text-white/70">
                                        Chargement...
                                    </div>
                                ) : approvals.length === 0 ? (
                                    <div className="py-8 text-center text-white/70">
                                        Aucune demande en attente d'approbation.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {approvals.map((approval) => (
                                            <div
                                                key={approval.id}
                                                className="rounded-lg border border-white/20 bg-white/10 p-4"
                                            >
                                                <div className="mb-2 flex items-center justify-between">
                                                    <h3 className="text-sm font-medium text-white">
                                                        {
                                                            approval
                                                                .absenceRequest
                                                                .employee
                                                                .first_name
                                                        }{' '}
                                                        {
                                                            approval
                                                                .absenceRequest
                                                                .employee
                                                                .last_name
                                                        }
                                                    </h3>
                                                    <span
                                                        className={`rounded px-2 py-1 text-xs font-medium ${STATUS_STYLES[approval.absenceRequest.status] || 'bg-white/10 text-white/70'}`}
                                                    >
                                                        Niveau {approval.step}
                                                    </span>
                                                </div>

                                                <div className="mb-2 text-xs text-white/70">
                                                    {approval.absenceRequest
                                                        .absenceType?.label ||
                                                        'Type inconnu'}
                                                </div>

                                                <div className="mb-4 space-y-1 text-xs text-white/70">
                                                    <div className="flex justify-between">
                                                        <span>Du</span>
                                                        <span>
                                                            {new Date(
                                                                approval
                                                                    .absenceRequest
                                                                    .start_date,
                                                            ).toLocaleDateString(
                                                                'fr-FR',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Au</span>
                                                        <span>
                                                            {new Date(
                                                                approval
                                                                    .absenceRequest
                                                                    .end_date,
                                                            ).toLocaleDateString(
                                                                'fr-FR',
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Motif</span>
                                                        <span className="line-clamp-1">
                                                            {
                                                                approval
                                                                    .absenceRequest
                                                                    .reason
                                                            }
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                approval.id,
                                                                'approve',
                                                            )
                                                        }
                                                        disabled={loading}
                                                        className="flex-1 rounded-lg bg-[#009632] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#00852d] disabled:opacity-70"
                                                    >
                                                        Approuver
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleAction(
                                                                approval.id,
                                                                'reject',
                                                            )
                                                        }
                                                        disabled={loading}
                                                        className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-70"
                                                    >
                                                        Rejeter
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
