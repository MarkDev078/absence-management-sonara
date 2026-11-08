import { createContext, useContext, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { getCurrentUser, saveSignalement } from '../data/demoDb.ts'
import { useDialogFocus } from '../hooks/useDialogFocus.ts'

type ReportContextValue = { openReport: (initial?: string) => void }
const ReportContext = createContext<ReportContextValue>({ openReport: () => {} })
export function useReport(): ReportContextValue { return useContext(ReportContext) }
export function ReportFab(): React.ReactElement {
  const { openReport } = useReport()
  return <button className="dash-fab" aria-label="Signaler un problème" onClick={() => openReport()}><span className="material-symbols-outlined">flag</span></button>
}
export function ReportProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [open, setOpen] = useState(false); const [kind, setKind] = useState<'matricule'|'identite'>('matricule')
  const [identifier, setIdentifier] = useState(''); const [description, setDescription] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState('')
  const dialogRef = useDialogFocus<HTMLElement>(open, () => setOpen(false))
  const openReport = (initial?: string) => {
    setKind('matricule'); setIdentifier(initial || getCurrentUser()?.matricule || ''); setDescription(''); setError(''); setOpen(true)
  }
  const close = () => setOpen(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !description.trim()) { setError('Veuillez renseigner votre identification et décrire le problème.'); return }
    try {
      saveSignalement({ identificationType: kind, identification: identifier.trim(), description: description.trim() })
      close(); setNotice('Signalement enregistré localement (démonstration).'); window.setTimeout(() => setNotice(''), 5500)
    } catch { setError('Impossible d’enregistrer le signalement sur ce navigateur.') }
  }
  return <ReportContext.Provider value={{ openReport }}>
    {children}
    {open && <div className="modal-shade" onMouseDown={e => { if (e.target === e.currentTarget) close() }}>
      <section ref={dialogRef} className="app-dialog report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-title">
        <header className="app-dialog-header app-dialog-header-purple"><h2 id="report-title">SIGNALEMENT</h2><span className="material-symbols-outlined">flag</span></header>
        <form onSubmit={submit} noValidate>
          <div className="report-body">
            <label htmlFor="report-id">Veuillez renseigner votre matricule ou, à défaut, votre identité avant de soumettre votre signalement à l’administrateur :<span className="required">*</span></label>
            <div className="report-id-group"><select aria-label="Type d’identification" value={kind} onChange={e => { setKind(e.target.value as 'matricule'|'identite'); setIdentifier('') }}><option value="matricule">Matricule</option><option value="identite">Identité</option></select><input id="report-id" autoFocus placeholder={kind === 'matricule' ? 'Entrer votre matricule' : 'Entrer votre nom et prénom'} value={identifier} onChange={e => setIdentifier(e.target.value)} required /></div>
            <label htmlFor="report-description">Quel(s) problème(s) avez-vous rencontré(s) durant votre utilisation de l’application ?<span className="required">*</span></label>
            <textarea id="report-description" placeholder="Durant mon utilisation, j’ai rencontré le(s) problème(s) suivant(s)…" value={description} onChange={e => setDescription(e.target.value)} required />
            {error && <p className="modal-error" role="alert">{error}</p>}
          </div>
          <footer className="app-dialog-footer"><button type="submit" className="app-dialog-primary blue"><span className="material-symbols-outlined">flag</span> SIGNALER</button><button type="button" className="app-dialog-secondary" onClick={close}><span className="material-symbols-outlined">close</span> ANNULER</button></footer>
        </form>
      </section>
    </div>}
    {notice && <div className="toast-container" aria-live="polite"><div className="toast success"><div className="toast-icon"><span className="material-symbols-outlined">check_circle</span></div><span>{notice}</span><button className="toast-close" aria-label="Fermer" onClick={() => setNotice('')}><span className="material-symbols-outlined">close</span></button></div></div>}
  </ReportContext.Provider>
}
