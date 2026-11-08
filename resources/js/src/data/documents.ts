import type { DocumentRef } from './demoDb.ts'

// Les fichiers restent dans IndexedDB, propres au navigateur de démonstration.
const DB = 'sonara_demo_documents_v1'
const STORE = 'documents'
function openDocuments(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Stockage des documents indisponible.'))
  })
}
export async function storeDocuments(files: File[]): Promise<DocumentRef[]> {
  if (!files.length) return []
  const db = await openDocuments()
  const refs = files.map((file, index) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}-${index}`, name: file.name, size: file.size, type: file.type }))
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite'); const store = tx.objectStore(STORE)
      files.forEach((file, i) => store.put(file, refs[i].id))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error || new Error('Impossible d’enregistrer les documents.'))
      tx.onabort = () => reject(tx.error || new Error('Enregistrement des documents interrompu.'))
    })
    return refs
  } finally { db.close() }
}
export async function deleteDocuments(refs: DocumentRef[]): Promise<void> {
  if (!refs.length) return
  const db = await openDocuments()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite'); refs.forEach(ref => tx.objectStore(STORE).delete(ref.id))
      tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error)
    })
  } finally { db.close() }
}
export async function getDocument(id: string): Promise<Blob | null> {
  const db = await openDocuments()
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(id)
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null)
      request.onerror = () => reject(request.error)
    })
  } finally { db.close() }
}
