import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PageShell from '../components/PageShell.tsx'
import { formatRelative, getCurrentUser, getUser, hasSubordinates, myDemands, myReprises, teamDemands, teamReprises } from '../data/demoDb.ts'
import type { Absence, Reprise } from '../data/demoDb.ts'
import './Historique.css'
import './Records.css'

type Scope = 'tout' | 'numero' | 'demandeur' | 'nature' | 'date' | 'etat'
type Tab = 'demandes' | 'reprises'
const normalize = (s: string): string => s.toLocaleLowerCase('fr-FR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
function readScope(s: string | null): Scope {
  const v = normalize(s || '')
  if (v === 'etat') return 'etat'
  if (v === 'numero' || v === 'n' || v === 'n°') return 'numero'
  if (v === 'demandeur') return 'demandeur'
  if (v === 'nature' || v === 'nature absence') return 'nature'
  if (v === 'date' || v === 'date soumission') return 'date'
  return v === 'tout' ? 'tout' : 'etat'
}
function etatClass(s: string): string { return s === 'Approuvée' ? 'ok' : s === 'Rejetée' ? 'ko' : 'attente' }
function icon(s: string): string { return s === 'Approuvée' ? 'check_circle' : s === 'Rejetée' ? 'cancel' : 'schedule' }

export default function Historique({ team = false }: { team?: boolean }): React.ReactElement {
  const user = getCurrentUser(); const navigate = useNavigate(); const location = useLocation(); const [params, setParams] = useSearchParams()
  const tab: Tab = params.get('tab') === 'reprises' ? 'reprises' : 'demandes'
  const [scope, setScope] = useState<Scope>(() => readScope(params.get('filter')))
  const [search, setSearch] = useState(() => params.get('search') || '')
  const [version, setVersion] = useState(0)
  useEffect(() => {
    setScope(readScope(params.get('filter')))
    setSearch(params.get('search') || '')
  }, [params])
  useEffect(() => {
    const refresh = () => setVersion(v => v + 1)
    window.addEventListener('storage', refresh); window.addEventListener('sonara-db-change', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('sonara-db-change', refresh) }
  }, [])
  const authorized = !!user && (!team || hasSubordinates(user.id))
  const demands = useMemo(() => authorized ? (team ? teamDemands() : myDemands()) : [], [team, authorized, version])
  const reprises = useMemo(() => authorized ? (team ? teamReprises() : myReprises()) : [], [team, authorized, version])
  const source: (Absence | Reprise)[] = tab === 'demandes' ? demands : reprises
  const rows = useMemo(() => {
    const q = normalize(search.trim())
    return [...source].sort((a, b) => new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime()).filter(r => {
      if (!q) return true
      const subject = 'nature' in r ? r.nature : (r.absenceNature || 'Non enregistrée')
      const owner = getUser(r.ownerId)?.name || ''
      const { main, sub } = formatRelative(r.dateSoumission)
      const hay: Record<Scope, string> = { numero: String(r.id), demandeur: owner, nature: subject, date: `${main} ${sub} ${r.dateSoumission}`, etat: r.statut, tout: `${r.id} ${owner} ${subject} ${main} ${sub} ${r.statut}` }
      return normalize(hay[scope]).includes(q)
    })
  }, [source, search, scope])
  const switchTab = (next: Tab) => {
    const nextParams = new URLSearchParams(params)
    if (next === 'reprises') nextParams.set('tab', 'reprises'); else nextParams.delete('tab')
    nextParams.set('filter', scope)
    if (search.trim()) nextParams.set('search', search); else nextParams.delete('search')
    setParams(nextParams)
  }
  const openRecord = (r: Absence | Reprise) => {
    const root = team ? '/equipe' : ''
    const type = tab === 'demandes' ? 'demande' : 'reprise'
    const backParams = new URLSearchParams(params); backParams.set('filter', scope)
    if (search.trim()) backParams.set('search', search); else backParams.delete('search')
    const returnTo = `${location.pathname}?${backParams.toString()}`
    navigate(`${root}/${type}/${r.id}`, { state: { from: team ? 'equipe' : 'historique', returnTo } })
  }
  if (!authorized) return <PageShell><section className="hist-card animated"><h1 className="hist-title">Accès indisponible</h1><p>Cette page est réservée aux employés ayant des subordonnés.</p></section></PageShell>
  return <PageShell><section className="hist-card animated records-card">
    <header className="hist-header"><div><h1 className="hist-title">{team ? 'MON ÉQUIPE' : 'MON HISTORIQUE'}</h1>
      <p className="hist-subtitle">{team ? 'Consultez rapidement et accédez simplement à toutes les demandes d’absences et fiches de reprise de service soumises par les membres de votre équipe jusqu’à ce jour.' : 'Consultez rapidement et accédez simplement à toutes vos demandes d’absences et fiches de reprise de service que vous avez soumises jusqu’à ce jour.'}</p></div>
      <button className="hist-icon-btn" aria-label="Rafraîchir" onClick={() => setVersion(v => v + 1)}><span className="material-symbols-outlined">refresh</span></button>
    </header>
    <div className="records-tabs" role="tablist" aria-label="Type de document">
      <button role="tab" aria-selected={tab === 'demandes'} className={tab === 'demandes' ? 'active' : ''} onClick={() => switchTab('demandes')}><span className="material-symbols-outlined">article</span> Demandes d’absences</button>
      <button role="tab" aria-selected={tab === 'reprises'} className={tab === 'reprises' ? 'active' : ''} onClick={() => switchTab('reprises')}><span className="material-symbols-outlined">keyboard_return</span> Fiches de reprise</button>
    </div>
    <div className="hist-search-wrap">
      <div className="hist-search-filter"><select aria-label="Chercher dans" value={scope} onChange={e => setScope(e.target.value as Scope)}>
        <option value="tout">Chercher dans : Tout</option>
        {!team && <option value="numero">Chercher dans : N°</option>}
        {team && <option value="demandeur">Chercher dans : Demandeur</option>}
        <option value="nature">Chercher dans : {tab === 'demandes' ? 'Nature absence' : 'Absence concernée'}</option>
        <option value="date">Chercher dans : Date soumission</option><option value="etat">Chercher dans : État</option>
      </select><span className="material-symbols-outlined">keyboard_arrow_down</span></div>
      <input aria-label="Rechercher" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
      <button className="hist-search-btn" aria-label="Rechercher"><span className="material-symbols-outlined">search</span></button>
    </div>
    <div className="hist-table-wrap records-table-wrap"><table className="hist-table"><thead><tr>
      <th>{team ? 'Demandeur' : 'N°'}</th><th>{tab === 'demandes' ? 'Nature absence' : 'Absence concernée'}</th><th>Date soumission</th><th>État</th><th className="hist-th-icon" aria-label="Icône d’état" />
    </tr></thead><tbody>
      {rows.length === 0 ? <tr><td colSpan={5} className="hist-empty">{search ? 'Aucun résultat correspondant.' : tab === 'demandes' ? 'Aucune demande pour le moment.' : 'Aucune fiche de reprise pour le moment.'}</td></tr> : rows.map(r => {
        const { main, sub } = formatRelative(r.dateSoumission); const status = etatClass(r.statut); const owner = getUser(r.ownerId)
        return <tr key={r.id} className={`row-${status}`} tabIndex={0} role="link" aria-label={`Ouvrir ${tab === 'demandes' ? 'la demande' : 'la fiche'} ${r.id}`} onClick={() => openRecord(r)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openRecord(r) } }}>
          <td className="hist-td-num">{team ? <span className="record-person"><span className="record-avatar"><span className="material-symbols-outlined">person</span></span><span title={owner?.name}>{owner?.name || 'Utilisateur'}</span></span> : r.id}</td>
          <td className="hist-td-nature">{'nature' in r ? r.nature : (r.absenceNature || 'Non enregistrée')}</td>
          <td className="hist-td-date"><span className="hist-date-main">{main}</span><span className="hist-date-sub">{sub}</span></td>
          <td className={`hist-td-etat statut-${status}`}>{r.statut}</td><td className="hist-td-icon"><span className={`material-symbols-outlined icon-${status}`}>{icon(r.statut)}</span></td>
        </tr>
      })}
    </tbody></table></div>
  </section></PageShell>
}
