import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AccountMenu, MobileMenu } from './AppMenus.tsx'
import { CreateMenu, TeamNavButton } from './AppActions.tsx'
import { ReportFab } from './ReportDialog.tsx'
import LogoutDialog from './LogoutDialog.tsx'
import { getCurrentUser } from '../data/demoDb.ts'
import { useLiveClock } from '../hooks/useLiveClock.ts'

type Props = { children: ReactNode; form?: boolean; backPath?: string }
export default function PageShell({ children, form = false, backPath = '/dashboard' }: Props): React.ReactElement {
  const navigate = useNavigate(); const user = getCurrentUser(); const { timeStr, dateStr, shortDate } = useLiveClock()
  const [mobile, setMobile] = useState(false); const [logout, setLogout] = useState(false); const [account, setAccount] = useState(false); const [toast, setToast] = useState('')
  const info = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3500) }
  const confirmLogout = () => { localStorage.removeItem('sonara_user'); setLogout(false); navigate('/') }
  return <div className={form ? 'nd-root reprise-shell' : 'dashboard-root hist-root'}>
    <header className="dash-topbar animated">
      <div className="dash-topbar-left">
        {form && <button className="nd-back-btn" aria-label="Retour" onClick={() => navigate(backPath)}><span className="material-symbols-outlined">arrow_back</span></button>}
        <div className="dash-logo-wrap"><img src="/assets/SONARA_Logo.png" alt="SONARA" className="dash-logo" /></div>
        <div className="dash-time"><span className="dash-time-hour">{timeStr}</span><span className="dash-time-date">{dateStr}</span><span className="dash-time-short">{shortDate}</span></div>
      </div>
      <nav className="dash-topbar-right dash-desktop-only" aria-label="Actions rapides">
        <button className="dash-icon-btn" aria-label="Accueil" onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined">home</span></button>
        <CreateMenu />
        <button className="dash-icon-btn" aria-label="Documents" onClick={() => info('Documents : bientôt disponible')}><span className="material-symbols-outlined">description</span></button>
        <button className="dash-icon-btn" aria-label="Historique" onClick={() => navigate('/historique')}><span className="material-symbols-outlined">history</span></button>
        <TeamNavButton />
        <button className="dash-icon-btn" aria-label="Notifications" onClick={() => info('Notifications de démonstration')}><span className="material-symbols-outlined">notifications</span></button>
        <button className="dash-icon-btn" aria-label="Aide" onClick={() => info('Centre d’aide : bientôt disponible')}><span className="material-symbols-outlined">help</span></button>
        {form ? <button className="nd-user-pill" aria-label="Profil" onClick={() => setAccount(v => !v)}><span className="nd-user-name">{user?.name || 'Profil'}</span><span className="nd-user-avatar"><span className="material-symbols-outlined">person</span></span></button> : <button className="dash-icon-btn dash-logout" aria-label="Déconnexion" onClick={() => setLogout(true)}><span className="material-symbols-outlined">logout</span></button>}
      </nav>
      <button className="dash-topbar-burger dash-mobile-only" aria-label={mobile ? 'Fermer' : 'Menu'} onClick={() => setMobile(v => !v)}><span className="material-symbols-outlined">{mobile ? 'close' : 'menu'}</span></button>
    </header>
    <div className="dash-green-line" />
    <MobileMenu isOpen={mobile} onClose={() => setMobile(false)} onLogout={() => { setMobile(false); setLogout(true) }} timeStr={timeStr} dateShort={shortDate} showToast={info} />
    <AccountMenu isOpen={account} onClose={() => setAccount(false)} onLogout={() => { setAccount(false); setLogout(true) }} displayName={user?.name} onEditProfile={() => info('Modification du profil : bientôt disponible')} />
    <div className="dash-bg" aria-hidden="true"><div className="dash-bg-img" /><div className="dash-bg-overlay" /></div>
    {form ? children : <main className="dash-main">
      <aside className="dash-profile animated"><div className="dash-profile-inner">
        <div className="dash-avatar"><span className="material-symbols-outlined">person</span></div>
        <h2 className="dash-profile-name">{user?.name || 'Utilisateur'}</h2><p className="dash-profile-role">{user?.role}</p>
        <div className="dash-pills"><div className="dash-pill"><span className="dash-pill-label">Direction</span><span className="dash-pill-value">{user?.direction}</span></div><div className="dash-pill"><span className="dash-pill-label">Service</span><span className="dash-pill-value">{user?.service}</span></div></div>
        <div className="dash-divider" /><button className="dash-btn-profile" onClick={() => info('Modification du profil : bientôt disponible')}><span className="material-symbols-outlined">edit</span> Modifier mon profil</button>
        <button className="dash-btn-logout" onClick={() => setLogout(true)}><span className="material-symbols-outlined">logout</span> Me déconnecter</button>
      </div></aside>{children}</main>}
    {!form && <ReportFab />}
    <LogoutDialog isOpen={logout} onConfirm={confirmLogout} onCancel={() => setLogout(false)} />
    {toast && <div className="toast-container" aria-live="polite"><div className="toast"><span>{toast}</span><button className="toast-close" aria-label="Fermer" onClick={() => setToast('')}><span className="material-symbols-outlined">close</span></button></div></div>}
  </div>
}
