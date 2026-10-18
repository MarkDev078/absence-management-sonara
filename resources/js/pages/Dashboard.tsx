import { Head } from '@inertiajs/react';
import React from 'react';

export default function Dashboard({ user }: { user: any }) {
    return (
        <>
            <Head title="Tableau de bord" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h1 className="font-bauhaus text-3xl font-bold text-gray-900">
                                    Tableau de bord
                                </h1>
                                <p className="mt-1 font-trebuchet text-gray-600">
                                    Bienvenue{user ? `, ${user.name}` : ''} (
                                    {user?.role || 'Utilisateur'})
                                </p>
                            </div>
                            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-100 px-4 py-2 font-trebuchet text-sm font-medium text-indigo-700">
                                <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                Actif
                            </div>
                        </div>

                        {/* Quick stats placeholder */}
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="font-trebuchet text-sm font-medium text-gray-500">
                                    Demandes d'absence
                                </div>
                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    0
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="font-trebuchet text-sm font-medium text-gray-500">
                                    En attente d'approbation
                                </div>
                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    0
                                </div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                                <div className="font-trebuchet text-sm font-medium text-gray-500">
                                    Approuvées cette semaine
                                </div>
                                <div className="mt-2 text-2xl font-bold text-gray-900">
                                    0
                                </div>
                            </div>
                        </div>

                        {/* Modules placeholder */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <a
                                href="/absence-requests"
                                className="group relative rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <svg
                                        className="h-6 w-6 text-indigo-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 font-bauhaus text-lg font-bold text-gray-900">
                                    Demandes d'absence
                                </h3>
                                <p className="font-trebuchet text-gray-600">
                                    Gérer vos demandes de congés et absences
                                </p>
                            </a>

                            <a
                                href="/absence-types"
                                className="group relative rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <svg
                                        className="h-6 w-6 text-indigo-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 font-bauhaus text-lg font-bold text-gray-900">
                                    Types d'absence
                                </h3>
                                <p className="font-trebuchet text-gray-600">
                                    Configurer les types d'absences autorisés
                                </p>
                            </a>

                            <a
                                href="/approvals"
                                className="group relative rounded-xl border border-gray-100 bg-white p-8 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 transition-opacity group-hover:opacity-100">
                                    <svg
                                        className="h-6 w-6 text-indigo-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 font-bauhaus text-lg font-bold text-gray-900">
                                    Approbations
                                </h3>
                                <p className="font-trebuchet text-gray-600">
                                    Traiter les demandes en attente
                                </p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
