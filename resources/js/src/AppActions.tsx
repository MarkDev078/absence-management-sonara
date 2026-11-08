import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getCurrentUser, hasSubordinates } from '../data/demoDb.ts'

export function CreateMenu(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useEffect(() => {
    if (!open) return
    const outside = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', outside); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', outside); document.removeEventListener('keydown', esc) }
  }, [open])
  return <div className="create-menu-wrap" ref={ref}>
    <button className="create-menu-trigger" aria-label="Créer" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <span className="material-symbols-outlined">add_circle</span><span className="material-symbols-outlined create-chevron">keyboard_arrow_down</span>
    </button>
    {open && <div className="create-menu-list" role="menu">
      <button role="menuitem" onClick={() => { setOpen(false); navigate('/nouvelle-demande') }}><span className="material-symbols-outlined">description</span> Demande d’absence</button>
      <button role="menuitem" onClick={() => { setOpen(false); navigate('/nouvelle-reprise') }}><span className="material-symbols-outlined">keyboard_return</span> Fiche de reprise</button>
    </div>}
  </div>
}
export function TeamNavButton(): React.ReactElement | null {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()
  const isTeamPage = pathname.replace(/\/+$/, '') === '/equipe'
  if (!user || !hasSubordinates(user.id) || isTeamPage) return null
  return <button className="dash-icon-btn" aria-label="Mon équipe" title="Mon équipe" onClick={() => navigate('/equipe')}><span className="material-symbols-outlined">group</span></button>
}
