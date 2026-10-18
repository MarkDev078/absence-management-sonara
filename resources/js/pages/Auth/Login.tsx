import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/api/login', {
            onSuccess: () => {
                reset();
                window.location.href = '/dashboard';
            },
        });
    };

    return (
        <>
            <Head title="Connexion" />
            <div className="min-h-screen flex">
                {/* Côté gauche – Branding avec image de fond */}
                <div
                    className="flex-1 relative bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/images/Login_BG_Light.jpg')`,
                    }}
                >
                    <div className="absolute inset-0 bg-black/35"></div>
                    <div className="relative z-10 flex flex-col items-start justify-center p-12">
                        <img
                            src="/images/SONARA_Logo.png"
                            alt="SONARA Logo"
                            className="h-24 mb-8 drop-shadow-lg"
                        />
                        <h1 className="text-5xl font-bold text-blue-400 font-bauhaus mb-6 leading-tight">
                            BON RETOUR A LA SONARA
                        </h1>
                        <p className="text-gray-200 text-lg font-trebuchet max-w-md leading-relaxed">
                            Pour avoir accès à votre portail, nous vous prions de vous connecter à
                            votre compte au moyen de votre matricule et de votre mot de passe.
                        </p>
                    </div>
                </div>

                {/* Côté droit – Panneau de connexion */}
                <div className="w-96 bg-blue-900 p-8 flex flex-col">
                    {/* Icône utilisateur */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-4xl text-gray-800 material-symbols-outlined">
                                person
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
                        {/* Champ Matricule */}
                        <div>
                            <label
                                htmlFor="matricule"
                                className="block text-sm text-blue-200 mb-2 font-trebuchet"
                            >
                                Matricule
                            </label>
                            <input
                                id="matricule"
                                name="email"
                                type="text"
                                autoComplete="username"
                                required
                                className="w-full bg-blue-800/50 border border-blue-600/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-blue-300/50 transition-all"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Votre matricule"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="relative">
                            <label
                                htmlFor="password"
                                className="block text-sm text-blue-200 mb-2 font-trebuchet"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className={`w-full bg-blue-800/50 border border-blue-600/50 rounded-xl px-4 py-3.5 text-white pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-blue-300/50 transition-all ${
                                    errors.password ? 'border-red-500' : ''
                                }`}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -mt-3 text-blue-300 hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center space-x-2 font-trebuchet ${
                                processing ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            <span className="material-symbols-outlined">login</span>
                            {processing ? 'Connexion en cours...' : 'Je me connecte'}
                        </button>
                    </form>

                    {/* Mot de passe oublié / Signaler un problème */}
                    <div className="mt-auto text-center space-y-3">
                        <p className="text-blue-200 text-sm font-trebuchet">
                            Vous ne parvenez pas à vous connecter ? Cliquez ci-dessous pour contacter
                            l'administrateur.
                        </p>
                        <button
                            type="button"
                            className="w-full bg-transparent border border-blue-500/50 text-blue-200 py-3 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center space-x-2 font-trebuchet"
                        >
                            <span className="material-symbols-outlined">flag</span>
                            Signaler un problème
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
