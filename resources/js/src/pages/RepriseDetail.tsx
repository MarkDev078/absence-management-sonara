import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.tsx'
import DocumentList from '../components/DocumentList.tsx'
import { formatDate, formatDateTime, getCurrentUser, getReprise } from '../data/demoDb.ts'
import './DemandeDetail.css'
import './ManagerDetail.css'
import './RepriseDetail.css'
export default function RepriseDetail(): React.ReactElement {
  const navigate = useNavigate(); const location = useLocation(); const { id } = useParams(); const r = getReprise(Number(id)); const user = getCurrentUser()
  const state = location.state as { from?: string; returnTo?: string } | null
  if (!r || r.ownerId !== user?.id) return <PageShell><section className="detail-card animated"><p>Fiche introuvable ou inaccessible.</p><button className="detail-back" onClick={() => navigate('/historique?tab=reprises')}>Retour</button></section></PageShell>
  const ok = state?.from === 'submit'; const status = r.statut === 'Approuvée' ? 'ok' : r.statut === 'Rejetée' ? 'ko' : 'attente'; const icon = status === 'ok' ? 'check_circle' : status === 'ko' ? 'cancel' : 'schedule'
  return <PageShell><section className="detail-card animated reprise-detail-card">
    <div className="detail-topbar"><button className="detail-back" onClick={() => navigate(ok ? '/dashboard' : state?.returnTo?.startsWith('/historique') ? state.returnTo : '/historique?tab=reprises')}><span className="material-symbols-outlined">{ok ? 'home' : 'arrow_back'}</span> {ok ? 'Retour au tableau de bord' : 'Retour vers l’historique'}</button><span className={`detail-statut-pill statut-${status}`}><span className="material-symbols-outlined">{icon}</span> Statut actuel : {r.statut}</span></div>
    {ok && <div className="detail-success"><span className="material-symbols-outlined">check_circle</span><span>Votre fiche de reprise a été soumise avec succès ! Elle est désormais en attente de validation par votre hiérarchie.</span></div>}
    <div className="detail-grid"><div className="detail-col">
      <div className="detail-field"><label>Absence relative à la reprise</label><div className="detail-input">{r.absenceId ? <button className="rp-detail-link" onClick={() => navigate(`/demande/${r.absenceId}`, {state:{from:'historique'}})}>{r.absenceNature || 'Absence sélectionnée'}</button> : <span>Aucune</span>}<span className="detail-input-icon"><span className="material-symbols-outlined">description</span></span></div></div>
      <div className="detail-field"><label>Observations apportées</label><div className="rp-detail-text">{r.observations || 'Aucune observation'}</div></div>
      <div className="detail-field"><label>Nécessité d’une visite médicale</label><div className="detail-input rp-medical-summary"><span>{r.visiteMedicale ? 'Oui' : 'Non'}</span><DocumentList documents={r.documents} /></div></div>
    </div><div className="detail-col">
      <div className="detail-field"><label>Date de début de l’absence</label><div className="detail-input"><span>{formatDate(r.dateDebut)}</span><span className="detail-input-icon"><span className="material-symbols-outlined">calendar_month</span></span></div></div>
      <div className="detail-field"><label>Date prévue de la reprise</label><div className="detail-input"><span>{formatDate(r.dateReprisePrevue)}</span><span className="detail-input-icon"><span className="material-symbols-outlined">event_available</span></span></div></div>
      <div className="detail-field"><label>Date effective de la reprise</label><div className="detail-input"><span>{formatDateTime(r.dateRepriseEffective, true)}</span><span className="detail-input-icon"><span className="material-symbols-outlined">event_available</span></span></div></div>
    </div></div>
  </section></PageShell>
}
