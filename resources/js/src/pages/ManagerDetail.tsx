import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PageShell from '../components/PageShell.tsx'
import DecisionPanel from '../components/DecisionPanel.tsx'
import DocumentList from '../components/DocumentList.tsx'
import { formatDate, formatDateTime, getCurrentUser, getDemand, getReprise, getUser, hasSubordinates, isSubordinate } from '../data/demoDb.ts'
import type { Absence, Reprise } from '../data/demoDb.ts'
import { displayPhones } from '../data/phones.ts'
import './DemandeDetail.css'
import './ManagerDetail.css'

function statusClass(s: string): string { return s === 'Approuvée' ? 'ok' : s === 'Rejetée' ? 'ko' : 'attente' }
function statusIcon(s: string): string { return s === 'Approuvée' ? 'check_circle' : s === 'Rejetée' ? 'cancel' : 'schedule' }
function period(p?: string | null, q?: string | null): string { const v = q || p; return v === 'apres-midi' ? 'Après-midi' : v ? v.charAt(0).toUpperCase() + v.slice(1) : '—' }
function phoneFormat(raw: string): string { const d = raw.replace(/\D/g, '').slice(0, 9); return d ? `(+237) ${d[0]} ${d.slice(1).replace(/(.{2})/g, '$1 ').trim()}` : 'Non renseigné' }
function Field({ label, icon, children }: {label:string; icon:string; children:React.ReactNode}): React.ReactElement { return <div className="mgr-field"><span className="mgr-field-label">{label}</span><span className="material-symbols-outlined mgr-field-icon">{icon}</span><div className="mgr-field-value">{children}</div></div> }
export default function ManagerDetail({ type = 'demande' }: { type?: 'demande'|'reprise' }): React.ReactElement {
  const navigate = useNavigate(); const location = useLocation(); const { id } = useParams(); const user = getCurrentUser(); const [revision, setRevision] = useState(0); void revision
  const record = type === 'demande' ? getDemand(Number(id)) : getReprise(Number(id))
  const allowed = !!user && !!record && hasSubordinates(user.id) && isSubordinate(record.ownerId, user.id)
  const back = (location.state as { returnTo?: string } | null)?.returnTo
  if (!record || !allowed) return <PageShell><section className="detail-card animated"><h1>Document introuvable ou inaccessible.</h1><button className="detail-back" onClick={() => navigate('/equipe')}>Retour à mon équipe</button></section></PageShell>
  const applicant = getUser(record.ownerId); const st = statusClass(record.statut)
  const absence = type === 'demande' ? record as Absence : null; const reprise = type === 'reprise' ? record as Reprise : null
  const contacts = displayPhones(absence?.phones)
  return <PageShell><section className="detail-card animated manager-card">
    <div className="detail-topbar"><button className="mgr-back" onClick={() => navigate(back?.startsWith('/equipe') ? back : '/equipe')}><span className="material-symbols-outlined">arrow_back</span> Retour</button><span className={`detail-statut-pill statut-${st}`}><span className="material-symbols-outlined">{statusIcon(record.statut)}</span> Statut actuel : {record.statut}</span></div>
    <div className="mgr-submitted"><span className="material-symbols-outlined">info</span><div>{absence ? 'La présente demande d’absence' : 'La présente fiche de reprise'} vous a été soumise par :<br /><strong>{applicant?.name || 'Utilisateur'}</strong></div><span className="mgr-avatar"><span className="material-symbols-outlined">person</span></span></div>
    <DecisionPanel record={record} type={type} id={record.id} onChanged={() => setRevision(v => v + 1)} />
    {absence ? <div className="mgr-grid"><div className="mgr-col">
      <Field label="Nature de l’absence sollicitée" icon="category">{absence.nature}</Field>
      <Field label="Motif de l’absence sollicitée" icon="subject">{absence.motif || 'Non renseigné'}</Field>
      {contacts.length > 0 && <Field label="Contacts durant l’absence sollicitée" icon="contacts">{contacts.map((p, i) => <div className="mgr-phone" key={p.id ?? i}><span>{phoneFormat(p.digits)}</span>{p.digits.replace(/\D/g, '').length === 9 && p.operator ? <img src={`/assets/${p.operator}.png`} alt={p.operator} /> : <span className="material-symbols-outlined">public</span>}</div>)}</Field>}
    </div><div className="mgr-col">
      <Field label="Date de début de l’absence sollicitée" icon="calendar_month">{formatDate(absence.dateDebut)} — {period(absence.periodeDebut, absence.quartDebut)}</Field>
      <Field label="Date de fin prévue de l’absence sollicitée" icon="event_available">{formatDate(absence.dateFin)} — {period(absence.periodeFin, absence.quartFin)}</Field>
      <Field label="Date d’émission de l’absence sollicitée" icon="send">{formatDateTime(absence.dateSoumission, true)}</Field>
    </div></div> : reprise && <div className="mgr-grid"><div className="mgr-col">
      <Field label="Absence relative à la reprise" icon="description">{reprise.absenceNature || 'Aucune'}</Field>
      <Field label="Observations apportées" icon="subject">{reprise.observations || 'Aucune'}</Field>
      <Field label="Nécessité d’une visite médicale" icon="medical_services">{reprise.visiteMedicale ? 'Oui' : 'Non'} <DocumentList documents={reprise.documents} /></Field>
    </div><div className="mgr-col">
      <Field label="Date de début de l’absence" icon="calendar_month">{formatDate(reprise.dateDebut)}</Field>
      <Field label="Date prévue de la reprise" icon="event_available">{formatDate(reprise.dateReprisePrevue)}</Field>
      <Field label="Date effective de la reprise" icon="event_available">{formatDateTime(reprise.dateRepriseEffective, true)}</Field>
    </div></div>}
  </section></PageShell>
}
