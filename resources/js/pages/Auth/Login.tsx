import { Head } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/useToast';
import ToastContainer from '../../components/ToastContainer';

type FieldErrors = { matricule: string; password: string };

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        matricule: '',
        password: '',
    });

    const { addToast } = useToast();
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [clientErrors, setClientErrors] = useState<FieldErrors>({
        matricule: '',
        password: '',
    });
    const a = mounted ? 'animated' : '';

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    const validate = (): boolean => {
        const newErrors: FieldErrors = { matricule: '', password: '' };
        let valid = true;
        if (!data.matricule.trim()) {
            newErrors.matricule = 'Veuillez saisir votre matricule';
            valid = false;
        } else if (data.matricule.trim().length < 3) {
            newErrors.matricule = 'Matricule trop court (min. 3 caractères)';
            valid = false;
        }
        if (!data.password.trim()) {
            newErrors.password = 'Veuillez saisir votre mot de passe';
            valid = false;
        } else if (data.password.length < 4) {
            newErrors.password = 'Mot de passe trop court (min. 4 caractères)';
            valid = false;
        }
        setClientErrors(newErrors);
        return valid;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) {
            addToast('Veuillez corriger les erreurs du formulaire', 'error');
            return;
        }
        post('/login', {
            onSuccess: () => {
                reset();
                addToast('Connexion réussie.', 'success');
            },
            onError: () => {
                addToast('Matricule ou mot de passe incorrect.', 'error');
            },
        });
    };

    const handleReportProblem = (): void => {
        addToast("Votre demande a été transmise à l'administrateur", 'success');
    };

    const clearFieldError = (field: 'matricule' | 'password'): void => {
        setClientErrors((prev) => ({ ...prev, [field]: '' }));
    };

    return (
        <>
            <Head title="Connexion — SONARA" />
            <ToastContainer />

            <div className="login-page">
                {/* Panneau gauche — identité SONARA */}
                <div className="left-panel">
                    <div className={`left-bg ${a}`} aria-hidden="true" />
                    <div className="left-overlay" aria-hidden="true" />
                    <div className="left-content">
                        <div className={`logo-cluster ${a}`}>
                            <div
                                className={`deco deco-mint-small ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-green-top ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-blue-medium ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-blue-base ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-blue-small-right ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-green-large ${a}`}
                                aria-hidden="true"
                            />
                            <div
                                className={`deco deco-mint-tiny ${a}`}
                                aria-hidden="true"
                            />
                            <div className={`logo-card ${a}`}>
                                <img
                                    src="/assets/SONARA_Logo.png"
                                    alt="SONARA - Fueling ambitions"
                                    width={126}
                                    height={126}
                                />
                            </div>
                        </div>
                        <h1 className={`welcome-title ${a}`}>
                            <span>BIENVENUE À LA</span>
                            <span>SONARA</span>
                        </h1>
                        <p className={`welcome-desc ${a}`}>
                            Pour avoir accès à votre portail, nous vous prions
                            de vous connecter à votre compte au moyen de votre
                            matricule et de votre mot de passe.
                        </p>
                    </div>
                </div>

                {/* Diviseur vert */}
                <div className={`green-divider ${a}`} aria-hidden="true" />

                {/* Panneau droit — formulaire de connexion */}
                <div className={`right-panel ${a}`}>
                    <div className="right-inner">
                        {/* Carte avatar */}
                        <div className={`avatar-card ${a}`} aria-hidden="true">
                            <span
                                className="material-symbols-outlined avatar-material"
                                aria-hidden="true"
                            >
                                person
                            </span>
                        </div>

                        {/* Formulaire de connexion */}
                        <form
                            className={`login-card ${a}`}
                            onSubmit={handleSubmit}
                            noValidate
                        >
                            {/* Champ matricule */}
                            <div className={`input-group ${a}`}>
                                <input
                                    type="text"
                                    className={`input-field ${errors.matricule || clientErrors.matricule ? 'has-error' : ''}`}
                                    placeholder="Matricule"
                                    value={data.matricule}
                                    onChange={(event) => {
                                        setData(
                                            'matricule',
                                            event.target.value,
                                        );
                                        if (clientErrors.matricule) {
                                            clearFieldError('matricule');
                                        }
                                    }}
                                    autoComplete="username"
                                    aria-label="Matricule"
                                    aria-invalid={
                                        !!(
                                            errors.matricule ||
                                            clientErrors.matricule
                                        )
                                    }
                                />
                                {(errors.matricule ||
                                    clientErrors.matricule) && (
                                    <div className="error-msg">
                                        <span
                                            className="material-symbols-outlined error-material"
                                            aria-hidden="true"
                                        >
                                            error
                                        </span>
                                        {errors.matricule ||
                                            clientErrors.matricule}
                                    </div>
                                )}
                            </div>

                            {/* Champ mot de passe */}
                            <div className={`input-group ${a}`}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className={`input-field ${errors.password || clientErrors.password ? 'has-error' : ''}`}
                                    placeholder="Mot de passe"
                                    value={data.password}
                                    onChange={(event) => {
                                        setData('password', event.target.value);
                                        if (clientErrors.password) {
                                            clearFieldError('password');
                                        }
                                    }}
                                    autoComplete="current-password"
                                    aria-label="Mot de passe"
                                    aria-invalid={
                                        !!(
                                            errors.password ||
                                            clientErrors.password
                                        )
                                    }
                                    style={{ paddingRight: '48px' }}
                                />
                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword ? 'Masquer' : 'Afficher'
                                    }
                                >
                                    <span
                                        className="material-symbols-outlined eye-material"
                                        aria-hidden="true"
                                    >
                                        {showPassword
                                            ? 'visibility_off'
                                            : 'visibility'}
                                    </span>
                                </button>
                                {(errors.password || clientErrors.password) && (
                                    <div className="error-msg">
                                        <span
                                            className="material-symbols-outlined error-material"
                                            aria-hidden="true"
                                        >
                                            error
                                        </span>
                                        {errors.password ||
                                            clientErrors.password}
                                    </div>
                                )}
                            </div>

                            {/* Bouton de connexion */}
                            <button
                                type="submit"
                                className={`btn-connect ${a}`}
                                disabled={processing}
                            >
                                <span
                                    className="btn-icon-box"
                                    aria-hidden="true"
                                >
                                    {processing ? (
                                        <span className="spinner" />
                                    ) : (
                                        <span
                                            className="material-symbols-outlined btn-icon-material"
                                            aria-hidden="true"
                                        >
                                            login
                                        </span>
                                    )}
                                </span>
                                <span className="btn-text">
                                    {processing
                                        ? 'Connexion...'
                                        : 'Je me connecte'}
                                </span>
                            </button>
                        </form>

                        {/* Zone basse — aide + signaler un problème */}
                        <div className={`bottom-area ${a}`}>
                            <div
                                className={`divider ${a}`}
                                aria-hidden="true"
                            />
                            <div className="bottom-row">
                                <p className={`help-text ${a}`}>
                                    Vous ne parvenez pas à vous connecter ?
                                    Cliquez ci-dessous pour contacter
                                    l'administrateur.
                                </p>
                                <button
                                    type="button"
                                    className={`btn-problem ${a}`}
                                    onClick={handleReportProblem}
                                >
                                    <span
                                        className="material-symbols-outlined flag-material"
                                        aria-hidden="true"
                                    >
                                        flag
                                    </span>
                                    Signaler un problème
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
