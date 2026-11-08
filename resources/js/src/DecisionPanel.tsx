import { useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { canDecide, decide, getCurrentUser, getUser } from '../data/demoDb.ts'
import type { DecisionKind, Workflow } from '../data/demoDb.ts'
import { useDialogFocus } from '../hooks/useDialogFocus.ts'

type Props = { record: Workflow; type: 'demande'|'reprise'; id: number; onChanged: () => void }
export default function DecisionPanel({ record, type, id, onChanged }: Props): React.ReactElement {
  const user = getCurrentUser(); const [reasonOpen, setReasonOpen] = useState(false); const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState<DecisionKind|null>(null); const [error, setError] = useState('')
  const reasonRef = useDialogFocus<HTMLElement>(reasonOpen, () => { setReasonOpen(false); setReason('') })
  const confirmRef = useDialogFocus<HTMLElement>(!!confirm, () => { setConfirm(null); setReason('') })
  const label = type === 'demande' ? 'cette demande' : 'cette fiche de reprise'
  const myDecision = record.decisions.find(d => d.userId === user?.id)
  const rejected = record.decisions.find(d => d.kind === 'rejeter')
  const submitReason = (e: FormEvent) => { e.preventDefault(); setReasonOpen(false); setConfirm('rejeter') }
  const confirmDecision = () => {
    if (!confirm) return
    try { decide(type, id, confirm, reason); setConfirm(null); setReason(''); setError(''); onChanged() }
    catch (err) { setError(err instanceof Error ? err.message : 'La décision n’a pas pu être enregistrée.'); setConfirm(null); onChanged() }
  }
  let message = ''
  let tone = 'info'
  if (myDecision?.kind === 'rejeter') { tone = 'bad'; message = `Vous avez rejeté ${label}${myDecision.reason ? ` pour la raison suivante : ${myDecision.reason}` : ' sans raison spécifique'}.` }
  else if (myDecision?.kind === 'approuver') {
    if (record.statut === 'Rejetée') { tone = 'bad'; message = `Vous aviez approuvé ${label}. Elle a ensuite été rejetée${rejected ? ` par ${getUser(rejected.userId)?.name || 'un responsable'}` : ''}${rejected?.reason ? ` : ${rejected.reason}` : '.'}` }
    else { tone = 'good'; message = `Vous avez approuvé ${label}.${record.statut === 'En attente' ? ' Elle est désormais en attente d’approbation de votre hiérarchie.' : ''}` }
  } else if (record.statut === 'Approuvée') { tone = 'good'; message = `${type === 'demande' ? 'Cette demande a' : 'Cette fiche de reprise a'} été approuvée.` }
  else if (record.statut === 'Rejetée') { tone = 'bad'; message = `${type === 'demande' ? 'Cette demande a' : 'Cette fiche de reprise a'} été rejetée${rejected ? ` par ${getUser(rejected.userId)?.name || 'un responsable'}` : ''}${rejected?.reason ? ` : ${rejected.reason}` : ' sans raison spécifique.'}` }
  else if (!canDecide(record)) { message = `En attente de la décision de ${getUser(record.currentApproverId)?.name || 'la hiérarchie'}.` }
  return <>
    {canDecide(record) ? <div className="decision-row"><span>Quelle est votre décision ?</span><div><button className="decision-approve" onClick={() => { setError(''); setConfirm('approuver') }}><span className="material-symbols-outlined">thumb_up</span> Approuver</button><button className="decision-reject" onClick={() => { setReason(''); setError(''); setReasonOpen(true) }}><span className="material-symbols-outlined">thumb_down</span> Rejeter</button></div></div>
      : <div className={`decision-message ${tone}`}>{message}</div>}
    {error && <p className="modal-error" role="alert">{error}</p>}
    {reasonOpen && createPortal(<div className="modal-shade" onMouseDown={e => { if (e.target === e.currentTarget) setReasonOpen(false) }}>
      <section ref={reasonRef} className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="reason-title">
        <header className="app-dialog-header app-dialog-header-blue"><h2 id="reason-title">AVIS SUR LA DÉCISION</h2><span className="material-symbols-outlined">thumbs_up_down</span></header>
        <form onSubmit={submitReason}><div className="reason-body"><p>Vous pouvez indiquer une raison pour ce rejet, ou soumettre sans remplir le champ. Cliquez sur Annuler pour revenir sans rejeter.</p><label className="sr-only" htmlFor="reason-field">Motif du rejet facultatif</label><input id="reason-field" autoFocus placeholder="Entrer votre raison ici" value={reason} onChange={e => setReason(e.target.value)} /></div>
          <footer className="app-dialog-footer"><button type="submit" className="app-dialog-primary"><span className="material-symbols-outlined">send</span> SOUMETTRE</button><button type="button" className="app-dialog-secondary" onClick={() => { setReasonOpen(false); setReason('') }}><span className="material-symbols-outlined">close</span> ANNULER</button></footer>
        </form>
      </section>
    </div>, document.body)}
    {confirm && createPortal(<div className="modal-shade" onMouseDown={e => { if (e.target === e.currentTarget) { setConfirm(null); setReason('') } }}>
      <section ref={confirmRef} className="app-dialog" role="dialog" aria-modal="true" aria-labelledby="decision-confirm-title">
        <header className="app-dialog-header app-dialog-header-warning"><h2 id="decision-confirm-title">CONFIRMATION</h2><span className="material-symbols-outlined">warning</span></header>
        <div className="reason-body"><p>Voulez-vous vraiment <strong>{confirm === 'approuver' ? 'approuver' : 'rejeter'}</strong> {label} ?</p><p>{confirm === 'rejeter' ? 'Le rejet est définitif dans cette simulation.' : user?.managerId ? 'La demande sera ensuite transmise à votre responsable.' : 'Votre décision constituera l’approbation finale.'}</p>{confirm === 'rejeter' && <p>Motif : {reason.trim() || 'sans raison spécifique'}</p>}</div>
        <footer className="app-dialog-footer"><button autoFocus className={`app-dialog-primary ${confirm === 'rejeter' ? 'red' : ''}`} onClick={confirmDecision}><span className="material-symbols-outlined">check</span> CONFIRMER</button><button className="app-dialog-secondary" onClick={() => { setConfirm(null); setReason('') }}><span className="material-symbols-outlined">close</span> ANNULER</button></footer>
      </section>
    </div>, document.body)}
  </>
}
