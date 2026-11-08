import { useLocation, useNavigate } from 'react-router-dom'
import './AppMenus.css'
import { getCurrentUser, hasSubordinates } from '../data/demoDb.ts'

type AccountMenuProps = {
  isOpen: boolean
  onClose: () => void
  displayName?: string
  onEditProfile?: () => void
  onLogout: () => void
}

export function AccountMenu({ isOpen, onClose, displayName = 'Prénom NOM', onEditProfile, onLogout }: AccountMenuProps): React.ReactElement | null {
  if (!isOpen) return null
  const user = getCurrentUser()
  return (
    <>
      <div className="account-menu-overlay" onClick={onClose} aria-hidden="true" />
      <div className="account-menu" role="dialog" aria-label="Menu compte">
        <div className="account-menu-header">
          <div className="account-menu-avatar"><span className="material-symbols-outlined">person</span></div>
          <div className="account-menu-info">
            <div className="account-menu-name">{displayName}</div>
            <div className="account-menu-role">{user?.role || 'Descriptif du poste/rôle'}</div>
          </div>
        </div>
        <div className="account-menu-pills">
          <div className="account-menu-pill"><span className="account-menu-pill-label">Direction</span><span className="account-menu-pill-value">{user?.direction || 'Nom de la direction'}</span></div>
          <div className="account-menu-pill"><span className="account-menu-pill-label">Service</span><span className="account-menu-pill-value">{user?.service || 'Nom du service'}</span></div>
        </div>
        <div className="account-menu-divider" />
        <button className="account-menu-btn account-menu-btn-edit" onClick={() => { onClose(); onEditProfile?.() }}>
          <span className="material-symbols-outlined">edit</span> Modifier mon profil
        </button>
        <button className="account-menu-btn account-menu-btn-logout" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span> Me déconnecter
        </button>
      </div>
    </>
  )
}

type MobileMenuProps = {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
  timeStr: string
  dateShort: string
  showToast?: (msg: string, type?: 'success' | 'info' | 'error') => void
}

export function MobileMenu({ isOpen, onClose, onLogout, showToast }: MobileMenuProps): React.ReactElement | null {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()
  const isTeamPage = pathname.replace(/\/+$/, '') === '/equipe'
  if (!isOpen) return null

  const handleNav = (path: string | null, toastMsg?: string): void => {
    onClose()
    if (path) navigate(path)
    else if (toastMsg) showToast?.(toastMsg, 'info')
  }

  return (
    <>
      <div className="mobile-menu-overlay" onClick={onClose} aria-hidden="true" />
      <div className="mobile-menu" role="dialog" aria-label="Menu navigation">
        <nav className="mobile-menu-body">
          <button className="mobile-menu-item" onClick={() => handleNav('/nouvelle-demande')}>
            <span className="material-symbols-outlined">add</span> NOUVELLE DEMANDE D&apos;ABSENCE
          </button>
          <button className="mobile-menu-item" onClick={() => handleNav('/nouvelle-reprise')}>
            <span className="material-symbols-outlined">keyboard_return</span> NOUVELLE FICHE DE REPRISE
          </button>
          <button className="mobile-menu-item" onClick={() => handleNav(null, 'Brouillons → bientôt disponible')}>
            <span className="material-symbols-outlined">description</span> MES BROUILLONS
          </button>
          <button className="mobile-menu-item" onClick={() => handleNav('/historique')}>
            <span className="material-symbols-outlined">history</span> MON HISTORIQUE
          </button>
          {user && hasSubordinates(user.id) && !isTeamPage && <button className="mobile-menu-item" onClick={() => handleNav('/equipe')}>
            <span className="material-symbols-outlined">group</span> MON ÉQUIPE
          </button>}
          <button className="mobile-menu-item" onClick={() => handleNav(null, '3 notifications non lues')}>
            <span className="material-symbols-outlined">notifications</span> NOTIFICATIONS <span className="mobile-menu-badge">3</span>
          </button>
          <button className="mobile-menu-item" onClick={() => handleNav(null, 'Centre d’aide → bientôt')}>
            <span className="material-symbols-outlined">help</span> CENTRE D&apos;AIDE
          </button>
          <button className="mobile-menu-item" onClick={() => handleNav(null, 'Mon profil → bientôt')}>
            <span className="material-symbols-outlined">person</span> MON PROFIL
          </button>
        </nav>
        <footer className="mobile-menu-footer">
          <button className="mobile-menu-logout" onClick={onLogout}>
            <span className="material-symbols-outlined">logout</span> ME DÉCONNECTER
          </button>
        </footer>
      </div>
    </>
  )
}
