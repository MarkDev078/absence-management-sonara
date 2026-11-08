import { useState } from 'react'
import type { DocumentRef } from '../data/demoDb.ts'
import { getDocument } from '../data/documents.ts'
export default function DocumentList({ documents }: { documents: DocumentRef[] }): React.ReactElement {
  const [open, setOpen] = useState(false); const [error, setError] = useState('')
  const download = async (d: DocumentRef) => {
    try {
      const file = await getDocument(d.id)
      if (!file) { setError('Document introuvable dans ce navigateur.'); return }
      const url = URL.createObjectURL(file); const a = document.createElement('a'); a.href = url; a.download = d.name; a.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setError('Impossible d’ouvrir ce document.') }
  }
  return <div className="document-list"><button type="button" className="document-toggle" disabled={!documents.length} onClick={() => setOpen(v => !v)}><span className="material-symbols-outlined">attach_file</span> {documents.length} document{documents.length !== 1 ? 's' : ''}</button>
    {open && <ul>{documents.map(d => <li key={d.id}><button type="button" onClick={() => download(d)}>{d.name}</button></li>)}</ul>}{error && <small role="alert">{error}</small>}
  </div>
}
