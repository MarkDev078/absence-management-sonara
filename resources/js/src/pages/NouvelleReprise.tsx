import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/PageShell.tsx'
import { createReprise, formatDate, getCurrentUser, myDemands } from '../data/demoDb.ts'
import { deleteDocuments, storeDocuments } from '../data/documents.ts'
import './Reprise.css'

function todayLocal(): string { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }
export default function NouvelleReprise(): React.ReactElement {
  const navigate = useNavigate(); const user = getCurrentUser()
  const eligible = useMemo(() => myDemands().filter(d => !!d.dateDebut && !!d.dateFin).sort((a,b) => new Date(b.dateSoumission).getTime() - new Date(a.dateSoumission).getTime()), [])
  const [absenceId, setAbsenceId] = useState('')
  const selected = eligible.find(d => String(d.id) === absenceId)
  const [dateDebut, setDateDebut] = useState(''); const [datePrevue, setDatePrevue] = useState('')
  const [visite, setVisite] = useState<null|boolean>(null); const [files, setFiles] = useState<File[]>([])
  const [observations, setObservations] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false)
  const selectAbsence = (value: string) => {
    setAbsenceId(value)
    const d = eligible.find(a => String(a.id) === value)
    setDateDebut(d?.dateDebut || ''); setDatePrevue(d?.dateFin || ''); setError('')
  }
  const submit = async (e: FormEvent) => {
    e.preventDefault(); if (busy) return
    if (!user?.managerId) { setError('Aucun responsable supérieur n’est configuré pour ce compte de démonstration.'); return }
    if (!dateDebut || !datePrevue) { setError('Veuillez renseigner les deux dates de l’absence.'); return }
    if (datePrevue <= dateDebut) { setError('La reprise prévue doit être postérieure au début de l’absence.'); return }
    if (dateDebut > todayLocal()) { setError('Le début de l’absence ne peut pas être postérieur à la reprise effective.'); return }
    if (visite === null) { setError('Veuillez indiquer si une visite médicale est nécessaire.'); return }
    if (visite && files.length === 0) { setError('Veuillez joindre au moins un justificatif médical avant la soumission.'); return }
    setError(''); setBusy(true)
    let refs: Awaited<ReturnType<typeof storeDocuments>> = []
    try {
      refs = visite ? await storeDocuments(files) : []
      const record = createReprise({ absenceId: selected?.id || null, absenceNature: selected?.nature || null, dateDebut, dateReprisePrevue: datePrevue, visiteMedicale: visite, documents: refs, observations: observations.trim() })
      navigate(`/reprise/${record.id}`, { state: { from: 'submit' } })
    } catch (err) {
      if (refs.length) await deleteDocuments(refs).catch(() => {})
      setError(err instanceof Error ? err.message : 'Impossible d’enregistrer la fiche sur ce navigateur.')
      setBusy(false)
    }
  }
  return <PageShell form><main className="reprise-main">
    <button type="button" className="reprise-back" onClick={() => navigate('/dashboard')}><span className="material-symbols-outlined">arrow_back</span> Retour</button>
    <div className="reprise-layout">
      <div className="reprise-intro"><h1><span>NOUVELLE</span>{' '}<span>FICHE DE</span>{' '}<span>REPRISE</span></h1><p>Vous êtes de retour à la SO.NA.RA. après une période d’absence ? Dans ce cas, veuillez remplir et soumettre ce formulaire, attestant de votre reprise de service effective.</p></div>
      <form className="reprise-form" onSubmit={submit} noValidate>
        <div className="reprise-form-card"><div className="reprise-form-col">
          <div className="rp-field"><label htmlFor="rp-absence">À quelle demande d’absence est relative cette reprise de service ? <span className="required">*</span></label>
            <select id="rp-absence" value={absenceId} onChange={e => selectAbsence(e.target.value)}><option value="">Aucune</option>{eligible.map(d => <option key={d.id} value={d.id}>N° {d.id} — {d.nature} ({formatDate(d.dateDebut)})</option>)}</select>
          </div>
          {!selected && <div className="rp-warning"><span className="material-symbols-outlined">warning</span><span>Les informations qui suivent doivent être remplies manuellement si cette reprise n’est rattachée à aucune demande d’absence enregistrée.</span></div>}
          {selected && <div className="rp-info"><span className="material-symbols-outlined">info</span><span>Les dates proviennent de la demande sélectionnée et sont en lecture seule.</span></div>}
          <div className="rp-field"><label htmlFor="rp-start">Quand vous êtes-vous absenté(e) de la raffinerie ? <span className="required">*</span></label>
            <div className={`rp-date-control ${selected ? 'readonly' : ''}`}><span aria-hidden="true">{dateDebut ? formatDate(dateDebut) : 'Choisir une date'}</span><span className="material-symbols-outlined" aria-hidden="true">calendar_month</span><input id="rp-start" type="date" value={dateDebut} readOnly={!!selected} onClick={e => { if (!selected) { try { e.currentTarget.showPicker?.() } catch { /* selon le navigateur */ } } }} onChange={e => { setDateDebut(e.target.value); setError('') }} required aria-readonly={!!selected} /></div>
          </div>
          <div className="rp-field"><label htmlFor="rp-planned">Quand avez-vous prévu de reprendre votre service à la raffinerie ? <span className="required">*</span></label>
            <div className={`rp-date-control ${selected ? 'readonly' : ''}`}><span aria-hidden="true">{datePrevue ? formatDate(datePrevue) : 'Choisir une date'}</span><span className="material-symbols-outlined" aria-hidden="true">calendar_month</span><input id="rp-planned" type="date" value={datePrevue} readOnly={!!selected} onClick={e => { if (!selected) { try { e.currentTarget.showPicker?.() } catch { /* selon le navigateur */ } } }} onChange={e => { setDatePrevue(e.target.value); setError('') }} required aria-readonly={!!selected} /></div>
          </div>
        </div><div className="reprise-form-col reprise-form-col-right">
          <fieldset className="rp-field rp-medical"><legend>Votre reprise nécessite-t-elle une visite médicale ? <span className="required">*</span></legend>
            <div className="rp-choice" role="radiogroup" aria-label="Visite médicale nécessaire"><button type="button" role="radio" aria-checked={visite === true} className={visite === true ? 'chosen' : ''} onClick={() => { setVisite(true); setError('') }}>Oui <span className="material-symbols-outlined">check_circle</span></button><button type="button" role="radio" aria-checked={visite === false} className={visite === false ? 'chosen' : ''} onClick={() => { setVisite(false); setFiles([]); setError('') }}>Non <span className="material-symbols-outlined">cancel</span></button></div>
          </fieldset>
          {visite === true && <div className="rp-field"><label htmlFor="rp-files">Veuillez fournir en pièce jointe la preuve de votre visite médicale : <span className="required">*</span></label>
            <label htmlFor="rp-files" className="rp-file-button"><span className="material-symbols-outlined">attach_file</span> Sélectionner un ou plusieurs fichiers</label>
            <input id="rp-files" className="rp-file-input" type="file" multiple onChange={e => { setFiles(Array.from(e.target.files || [])); e.target.value = ''; setError('') }} />
            {files.length > 0 && <ul className="rp-files">{files.map((f, i) => <li key={`${f.name}-${i}`}><span>{f.name}</span><button type="button" aria-label={`Retirer ${f.name}`} onClick={() => setFiles(v => v.filter((_, j) => j !== i))}><span className="material-symbols-outlined">close</span></button></li>)}</ul>}
            <small className="rp-local-note">Les fichiers restent dans ce navigateur de démonstration.</small>
          </div>}
          <div className="rp-field"><label htmlFor="rp-observations">Avez-vous des observations à apporter concernant votre reprise ? <em>(Porter des observations au cas où la date présumée de reprise ne correspondrait pas à celle de reprise effective)</em></label>
            <textarea id="rp-observations" placeholder="Entrer vos observations ici" value={observations} onChange={e => setObservations(e.target.value)} />
          </div>
        </div></div>
        {error && <div className="rp-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}
        <div className="reprise-submit-strip"><p>Si vous avez terminé, veuillez soumettre votre fiche de reprise, afin qu’elle soit validée par votre hiérarchie.</p><button type="submit" aria-label="Soumettre" disabled={busy}><span className="material-symbols-outlined">send</span> {busy ? 'Enregistrement…' : 'Soumettre'}</button></div>
      </form>
    </div>
  </main></PageShell>
}
