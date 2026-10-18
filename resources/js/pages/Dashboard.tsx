import { Head } from '@inertiajs/react';
import React from 'react';

export default function Dashboard({ user }: { user: any }) {
    return (
        <>
            <Head title="Tableau de bord" />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 font-bauhaus">
                                    Tableau de bord
                                </h1>
                                <p className="text-gray-600 mt-1 font-trebuchet">
                                    Bienvenue{user ? `, ${user.name}` : ''} ({user?.role || 'Utilisateur'})
                                </p>
                            </div>
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium font-trebuchet">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Actif
                            </div>
                        </div>

                        {/* Quick stats placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-sm font-medium text-gray-500 font-trebuchet">Demandes d'absence</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">0</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-sm font-medium text-gray-500 font-trebuchet">En attente d'approbation</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">0</div>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <div className="text-sm font-medium text-gray-500 font-trebuchet">Approuvées cette semaine</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">0</div>
                            </div>
                        </div>

                        {/* Modules placeholder */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <a
                                href="/absence-requests"
                                className="group relative bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 font-bauhaus">Demandes d'absence</h3>
                                <p className="text-gray-600 font-trebuchet">Gérer vos demandes de congés et absences</p>
                            </a>

                            <a
                                href="/absence-types"
                                className="group relative bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 font-bauhaus">Types d'absence</h3>
                                <p className="text-gray-600 font-trebuchet">Configurer les types d'absences autorisés</p>
                            </a>

                            <a
                                href="/approvals"
                                className="group relative bg-white p-8 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 font-bauhaus">Approbations</h3>
                                <p className="text-gray-600 font-trebuchet">Traiter les demandes en attente</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
