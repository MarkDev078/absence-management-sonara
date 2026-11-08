import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import './DemandeDetail.css'
import { MobileMenu } from '../components/AppMenus.tsx'
import LogoutDialog from '../components/LogoutDialog.tsx'
import { useLiveClock } from '../hooks/useLiveClock.ts'
import { CreateMenu, TeamNavButton } from '../components/AppActions.tsx'
import { useReport } from '../components/ReportDialog.tsx'
import PageShell from '../components/PageShell.tsx'
import { cancelDemand, getCurrentUser, getDemand } from '../data/demoDb.ts'
import type { Absence as DemandFull } from '../data/demoDb.ts'
import { displayPhones } from '../data/phones.ts'

type Toast = { id: number; message: string; type: 'success' | 'info' | 'error' }
function loadDemandById(id: number): DemandFull | null {
  const user = getCurrentUser(); const demand = getDemand(id)
  return user && demand?.ownerId === user.id ? demand : null
}

function formatDateLong(iso?: string): string {
  if (!iso) return 'XX/XX/XXXX'
  const d = new Date(iso + (iso.includes('T') ? '' : 'T12:00:00'))
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
function formatPeriodeQuart(periode?: string | null, quart?: string | null): string {
  if (quart) {
    const map: Record<string, string> = { matin: 'Matin', 'apres-midi': 'Après-midi', nuit: 'Nuit' }
    return map[quart] ?? quart
  }
  if (periode) {
    return periode === 'matin' ? 'Matin' : periode === 'soir' ? 'Soir' : periode
  }
  return 'Période/Quart'
}
function formatEmission(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const date = d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  return `${date} - ${time}`
}

function getOperator(digits: string): string | null {
  if (!digits) return null
  const d = digits.replace(/\D/g, '')
  if (d.length !== 9) return null
  if (d.startsWith('2')) {
    const pref3 = d.slice(0, 3)
    if (['222', '233', '242', '243'].includes(pref3)) return 'camtel'
    return null
  }
  if (!d.startsWith('6')) return null
  const pref3 = d.slice(0, 3)
  const n = parseInt(pref3, 10)
  if ((n >= 655 && n <= 659) || (n >= 685 && n <= 689) || (n >= 690 && n <= 699)) return 'orange'
  if ((n >= 650 && n <= 654) || (n >= 670 && n <= 679) || (n >= 680 && n <= 684)) return 'mtn'
  if (n >= 620 && n <= 629) return 'blue'
  if (n >= 660 && n <= 669) return 'nexttel'
  return null
}
function formatPhone(digits: string): string {
  const d = digits.replace(/\D/g, '').slice(0, 9)
  if (!d) return ''
  let out = d[0]
  for (let i = 1; i < d.length; i += 2) out += ' ' + d.slice(i, i + 2)
  return out.trim()
}
const operatorLogo: Record<string, string> = {
  orange: '/assets/orange.png',
  mtn: '/assets/mtn.png',
  camtel: '/assets/camtel.png',
  blue: '/assets/blue.png',
  nexttel: '/assets/nexttel.png',
}

export default function DemandeDetail(): React.ReactElement {
  const navigate = useNavigate()
  const user = getCurrentUser()
  const { openReport } = useReport()
  const location = useLocation() as { state?: { from?: string; returnTo?: string } }
  const { id } = useParams()
  const numericId = Number(id)
  const { timeStr, dateStr, shortDate } = useLiveClock()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [demand, setDemand] = useState<DemandFull | null>(() => loadDemandById(numericId))
  const showSuccess = location.state?.from === 'submit'

  useEffect(() => {
    setDemand(loadDemandById(numericId))
  }, [numericId])
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const showToast = (m: string, type: Toast['type'] = 'info') => {
    const i = Date.now() + Math.random()
    setToasts(p => [...p, { id: i, message: m, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== i)), 3200)
  }
  const dismissToast = (i: number) => setToasts(p => p.filter(t => t.id !== i))
  const handleLogout = (): void => setShowLogoutDialog(true)
  const confirmLogout = (): void => { setShowLogoutDialog(false); localStorage.removeItem('sonara_user'); navigate('/') }
  const a = mounted ? 'animated' : ''

  const handleCancelConfirm = () => {
    if (!demand) return
    if (!cancelDemand(demand.id)) { showToast('Cette demande ne peut plus être annulée.', 'error'); setShowCancelDialog(false); return }
    // clear success flag if matches
    if (localStorage.getItem('sonara_last_success_id') === String(demand.id)) {
      localStorage.removeItem('sonara_last_success_id')
    }
    setShowCancelDialog(false)
    showToast('Demande annulée', 'success')
    setTimeout(() => navigate('/historique'), 400)
  }

  if (!demand) return <PageShell><section className="detail-card animated"><p>Demande introuvable ou inaccessible.</p><button className="detail-back" onClick={() => navigate('/historique')}>Retour</button></section></PageShell>

  const isEnAttente = demand.statut === 'En attente'
  const isFromHistorique = location.state?.from === 'historique' || !showSuccess
  const dateDebutStr = demand.dateDebut ? `${formatDateLong(demand.dateDebut)} - ${formatPeriodeQuart(demand.periodeDebut, demand.quartDebut)}` : 'XX/XX/XXXX - [Période/Quart]'
  const dateFinStr = demand.dateFin ? `${formatDateLong(demand.dateFin)} - ${formatPeriodeQuart(demand.periodeFin, demand.quartFin)}` : 'XX/XX/XXXX - [Période/Quart]'
  const emissionStr = formatEmission(demand.createdAt ?? demand.dateSoumission)
  const natureStr = demand.nature ? demand.nature : '[Nature sélectionnée]'
  const motifStr = demand.motif ? demand.motif : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt...'
  const contacts = displayPhones(demand.phones)

  return (
    <div className="dashboard-root hist-root detail-root">
      <header className={`dash-topbar ${a}`}>
        <div className="dash-topbar-left"><div className="dash-logo-wrap"><img src="/assets/SONARA_Logo.png" alt="SONARA" className="dash-logo" /></div><div className="dash-time"><span className="dash-time-hour">{timeStr}</span><span className="dash-time-date">{dateStr}</span><span className="dash-time-short">{shortDate}</span></div></div>
        <nav className="dash-topbar-right dash-desktop-only" aria-label="Actions rapides">
          <button className="dash-icon-btn" aria-label="Accueil" onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined">home</span></button>
          <CreateMenu />
          <button className="dash-icon-btn" aria-label="Documents" onClick={() => showToast('Documents → bientôt', 'info')}><span className="material-symbols-outlined">description</span></button>
          <button className="dash-icon-btn" aria-label="Historique" onClick={() => navigate('/historique')}><span className="material-symbols-outlined">history</span></button>
          <TeamNavButton />
          <button className="dash-icon-btn" aria-label="Notifications" onClick={() => showToast('Notifications', 'info')}><span className="material-symbols-outlined">notifications</span></button>
          <button className="dash-icon-btn" aria-label="Aide" onClick={() => showToast('Centre d’aide → bientôt', 'info')}><span className="material-symbols-outlined">help</span></button>
          <button className="dash-icon-btn dash-logout" aria-label="Déconnexion" onClick={handleLogout}><span className="material-symbols-outlined">logout</span></button>
        </nav>
        <button className="dash-topbar-burger dash-mobile-only" aria-label={showMobileMenu ? 'Fermer' : 'Menu'} onClick={() => setShowMobileMenu(v => !v)}><span className="material-symbols-outlined">{showMobileMenu ? 'close' : 'menu'}</span></button>
      </header>
      <div className="dash-green-line" />
      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} onLogout={handleLogout} timeStr={timeStr} dateShort={shortDate} showToast={showToast} />
      <div className="dash-bg" aria-hidden="true"><div className="dash-bg-img" /><div className="dash-bg-overlay" /></div>

      <main className="dash-main">
        <aside className={`dash-profile ${a}`}>
          <div className="dash-profile-inner">
            <div className="dash-avatar"><span className="material-symbols-outlined">person</span></div>
            <h2 className="dash-profile-name">{user?.name || 'Utilisateur'}</h2>
            <p className="dash-profile-role">{user?.role || 'Employé'}</p>
            <div className="dash-pills">
              <div className="dash-pill"><span className="dash-pill-label">Direction</span><span className="dash-pill-value">{user?.direction || '—'}</span></div>
              <div className="dash-pill"><span className="dash-pill-label">Service</span><span className="dash-pill-value">{user?.service || '—'}</span></div>
            </div>
            <div className="dash-divider" />
            <button className="dash-btn-profile" onClick={() => showToast('Édition du profil → bientôt', 'info')}><span className="material-symbols-outlined">edit</span> Modifier mon profil</button>
            <button className="dash-btn-logout" onClick={handleLogout}><span className="material-symbols-outlined">logout</span> Me déconnecter</button>
          </div>
          <button className="dash-profile-flag" aria-label="Signaler" onClick={() => openReport()}><span className="material-symbols-outlined">flag</span></button>
        </aside>

        <section className={`detail-card ${a}`}>
          <div className="detail-topbar">
            {isFromHistorique ? (
              <button className="detail-back" onClick={() => navigate(location.state?.returnTo?.startsWith('/historique') ? location.state.returnTo : '/historique')}><span className="material-symbols-outlined">arrow_back</span> Retour vers l'historique</button>
            ) : (
              <button className="detail-back" onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined">home</span> Retour au tableau de bord</button>
            )}
            <span className={`detail-statut-pill statut-${isEnAttente ? 'attente' : demand.statut === 'Approuvée' ? 'ok' : 'ko'}`}><span className="material-symbols-outlined">{isEnAttente ? 'schedule' : demand.statut === 'Approuvée' ? 'check_circle' : 'cancel'}</span> Statut actuel : {demand.statut}</span>
          </div>

          {showSuccess && (
            <div className="detail-success">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Votre demande d’absence a été soumise avec succès ! Elle est désormais en attente d’approbation par votre hiérarchie.</span>
            </div>
          )}

          <div className="detail-grid">
            <div className="detail-col">
              <div className="detail-field">
                <label>Nature de l’absence sollicitée</label>
                <div className="detail-input"><span>{natureStr}</span><span className="detail-input-icon"><span className="material-symbols-outlined">category</span></span></div>
              </div>
              <div className="detail-field">
                <label>Motif de l’absence sollicitée</label>
                <div className="detail-textarea"><span>{motifStr}</span><span className="detail-input-icon"><span className="material-symbols-outlined">subject</span></span></div>
              </div>
              {contacts.length > 0 && <div className="detail-field">
                <label>Mes contacts durant l’absence sollicitée</label>
                <div className="detail-contacts-list">
                  {contacts.map((p, idx) => {
                    const op = p.digits.replace(/\D/g, '').length === 9 ? (p.operator ?? getOperator(p.digits)) : null
                    const logo = op ? operatorLogo[op] : null
                    return (
                      <div key={p.id ?? idx} className="detail-input">
                        <span>{`(+237) ${formatPhone(p.digits)}`}</span>
                        <span className={`detail-input-icon ${logo ? 'has-logo' : 'blue'}`}>
                          {logo ? <img src={logo} alt={op ?? ''} className="detail-op-logo" /> : <span className="material-symbols-outlined">public</span>}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>}
            </div>
            <div className="detail-col">
              <div className="detail-field">
                <label>Date de début de l’absence sollicitée</label>
                <div className="detail-input"><span>{dateDebutStr}</span><span className="detail-input-icon"><span className="material-symbols-outlined">calendar_month</span></span></div>
              </div>
              <div className="detail-field">
                <label>Date de fin prévue de l’absence sollicitée</label>
                <div className="detail-input"><span>{dateFinStr}</span><span className="detail-input-icon"><span className="material-symbols-outlined">calendar_month</span></span></div>
              </div>
              <div className="detail-field">
                <label>Date d’émission de l’absence sollicitée</label>
                <div className="detail-input"><span>{emissionStr}</span><span className="detail-input-icon"><span className="material-symbols-outlined">send</span></span></div>
              </div>
              {isEnAttente && (
                <button className="detail-cancel" onClick={() => setShowCancelDialog(true)}><span className="material-symbols-outlined">block</span> Annuler ma demande</button>
              )}
            </div>
          </div>
        </section>
      </main>

      {showCancelDialog && (
        <div className="avert-overlay" onClick={() => setShowCancelDialog(false)}>
          <div className="avert-dialog" onClick={e => e.stopPropagation()}>
            <header className="avert-header">
              <h2>AVERTISSEMENT</h2>
              <span className="material-symbols-outlined">warning</span>
            </header>
            <div className="avert-body">
              <p>Si vous confirmez cette action, cette demande sera définitivement annulée et supprimée.</p>
              <p>Au cas où il s’agirait d’une erreur, vous devrez reprendre le processus à zéro et soumettre une nouvelle demande d’absence.</p>
              <p className="avert-ask">Voulez-vous vraiment annuler cette demande ?</p>
            </div>
            <footer className="avert-footer">
              <button className="avert-btn avert-btn-danger" onClick={handleCancelConfirm}><span className="material-symbols-outlined">check</span> CONFIRMER</button>
              <button className="avert-btn avert-btn-cancel" onClick={() => setShowCancelDialog(false)}><span className="material-symbols-outlined">undo</span> REVENIR</button>
            </footer>
          </div>
        </div>
      )}

      <LogoutDialog isOpen={showLogoutDialog} onConfirm={confirmLogout} onCancel={() => setShowLogoutDialog(false)} />

      <div className="toast-container" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon"><span className="material-symbols-outlined toast-material">{t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}</span></div>
            <span>{t.message}</span>
            <button className="toast-close" onClick={() => dismissToast(t.id)}><span className="material-symbols-outlined">close</span></button>
          </div>
        ))}
      </div>
      <button className="dash-fab" aria-label="Signaler un problème" onClick={() => openReport()}><span className="material-symbols-outlined">flag</span></button>
    </div>
  )
}
