import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useToast } from '../components/useToast';
import ToastContainer from '../components/ToastContainer';

type Approval = {
    id: number;
    absence_request_id: number;
    employee: { id: number; name: string };
    absence_type: { name: string };
    start_date: string;
    end_date: string;
    reason: string;
    status: string | null;
};

type Props = {
    approvals?: Approval[];
};

export default function ApprovalIndex({ approvals = [] }: Props) {
    const { toasts, addToast, removeToast } = useToast();
    const [data, setData] = useState<Approval[]>(approvals);
    const [loading, setLoading] = useState(approvals.length === 0);

    useEffect(() => {
        if (approvals.length > 0) {
            setLoading(false);
            return;
        }

        const fetchApprovals = async (): Promise<void> => {
            try {
                const response = await fetch('/api/approvals/pending', {
                    credentials: 'include',
                    headers: { Accept: 'application/json' },
                });
                const json = await response.json();
                setData(Array.isArray(json) ? json : []);
            } catch (error) {
                console.error('Erreur lors du chargement des approbations:', error);
                addToast('Erreur lors du chargement des approbations', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchApprovals();
    }, [approvals, addToast]);

    const handleDecide = async (id: number, kind: 'approve' | 'reject'): Promise<void> => {
        if (
            !window.confirm(kind === 'approve' ? 'Approuver cette demande ?' : 'Rejeter cette demande ?')
        ) {
            return;
        }

        try {
            const response = await fetch(`/api/approvals/${id}/${kind === 'approve' ? 'approve' : 'reject'}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                addToast(`Demande ${kind === 'approve' ? 'approuvée' : 'rejetée'}`, 'success');
                setData((current) => current.filter((a) => a.id !== id));
            } else {
                addToast('Échec de la décision', 'error');
            }
        } catch (error) {
            console.error('Erreur lors de la décision:', error);
            addToast('Erreur réseau lors de la décision', 'error');
        }
    };

    return (
        <>
            <Head title="Approbations" />
            <ToastContainer />
            <div className="min-h-screen bg-[#eef2f7] p-6 font-sans">
                <h1 className="text-2xl font-bold text-[#044E9B]">Approbations en attente</h1>

                {loading ? (
                    <p className="text-gray-600">Chargement des approbations...</p>
                ) : data.length === 0 ? (
                    <p className="text-gray-600">Aucune approbation en attente.</p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {data.map((approval) => (
                            <li
                                key={approval.id}
                                className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm"
                            >
                                <p className="text-sm font-semibold text-gray-800">
                                    {approval.employee.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {approval.absence_type.name} &mdash;{' '}
                                    {approval.start_date} &rarr; {approval.end_date}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{approval.reason}</p>
                                <div className="mt-3 flex gap-2">
                                    <button
                                        onClick={() => handleDecide(approval.id, 'approve')}
                                        className="flex-1 px-4 py-2 rounded bg-[#009632] text-white text-sm font-medium hover:bg-green-700 transition"
                                    >
                                        Approuver
                                    </button>
                                    <button
                                        onClick={() => handleDecide(approval.id, 'reject')}
                                        className="flex-1 px-4 py-2 rounded bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
