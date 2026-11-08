import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'
import { MobileMenu } from '../components/AppMenus.tsx'
import LogoutDialog from '../components/LogoutDialog.tsx'
import { useLiveClock } from '../hooks/useLiveClock.ts'
import { CreateMenu, TeamNavButton } from '../components/AppActions.tsx'
import { useReport } from '../components/ReportDialog.tsx'
import { getCurrentUser, hasSubordinates, myDemands } from '../data/demoDb.ts'

type Toast = { id: number; message: string; type: 'success' | 'info' | 'error' }

export default function Dashboard(): React.ReactElement {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)
  const [toasts, setToasts] = useState<Toast[]>([])
  const { timeStr, dateStr, shortDate, refresh } = useLiveClock()
  const [showNotif, setShowNotif] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const user = getCurrentUser()
  const canViewTeam = Boolean(user && hasSubordinates(user.id))
  const displayName = user?.name || 'Utilisateur'
  const { openReport } = useReport()
  const [dataVersion, setDataVersion] = useState(0)
  const demands = myDemands()
  useEffect(() => {
    const reload = () => setDataVersion(v => v + 1)
    window.addEventListener('sonara-db-change', reload)
    window.addEventListener('storage', reload)
    return () => { window.removeEventListener('sonara-db-change', reload); window.removeEventListener('storage', reload) }
  }, [])
  void dataVersion

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 60)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sonara_toast')
      if (raw) {
        const parsed = JSON.parse(raw)
        localStorage.removeItem('sonara_toast')
        window.setTimeout(() => showToast(parsed.message, parsed.type), 300)
      }
    } catch {}
  }, [])

  const showToast = (message: string, type: Toast['type'] = 'info'): void => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, message, type }])
    window.setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }
  const dismissToast = (id: number): void => setToasts(p => p.filter(t => t.id !== id))

  const handleLogout = (): void => setShowLogoutDialog(true)
  const confirmLogout = (): void => {
    setShowLogoutDialog(false)
    localStorage.removeItem('sonara_user')
    showToast('Déconnexion en cours...', 'success')
    window.setTimeout(() => navigate('/'), 500)
  }

  const a = mounted ? 'animated' : ''

  return (
    <div className="dashboard-root">
      {/* Top Bar */}
      <header className={`dash-topbar ${a}`}>
        <div className="dash-topbar-left">
          <div className="dash-logo-wrap">
            <img src="/assets/SONARA_Logo.png" alt="SONARA" className="dash-logo" />
          </div>
          <div className="dash-time">
            <span className="dash-time-hour">{timeStr}</span>
            <span className="dash-time-date">{dateStr}</span>
            <span className="dash-time-short">{shortDate}</span>
          </div>
        </div>
        {/* Desktop actions */}
        <nav className="dash-topbar-right dash-desktop-only" aria-label="Actions rapides">
          <CreateMenu />
          <button className="dash-icon-btn" aria-label="Documents" onClick={() => showToast('Documents → bientôt disponible', 'info')}>
            <span className="material-symbols-outlined">description</span>
          </button>
          <button className="dash-icon-btn" aria-label="Historique" onClick={() => navigate('/historique')}>
            <span className="material-symbols-outlined">history</span>
          </button>
          <TeamNavButton />
          <button className="dash-icon-btn" aria-label="Notifications" onClick={() => setShowNotif(v => !v)}>
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="dash-icon-btn" aria-label="Aide" onClick={() => showToast('Centre d’aide → bientôt', 'info')}>
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className="dash-icon-btn dash-logout" aria-label="Déconnexion" onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </nav>
        {/* Mobile hamburger - toggles to X when menu open */}
        <button className="dash-topbar-burger dash-mobile-only" aria-label={showMobileMenu ? "Fermer" : "Menu"} onClick={() => setShowMobileMenu(v => !v)}>
          <span className="material-symbols-outlined">{showMobileMenu ? "close" : "menu"}</span>
        </button>
      </header>
      <div className="dash-green-line" />
      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} onLogout={handleLogout} timeStr={timeStr} dateShort={shortDate} showToast={showToast} />

      {/* Background */}
      <div className="dash-bg" aria-hidden="true">
        <div className="dash-bg-img" />
        <div className="dash-bg-overlay" />
      </div>

      {/* Mobile blue pill — Figma phone */}
      <div className="dash-mobile-pill dash-mobile-only">
        <div className="dash-mobile-avatar"><span className="material-symbols-outlined">person</span></div>
        <button className="dash-mobile-infos" onClick={() => showToast('Mes infos', 'info')}><span className="dash-dots">•••</span> Infos</button>
        <button className="dash-mobile-edit" aria-label="Modifier" onClick={() => showToast('Édition du profil → bientôt', 'info')}><span className="material-symbols-outlined">edit</span></button>
        <button className="dash-mobile-logout" aria-label="Déconnexion" onClick={handleLogout}><span className="material-symbols-outlined">logout</span></button>
      </div>

      {/* Main */}
      <main className="dash-main">
        {/* Left Profile Card — desktop only */}
        <aside className={`dash-profile ${a}`}>
          <div className="dash-profile-inner">
            <div className="dash-avatar">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
            </div>
            <h2 className="dash-profile-name">{displayName}</h2>
            <p className="dash-profile-role">{user?.role || 'Employé'}</p>

            <div className="dash-pills">
              <div className="dash-pill">
                <span className="dash-pill-label">Direction</span>
                <span className="dash-pill-value">{user?.direction || '—'}</span>
              </div>
              <div className="dash-pill">
                <span className="dash-pill-label">Service</span>
                <span className="dash-pill-value">{user?.service || '—'}</span>
              </div>
            </div>

            <div className="dash-divider" />

            <button className="dash-btn-profile" onClick={() => showToast('Édition du profil → bientôt', 'info')}>
              <span className="material-symbols-outlined">edit</span>
              Modifier mon profil
            </button>

            <button className="dash-btn-logout" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
              Me déconnecter
            </button>
          </div>

          {/* Floating report flag on profile edge — desktop only */}
          <button className="dash-profile-flag" aria-label="Signaler" onClick={() => openReport()}>
            <span className="material-symbols-outlined">flag</span>
          </button>
        </aside>

        {/* Right Dashboard Card */}
        <section className={`dash-board ${a}`}>
          <header className="dash-board-header">
            <div>
              <h1 className="dash-board-title">MON TABLEAU DE BORD</h1>
              <p className="dash-board-subtitle">Gardez un œil sur le récapitulatif de toutes vos informations concernant vos absences.</p>
            </div>
            <button className="dash-refresh" aria-label="Rafraîchir" onClick={() => { showToast('Tableau rafraîchi', 'success'); refresh() }}>
              <span className="material-symbols-outlined">refresh</span>
            </button>
          </header>

          {/* Quick actions — desktop chips + mobile icon circles */}
          <div className="dash-actions">
            <button className="dash-chip" onClick={() => navigate('/nouvelle-demande')}>
              <span className="material-symbols-outlined dash-chip-icon">add_circle</span>
              <span className="dash-chip-label">Nouvelle demande</span>
            </button>
            <button className="dash-chip" onClick={() => navigate('/historique')}>
              <span className="material-symbols-outlined dash-chip-icon">history</span>
              <span className="dash-chip-label">Mes demandes</span>
            </button>
            <button className="dash-chip" onClick={() => navigate('/nouvelle-reprise')}>
              <span className="material-symbols-outlined dash-chip-icon">keyboard_return</span>
              <span className="dash-chip-label">Reprise de service</span>
            </button>
            {canViewTeam && <button className="dash-chip" aria-label="Mon équipe" onClick={() => navigate('/equipe')}>
              <span className="material-symbols-outlined dash-chip-icon" aria-hidden="true">group</span>
              <span className="dash-chip-label">Mon équipe</span>
            </button>}
            <button className="dash-chip has-dot" onClick={() => showToast('3 notifications non lues', 'info')}>
              <span className="material-symbols-outlined dash-chip-icon">notifications</span>
              <span className="dash-chip-label">Notifications (3 non lues)</span>
            </button>
            <button className="dash-chip" onClick={() => showToast('Paramètres → bientôt', 'info')}>
              <span className="material-symbols-outlined dash-chip-icon">settings</span>
              <span className="dash-chip-label">Paramètres</span>
            </button>
            <button className="dash-chip" onClick={() => showToast('Aide → documentation', 'info')}>
              <span className="material-symbols-outlined dash-chip-icon">help</span>
              <span className="dash-chip-label">Aide</span>
            </button>
          </div>
          {/* Mobile icon-only row — Figma phone */}
          <div className={`dash-actions-mobile dash-mobile-only${canViewTeam ? ' dash-actions-mobile--team' : ''}`}>
            <button className="dash-circle-btn" aria-label="Nouvelle demande" onClick={() => navigate('/nouvelle-demande')}><span className="material-symbols-outlined">add</span></button>
            <button className="dash-circle-btn" aria-label="Mes demandes" onClick={() => navigate('/historique')}><span className="material-symbols-outlined">history</span></button>
            <button className="dash-circle-btn" aria-label="Reprise" onClick={() => navigate('/nouvelle-reprise')}><span className="material-symbols-outlined">keyboard_return</span></button>
            {canViewTeam && <button className="dash-circle-btn" aria-label="Mon équipe" title="Mon équipe" onClick={() => navigate('/equipe')}><span className="material-symbols-outlined" aria-hidden="true">group</span></button>}
            <button className="dash-circle-btn" aria-label="Notifications" onClick={() => setShowNotif(v => !v)}><span className="material-symbols-outlined">notifications</span></button>
            <button className="dash-circle-btn" aria-label="Paramètres" onClick={() => showToast('Paramètres', 'info')}><span className="material-symbols-outlined">settings</span></button>
            <button className="dash-circle-btn" aria-label="Aide" onClick={() => showToast('Aide', 'info')}><span className="material-symbols-outlined">help</span></button>
          </div>

          {/* Stats Grid */}
          <div className="dash-stats">
            <article className="dash-stat dash-stat-blue" onClick={() => navigate('/historique')}>
              <div className="dash-stat-icon">
                <span className="material-symbols-outlined">article</span>
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-number">{demands.length}</span>
                <span className="dash-stat-label">DEMANDES SOUMISES</span>
              </div>
            </article>

            <article className="dash-stat dash-stat-green" onClick={() => navigate('/historique?filter=%C3%A9tat&search=Approuv%C3%A9e')}>
              <div className="dash-stat-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-number">{demands.filter(d => d.statut === 'Approuvée').length}</span>
                <span className="dash-stat-label">DEMANDES APPROUVÉES</span>
              </div>
            </article>

            <article className="dash-stat dash-stat-yellow" onClick={() => navigate('/historique?filter=%C3%A9tat&search=En%20attente')}>
              <div className="dash-stat-icon">
                <span className="material-symbols-outlined">schedule</span>
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-number">{demands.filter(d => d.statut === 'En attente').length}</span>
                <span className="dash-stat-label">DEMANDE EN ATTENTE</span>
              </div>
            </article>

            <article className="dash-stat dash-stat-gray" onClick={() => showToast('19 jours restants — planifiez vos congés', 'info')}>
              <div className="dash-stat-icon dash-stat-icon-text">123</div>
              <div className="dash-stat-body">
                <span className="dash-stat-number">19</span>
                <span className="dash-stat-label">JOURS RESTANTS POUR 2026</span>
              </div>
            </article>
          </div>
        </section>
      </main>

      {/* Notifications popover */}
      {showNotif && (
        <div className="dash-notif-pop">
          <header className="dash-notif-head">
            <strong>Notifications</strong>
            <button onClick={() => setShowNotif(false)} aria-label="Fermer"><span className="material-symbols-outlined">close</span></button>
          </header>
          <ul className="dash-notif-list">
            <li><span className="dot red" /> Congé approuvé — 12/10/2026</li>
            <li><span className="dot blue" /> Nouvelle politique d’absence</li>
            <li><span className="dot green" /> Rappel : reprise le 20/10</li>
          </ul>
          <button className="dash-notif-more" onClick={() => { setShowNotif(false); showToast('3 notifications marquées lues', 'success') }}>Tout marquer comme lu</button>
        </div>
      )}

      {/* Floating help */}
      <button className="dash-fab" aria-label="Signaler un problème" onClick={() => openReport()}>
        <span className="material-symbols-outlined">flag</span>
      </button>

      <LogoutDialog isOpen={showLogoutDialog} onConfirm={confirmLogout} onCancel={() => setShowLogoutDialog(false)} />

      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon"><span className="material-symbols-outlined toast-material">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span></div>
            <span>{t.message}</span>
            <button className="toast-close" aria-label="Fermer" onClick={() => dismissToast(t.id)}><span className="material-symbols-outlined">close</span></button>
          </div>
        ))}
      </div>
    </div>
  )
}
