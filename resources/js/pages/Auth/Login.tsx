import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        matricule: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/login', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
          {/* Image de fond */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/Login_BG_Light.jpg')" }}
            aria-hidden="true"
          />

          {/* Voile blanc translucide */}
          <div
            className="absolute inset-0 bg-white/75"
            aria-hidden="true"
          />

          {/* Contenu de la page */}
          <div className="relative z-10">
            <main className="min-h-screen bg-white lg:grid lg:grid-cols-[59.375%_40.625%]">
                {/* Panneau gauche : identité SONARA */}
                <section className="relative hidden min-h-screen overflow-hidden bg-white lg:flex lg:flex-col lg:items-center lg:justify-center">
                    {/* Motif de fond */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                "linear-gradient(135deg, #044E9B 1px, transparent 1px), linear-gradient(45deg, #009632 1px, transparent 1px)",
                            backgroundSize: "38px 38px",
                        }}
                    />

                    {/* Formes décoratives */}
                    <div
                        aria-hidden="true"
                        className="absolute left-[30%] top-[10%] size-[150px] bg-[#044E9B]/50"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute left-[23%] top-[3%] size-[75px] bg-[#009632]/50"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute left-[14%] top-[14%] size-[50px] bg-[#044E9B]/50"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute left-[60%] top-[27%] size-[75px] bg-[#009632]/50"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute left-[70%] top-[21%] size-[50px] bg-[#044E9B]/50"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute left-[21%] top-[11%] size-5 bg-[#009632]/20"
                    />

                    {/* Logo */}
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="flex size-40 items-center justify-center bg-[#044E9B]/10 p-5">
                            <img
                                src="/images/SONARA_Logo.png"
                                alt="SONARA"
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <h1 className="mt-16 text-center text-3xl font-bold uppercase tracking-wide text-[#044E9B] xl:text-4xl">
                            Bon retour à la SONARA
                        </h1>

                        <p className="mt-8 max-w-xl px-8 text-center text-base leading-relaxed text-gray-700">
                            Pour avoir accès à votre portail, nous vous prions de
                            vous connecter à votre compte au moyen de votre
                            matricule et de votre mot de passe.
                        </p>
                    </div>

                    <span className="absolute bottom-6 text-xs tracking-widest text-gray-400">
                        SONARA · PORTAIL DU PERSONNEL
                    </span>
                </section>

                {/* Panneau droit : connexion */}
                <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#044E9B] px-5 py-10 text-white sm:px-10">
                    {/* Bande verte de la maquette */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-y-0 right-0 w-[14%] bg-[#009632]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 w-[90%] bg-[#044E9B] shadow-[-20px_0_50px_rgba(0,0,0,0.12)]"
                    />

                    <div className="relative z-10 flex w-full max-w-[380px] flex-col items-center">
                        {/* Avatar */}
                        <div className="relative z-20 mb-[-25px] flex size-[120px] items-center justify-center rounded-t-[25px] bg-white shadow-[0_4px_20px_5px_rgba(0,0,0,0.25)]">
                            <div className="flex size-[84px] items-center justify-center rounded-full bg-[#044E9B]/10 text-[#044E9B]">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.4"
                                    className="size-14"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="8" r="4" />
                                    <path d="M4 21v-2a8 8 0 0 1 16 0v2z" />
                                </svg>
                            </div>
                        </div>

                        {/* Formulaire */}
                        <form
                            onSubmit={handleSubmit}
                            className="w-full rounded-[25px] border border-white bg-[#044E9B] px-7 pb-8 pt-12 shadow-[0_10px_20px_10px_rgba(0,0,0,0.25)] sm:px-10"
                        >
                            <div className="space-y-5">
                                <label className="block">
                                    <span className="sr-only">Matricule</span>
                                    <input
                                        type="text"
                                        name="matricule"
                                        autoComplete="username"
                                        required
                                        value={data.matricule}
                                        onChange={(event) =>
                                            setData('matricule', event.target.value)
                                        }
                                        placeholder="Matricule"
                                        className={`
                                            h-11 w-full rounded-[10px] border border-white bg-white/[0.02] px-5 text-sm text-white
                                            shadow-[0_4px_10px_rgba(0,0,0,0.25)] outline-none transition
                                            placeholder:text-white/90 focus:border-[#8bd9a5] focus:ring-2 focus:ring-[#8bd9a5]/30
                                            ${errors.matricule ? 'border-red-500' : ''}
                                        `}
                                    />
                                    {errors.matricule && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.matricule}
                                        </p>
                                    )}
                                </label>

                                <label className="relative block">
                                    <span className="sr-only">Mot de passe</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        autoComplete="current-password"
                                        required
                                        value={data.password}
                                        onChange={(event) =>
                                            setData('password', event.target.value)
                                        }
                                        placeholder="Mot de passe"
                                        className={`
                                            h-11 w-full rounded-[10px] border border-white bg-white/[0.02] px-5 pr-12 text-sm text-white
                                            shadow-[0_4px_10px_rgba(0,0,0,0.25)] outline-none transition
                                            placeholder:text-white/90 focus:border-[#8bd9a5] focus:ring-2 focus:ring-[#8bd9a5]/30
                                            ${errors.password ? 'border-red-500' : ''}
                                        `}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={
                                            showPassword
                                                ? "Masquer le mot de passe"
                                                : "Afficher le mot de passe"
                                        }
                                        aria-pressed={showPassword}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        {showPassword ? (
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                className="size-5"
                                                aria-hidden="true"
                                            >
                                                <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4.5 9.5 7a12 12 0 0 1-3.1 4.1M6.2 6.2C3.9 7.8 2.7 10 2.5 12c.5 1.3 1.5 2.8 3.2 4.2A10 10 0 0 0 12 19a9 9 0 0 0 2-.2" />
                                            </svg>
                                        ) : (
                                            <svg
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.7"
                                                className="size-5"
                                                aria-hidden="true"
                                            >
                                                <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-400">
                                            {errors.password}
                                        </p>
                                    )}
                                </label>
                            </div>

                            {/* Bouton de connexion */}
                            <button
                                type="submit"
                                disabled={processing}
                                className={`
                                    mt-8 flex h-16 w-full items-center overflow-hidden rounded-[15px] bg-[#009632] text-white
                                    shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition hover:bg-[#00852d] active:scale-[0.99]
                                    ${processing ? 'cursor-not-allowed opacity-70' : ''}
                                `}
                            >
                                <span className="flex h-[calc(100%-10px)] w-[75px] shrink-0 items-center justify-center rounded-[10px] bg-black/20">
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="size-6"
                                        aria-hidden="true"
                                    >
                                        <path d="M10 17l5-5-5-5" />
                                        <path d="M15 12H3" />
                                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                                    </svg>
                                </span>

                                <span className="flex-1 px-1 text-center text-lg font-medium sm:text-xl">
                                    {processing ? 'Connexion en cours...' : 'Je me connecte'}
                                </span>
                            </button>
                        </form>

                        {/* Assistance */}
                        <div className="mt-7 w-full">
                            <div className="h-px w-full bg-white/50" />

                            <p className="mx-auto mt-7 max-w-[330px] text-center text-sm leading-relaxed text-white">
                                Vous ne parvenez pas à vous connecter ? Cliquez
                                ci-dessous pour contacter l’administrateur.
                            </p>

                            <button
                                type="button"
                                onClick={() => {
                                    // Ajouter ici le lien ou le mécanisme de contact.
                                }}
                                className="mt-5 flex min-h-[50px] w-full items-center justify-center gap-3 rounded-full border border-white px-4 text-sm text-white shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="size-5 shrink-0"
                                    aria-hidden="true"
                                >
                                    <path d="M4 21V5a2 2 0 0 1 2-2h12l-3 5 3 5H6" />
                                </svg>
                                Signaler un problème
                            </button>
                        </div>
                    </div>

                    <span className="relative z-10 mt-8 text-center text-xs text-white/60 lg:hidden">
                        SONARA · PORTAIL DU PERSONNEL
                    </span>
                </section>
            </main>

          </div>
        </div>
    );
}
