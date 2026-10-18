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
            <div className="flex min-h-screen">
                {/* Côté gauche – Branding avec image de fond */}
                <div
                    className="relative flex-1 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('/images/Login_BG_Light.jpg')`,
                    }}
                >
                    <div className="absolute inset-0 bg-black/35"></div>
                    <div className="relative z-10 flex flex-col items-start justify-center p-12">
                        <img
                            src="/images/SONARA_Logo.png"
                            alt="SONARA Logo"
                            className="mb-8 h-24 drop-shadow-lg"
                        />
                        <h1 className="mb-6 font-bauhaus text-5xl leading-tight font-bold text-blue-400">
                            BON RETOUR A LA SONARA
                        </h1>
                        <p className="max-w-md font-trebuchet text-lg leading-relaxed text-gray-200">
                            Pour avoir accès à votre portail, nous vous prions
                            de vous connecter à votre compte au moyen de votre
                            matricule et de votre mot de passe.
                        </p>
                    </div>
                </div>

                {/* Côté droit – Panneau de connexion */}
                <div className="flex w-96 flex-col bg-blue-900 p-8">
                    {/* Icône utilisateur */}
                    <div className="mb-8 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl">
                            <span className="material-symbols-outlined text-4xl text-gray-800">
                                person
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-1 flex-col gap-6"
                    >
                        {/* Champ Matricule */}
                        <div>
                            <label
                                htmlFor="matricule"
                                className="mb-2 block font-trebuchet text-sm text-blue-200"
                            >
                                Matricule
                            </label>
                            <input
                                id="matricule"
                                name="email"
                                type="text"
                                autoComplete="username"
                                required
                                className="w-full rounded-xl border border-blue-600/50 bg-blue-800/50 px-4 py-3.5 text-white placeholder-blue-300/50 transition-all focus:ring-2 focus:ring-green-500 focus:outline-none"
                                value={data.email}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                placeholder="Votre matricule"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="relative">
                            <label
                                htmlFor="password"
                                className="mb-2 block font-trebuchet text-sm text-blue-200"
                            >
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className={`w-full rounded-xl border border-blue-600/50 bg-blue-800/50 px-4 py-3.5 pr-12 text-white placeholder-blue-300/50 transition-all focus:ring-2 focus:ring-green-500 focus:outline-none ${
                                    errors.password ? 'border-red-500' : ''
                                }`}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute top-1/2 right-3 -mt-3 text-blue-300 transition-colors hover:text-white"
                            >
                                <span className="material-symbols-outlined">
                                    {showPassword
                                        ? 'visibility_off'
                                        : 'visibility'}
                                </span>
                            </button>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-400">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-4 font-trebuchet font-medium text-white transition-all hover:from-green-600 hover:to-green-700 disabled:from-green-400 disabled:to-green-500 ${
                                processing
                                    ? 'cursor-not-allowed opacity-70'
                                    : ''
                            }`}
                        >
                            <span className="material-symbols-outlined">
                                login
                            </span>
                            {processing
                                ? 'Connexion en cours...'
                                : 'Je me connecte'}
                        </button>
                    </form>

                    {/* Mot de passe oublié / Signaler un problème */}
                    <div className="mt-auto space-y-3 text-center">
                        <p className="font-trebuchet text-sm text-blue-200">
                            Vous ne parvenez pas à vous connecter ? Cliquez
                            ci-dessous pour contacter l'administrateur.
                        </p>
                        <button
                            type="button"
                            className="flex w-full items-center justify-center space-x-2 rounded-xl border border-blue-500/50 bg-transparent py-3 font-trebuchet text-blue-200 transition-colors hover:bg-white/10"
                        >
                            <span className="material-symbols-outlined">
                                flag
                            </span>
                            Signaler un problème
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
