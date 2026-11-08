import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'
import { authenticate } from '../data/demoDb.ts'
import { useReport } from '../components/ReportDialog.tsx'

type FieldErrors = { matricule: string; password: string }
type ToastType = 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }

export default function Login(): React.ReactElement {
  const navigate = useNavigate()
  const { openReport } = useReport()
  const [matricule, setMatricule] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [errors, setErrors] = useState<FieldErrors>({ matricule: '', password: '' })
  const [loading, setLoading] = useState<boolean>(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  const showToast = (message: string, type: ToastType = 'success'): void => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    window.setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }
  const dismissToast = (id: number): void => setToasts(prev => prev.filter(t => t.id !== id))

  const validate = (): boolean => {
    const newErrors: FieldErrors = { matricule: '', password: '' }
    let valid = true
    if (!matricule.trim()) { newErrors.matricule = 'Veuillez saisir votre matricule'; valid = false }
    else if (matricule.trim().length < 3) { newErrors.matricule = 'Matricule trop court (min. 3 caractères)'; valid = false }
    if (!password.trim()) { newErrors.password = 'Veuillez saisir votre mot de passe'; valid = false }
    else if (password.length < 4) { newErrors.password = 'Mot de passe trop court (min. 4 caractères)'; valid = false }
    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!validate()) { showToast('Veuillez corriger les erreurs du formulaire', 'error'); return }
    setLoading(true)
    await new Promise<void>(resolve => window.setTimeout(resolve, 1000))
    setLoading(false)
    const user = authenticate(matricule, password)
    if (!user) {
      setErrors({ matricule: 'Matricule ou mot de passe de démonstration incorrect.', password: '' })
      showToast('Identifiants incorrects. Consultez les comptes de démonstration.', 'error')
      return
    }
    showToast(`Bienvenue, ${user.name} !`, 'success')
    // Navigate to dashboard after short delay to show toast
    window.setTimeout(() => navigate('/dashboard'), 600)
  }

  const handleReportProblem = (): void => openReport(matricule)
  const a: string = mounted ? 'animated' : ''

  return (
    <div className="login-page">
      <div className="left-panel">
        <div className={`left-bg ${a}`} aria-hidden="true" />
        <div className="left-overlay" aria-hidden="true" />
        <div className="left-content">
          <div className={`logo-cluster ${a}`}>
            <div className={`deco deco-mint-small ${a}`} aria-hidden="true" />
            <div className={`deco deco-green-top ${a}`} aria-hidden="true" />
            <div className={`deco deco-blue-medium ${a}`} aria-hidden="true" />
            <div className={`deco deco-blue-base ${a}`} aria-hidden="true" />
            <div className={`deco deco-blue-small-right ${a}`} aria-hidden="true" />
            <div className={`deco deco-green-large ${a}`} aria-hidden="true" />
            <div className={`deco deco-mint-tiny ${a}`} aria-hidden="true" />
            <div className={`logo-card ${a}`}>
              <img src="/assets/SONARA_Logo.png" alt="SONARA - Fueling ambitions" width={126} height={126} />
            </div>
          </div>
          <h1 className={`welcome-title ${a}`}>
            <span>BIENVENUE À LA</span>
            <span>SONARA</span>
          </h1>
          <p className={`welcome-desc ${a}`}>Pour avoir accès à votre portail, nous vous prions de vous connecter à votre compte au moyen de votre matricule et de votre mot de passe.</p>
        </div>
      </div>
      <div className={`green-divider ${a}`} aria-hidden="true" />
      <div className={`right-panel ${a}`}>
        <div className="right-inner">
          <div className={`avatar-card ${a}`} aria-hidden="true">
            <span className="material-symbols-outlined avatar-material" aria-hidden="true">person</span>
          </div>
          <form className={`login-card ${a}`} onSubmit={handleSubmit} noValidate>
            <div className={`input-group ${a}`}>
              <input type="text" className={`input-field ${errors.matricule ? 'has-error' : ''}`} placeholder="Matricule" value={matricule}
                onChange={e => { setMatricule(e.target.value); if (errors.matricule) setErrors(prev => ({ ...prev, matricule: '' })) }}
                autoComplete="username" aria-label="Matricule" aria-invalid={!!errors.matricule} />
              {errors.matricule && <div className="error-msg"><span className="material-symbols-outlined error-material" aria-hidden="true">error</span>{errors.matricule}</div>}
            </div>
            <div className={`input-group ${a}`}>
              <input type={showPassword ? 'text' : 'password'} className={`input-field ${errors.password ? 'has-error' : ''}`} placeholder="Mot de passe" value={password}
                onChange={e => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: '' })) }}
                autoComplete="current-password" aria-label="Mot de passe" aria-invalid={!!errors.password} style={{ paddingRight: '48px' }} />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Masquer' : 'Afficher'}>
                <span className="material-symbols-outlined eye-material" aria-hidden="true">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
              {errors.password && <div className="error-msg"><span className="material-symbols-outlined error-material" aria-hidden="true">error</span>{errors.password}</div>}
            </div>
            <button type="submit" className={`btn-connect ${a}`} disabled={loading}>
              <span className="btn-icon-box" aria-hidden="true">
                {loading ? <span className="spinner" /> : <span className="material-symbols-outlined btn-icon-material" aria-hidden="true">login</span>}
              </span>
              <span className="btn-text">{loading ? 'Connexion...' : 'Je me connecte'}</span>
            </button>
          </form>
          <details className="demo-login-hint"><summary>Comptes de démonstration</summary><p>Employée : EMP001 · Responsable : CHEF001 · Directrice : DIR001<br />Mot de passe commun : demo1234</p></details>
          <div className={`bottom-area ${a}`}>
            <div className={`divider ${a}`} aria-hidden="true" />
            <div className="bottom-row">
              <p className={`help-text ${a}`}>Vous ne parvenez pas à vous connecter ? Cliquez ci-dessous pour contacter l'administrateur.</p>
              <button type="button" className={`btn-problem ${a}`} onClick={handleReportProblem}>
                <span className="material-symbols-outlined flag-material" aria-hidden="true">flag</span>
                Signaler un problème
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon"><span className="material-symbols-outlined toast-material" aria-hidden="true">{toast.type === 'success' ? 'check_circle' : 'error'}</span></div>
            <span>{toast.message}</span>
            <button className="toast-close" aria-label="Fermer" onClick={() => dismissToast(toast.id)}><span className="material-symbols-outlined">close</span></button>
          </div>
        ))}
      </div>
    </div>
  )
}
