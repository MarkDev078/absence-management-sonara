/** Local, non sécurisé et limité au navigateur : données de démonstration uniquement. */
export type Statut = 'En attente' | 'Approuvée' | 'Rejetée'
export type DecisionKind = 'approuver' | 'rejeter'
export interface DemoUser {
  id: string
  matricule: string
  name: string
  role: string
  direction: string
  service: string
  managerId: string | null
  password: string
}
export interface Decision {
  userId: string
  kind: DecisionKind
  at: string
  reason?: string
}
export interface Workflow {
  ownerId: string
  statut: Statut
  currentApproverId: string | null
  decisions: Decision[]
}
export interface Phone { digits: string; operator?: string | null; id?: string }
export interface Absence extends Workflow {
  id: number
  categorie?: string
  nature: string
  motif?: string
  dateDebut?: string
  dateFin?: string
  periodeDebut?: string | null
  quartDebut?: string | null
  periodeFin?: string | null
  quartFin?: string | null
  phones?: Phone[]
  dateSoumission: string
  createdAt: string
}
export interface DocumentRef { id: string; name: string; size: number; type: string }
export interface Reprise extends Workflow {
  id: number
  absenceId: number | null
  absenceNature: string | null
  dateDebut: string
  dateReprisePrevue: string
  dateRepriseEffective: string
  visiteMedicale: boolean
  documents: DocumentRef[]
  observations: string
  dateSoumission: string
}
export interface Signalement {
  id: number
  identificationType: 'matricule' | 'identite'
  identification: string
  description: string
  date: string
}
interface DemoDB { version: 1; users: DemoUser[]; demandes: Absence[]; reprises: Reprise[]; signalements: Signalement[] }
const DB_KEY = 'sonara_demo_db_v1'
const SESSION_KEY = 'sonara_user'

const USERS: DemoUser[] = [
  { id: 'EMP001', matricule: 'EMP001', name: 'Aline NGONO', role: 'Employée', direction: 'Exploitation', service: 'Production', managerId: 'CHEF001', password: 'demo1234' },
  { id: 'EMP002', matricule: 'EMP002', name: 'Thomas MBARGA', role: 'Employé', direction: 'Exploitation', service: 'Production', managerId: 'CHEF001', password: 'demo1234' },
  { id: 'EMP003', matricule: 'EMP003', name: 'Nadia BELLA', role: 'Employée', direction: 'Exploitation', service: 'Maintenance', managerId: 'CHEF002', password: 'demo1234' },
  { id: 'CHEF001', matricule: 'CHEF001', name: 'Claire MBOA', role: 'Responsable de service', direction: 'Exploitation', service: 'Production', managerId: 'DIR001', password: 'demo1234' },
  { id: 'CHEF002', matricule: 'CHEF002', name: 'Bruno EKO', role: 'Responsable de service', direction: 'Exploitation', service: 'Maintenance', managerId: 'DIR001', password: 'demo1234' },
  { id: 'DIR001', matricule: 'DIR001', name: 'Solange FOTSO', role: 'Directrice', direction: 'Exploitation', service: 'Direction', managerId: null, password: 'demo1234' },
]
const sampleDates = [
  { id: 14, nature: 'Absence autorisée non payée', dateSoumission: '2026-09-24T08:47:00', statut: 'En attente' as Statut, dateDebut: '2026-09-28', dateFin: '2026-09-29' },
  { id: 13, nature: 'Absence autorisée payée', dateSoumission: '2026-09-07T09:16:00', statut: 'Approuvée' as Statut, dateDebut: '2026-09-08', dateFin: '2026-09-14' },
  { id: 12, nature: 'Congé annuel', dateSoumission: '2026-07-10T14:59:00', statut: 'Approuvée' as Statut, dateDebut: '2026-07-20', dateFin: '2026-08-17' },
  { id: 11, nature: 'Absence autorisée non payée', dateSoumission: '2026-03-30T10:03:00', statut: 'Rejetée' as Statut, dateDebut: '2026-04-01', dateFin: '2026-04-02' },
  { id: 10, nature: 'Congé paternité/maternité', dateSoumission: '2025-08-08T12:21:00', statut: 'Approuvée' as Statut, dateDebut: '2025-08-11', dateFin: '2025-10-13' },
  { id: 9, nature: 'Reliquat congé', dateSoumission: '2025-07-02T15:15:00', statut: 'Rejetée' as Statut, dateDebut: '2025-07-03', dateFin: '2025-07-07' },
]
function sampleDecisions(status: Statut, time: string): Decision[] {
  if (status === 'Approuvée') return [
    { userId: 'CHEF001', kind: 'approuver', at: time },
    { userId: 'DIR001', kind: 'approuver', at: time },
  ]
  if (status === 'Rejetée') return [{ userId: 'CHEF001', kind: 'rejeter', at: time }]
  return []
}
function initialDB(): DemoDB {
  const demandes: Absence[] = sampleDates.map(s => ({
    ...s, ownerId: 'EMP001', createdAt: s.dateSoumission, currentApproverId: s.statut === 'En attente' ? 'CHEF001' : null,
    decisions: sampleDecisions(s.statut, s.dateSoumission), motif: 'Demande d’absence enregistrée pour la démonstration.',
    periodeDebut: 'matin', periodeFin: 'matin', phones: [],
  }))
  demandes.push({ id: 15, ownerId: 'EMP002', nature: 'Congé annuel', motif: 'Congé annuel de démonstration.', dateDebut: '2027-01-11', dateFin: '2027-01-18', periodeDebut: 'matin', periodeFin: 'matin', phones: [], createdAt: '2026-10-20T09:16:00', dateSoumission: '2026-10-20T09:16:00', statut: 'En attente', currentApproverId: 'CHEF001', decisions: [] })
  demandes.push({ id: 16, ownerId: 'EMP003', nature: 'Absence autorisée payée', motif: 'Rendez-vous personnel.', dateDebut: '2027-01-20', dateFin: '2027-01-21', periodeDebut: 'matin', periodeFin: 'matin', phones: [], createdAt: '2026-10-19T09:16:00', dateSoumission: '2026-10-19T09:16:00', statut: 'En attente', currentApproverId: 'CHEF002', decisions: [] })
  // Migration non destructive des demandes créées avant l'introduction des comptes.
  try {
    const raw = localStorage.getItem('sonara_demandes')
    const legacy: unknown = raw ? JSON.parse(raw) : []
    if (Array.isArray(legacy)) for (const item of legacy) {
      if (!item || typeof item !== 'object') continue
      const p = item as Partial<Absence>
      if (!p.nature) continue
      const id = typeof p.id === 'number' ? p.id : Date.now() + demandes.length
      const time = p.dateSoumission || p.createdAt || new Date().toISOString()
      const status: Statut = p.statut === 'Approuvée' || p.statut === 'Rejetée' ? p.statut : 'En attente'
      const merged: Absence = { ...p, id, ownerId: 'EMP001', nature: p.nature, dateSoumission: time, createdAt: p.createdAt || time, statut: status, currentApproverId: status === 'En attente' ? 'CHEF001' : null, decisions: sampleDecisions(status, time) }
      const idx = demandes.findIndex(d => d.id === id)
      if (idx >= 0) demandes[idx] = { ...demandes[idx], ...merged }
      else demandes.push(merged)
    }
  } catch { /* La source originale reste intacte si elle est illisible. */ }
  const reprises: Reprise[] = [
    { id: 13, absenceId: 13, absenceNature: 'Absence autorisée payée', dateDebut: '2026-09-08', dateReprisePrevue: '2026-09-14', dateSoumission: '2026-09-14T07:56:00', statut: 'Approuvée' },
    { id: 12, absenceId: 12, absenceNature: 'Congé annuel', dateDebut: '2026-07-20', dateReprisePrevue: '2026-08-17', dateSoumission: '2026-08-17T08:00:00', statut: 'Approuvée' },
    { id: 11, absenceId: null, absenceNature: null, dateDebut: '2026-04-01', dateReprisePrevue: '2026-04-02', dateSoumission: '2026-04-02T07:21:00', statut: 'Approuvée' },
    { id: 10, absenceId: 10, absenceNature: 'Congé paternité/maternité', dateDebut: '2025-08-11', dateReprisePrevue: '2025-10-13', dateSoumission: '2025-10-13T11:35:00', statut: 'Approuvée' },
    { id: 9, absenceId: null, absenceNature: null, dateDebut: '2025-04-14', dateReprisePrevue: '2025-04-15', dateSoumission: '2025-04-15T09:44:00', statut: 'Rejetée' },
  ].map(r => ({ ...r, ownerId: 'EMP001', dateRepriseEffective: r.dateSoumission, visiteMedicale: false, documents: [], observations: '', currentApproverId: null, decisions: sampleDecisions(r.statut as Statut, r.dateSoumission), statut: r.statut as Statut }))
  return { version: 1, users: USERS, demandes, reprises, signalements: [] }
}
export function readDB(): DemoDB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const db = JSON.parse(raw) as DemoDB
      if (db.version === 1 && Array.isArray(db.users) && Array.isArray(db.demandes) && Array.isArray(db.reprises)) return db
    }
  } catch { /* garder la source legacy et recréer la base de démonstration */ }
  const db = initialDB()
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  return db
}
function saveDB(db: DemoDB): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  window.dispatchEvent(new Event('sonara-db-change'))
}
export function getCurrentUser(): DemoUser | null {
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') as { id?: string; matricule?: string } | null
    if (!data) return null
    return readDB().users.find(u => u.id === data.id || u.matricule.toUpperCase() === data.matricule?.toUpperCase()) || null
  } catch { return null }
}
export function authenticate(matricule: string, password: string): DemoUser | null {
  const user = readDB().users.find(u => u.matricule.toUpperCase() === matricule.trim().toUpperCase() && u.password === password)
  if (!user) return null
  localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id, matricule: user.matricule, loginAt: new Date().toISOString() }))
  return user
}
export function getUser(id?: string | null): DemoUser | null { return readDB().users.find(u => u.id === id) || null }
export function hasSubordinates(userId: string): boolean { return readDB().users.some(u => u.managerId === userId) }
export function isSubordinate(userId: string, managerId: string): boolean {
  if (userId === managerId) return false
  const users = readDB().users
  const seen = new Set<string>()
  let cur = users.find(u => u.id === userId)
  while (cur?.managerId && !seen.has(cur.id)) {
    seen.add(cur.id)
    if (cur.managerId === managerId) return true
    cur = users.find(u => u.id === cur?.managerId)
  }
  return false
}
function nextNumber(records: { id: number }[]): number {
  const used = new Set(records.map(r => r.id))
  let id = Math.max(0, ...records.map(r => r.id < 1_000_000 ? r.id : 0)) + 1
  while (used.has(id)) id++
  return id
}
export function myDemands(): Absence[] {
  const user = getCurrentUser()
  return user ? readDB().demandes.filter(d => d.ownerId === user.id) : []
}
export function myReprises(): Reprise[] {
  const user = getCurrentUser()
  return user ? readDB().reprises.filter(d => d.ownerId === user.id) : []
}
export function teamDemands(): Absence[] {
  const user = getCurrentUser()
  return user && hasSubordinates(user.id) ? readDB().demandes.filter(d => isSubordinate(d.ownerId, user.id)) : []
}
export function teamReprises(): Reprise[] {
  const user = getCurrentUser()
  return user && hasSubordinates(user.id) ? readDB().reprises.filter(d => isSubordinate(d.ownerId, user.id)) : []
}
export function getDemand(id: number): Absence | null { return readDB().demandes.find(d => d.id === id) || null }
export function getReprise(id: number): Reprise | null { return readDB().reprises.find(d => d.id === id) || null }
export function canView(record: Workflow): boolean {
  const user = getCurrentUser()
  return !!user && (record.ownerId === user.id || isSubordinate(record.ownerId, user.id))
}
export function canDecide(record: Workflow): boolean {
  const user = getCurrentUser()
  return !!user && record.statut === 'En attente' && record.currentApproverId === user.id && isSubordinate(record.ownerId, user.id)
}
export function createDemand(data: Omit<Absence, 'id'|'ownerId'|'statut'|'currentApproverId'|'decisions'|'createdAt'|'dateSoumission'>): Absence {
  const user = getCurrentUser()
  if (!user) throw new Error('Veuillez vous connecter.')
  if (!user.managerId) throw new Error('Aucun responsable supérieur n’est configuré pour ce compte de démonstration.')
  const db = readDB()
  const now = new Date().toISOString()
  const record: Absence = { ...data, id: nextNumber(db.demandes), ownerId: user.id, statut: 'En attente', currentApproverId: user.managerId, decisions: [], createdAt: now, dateSoumission: now }
  db.demandes.push(record); saveDB(db); return record
}
export function cancelDemand(id: number): boolean {
  const user = getCurrentUser(); const db = readDB()
  const d = db.demandes.find(x => x.id === id)
  if (!user || !d || d.ownerId !== user.id || d.statut !== 'En attente') return false
  db.demandes = db.demandes.filter(x => x.id !== id); saveDB(db); return true
}
export function createReprise(data: Omit<Reprise, 'id'|'ownerId'|'statut'|'currentApproverId'|'decisions'|'dateSoumission'|'dateRepriseEffective'>): Reprise {
  const user = getCurrentUser()
  if (!user) throw new Error('Veuillez vous connecter.')
  if (!user.managerId) throw new Error('Aucun responsable supérieur n’est configuré pour ce compte de démonstration.')
  if (data.visiteMedicale && !data.documents.length) throw new Error('Veuillez joindre le justificatif médical avant la soumission.')
  if (data.absenceId !== null) {
    const absence = getDemand(data.absenceId)
    if (!absence || absence.ownerId !== user.id || !absence.dateDebut || !absence.dateFin) throw new Error('L’absence liée est introuvable ou ne contient pas les dates nécessaires.')
    // Les dates sont garanties par la base, même si le formulaire est modifié.
    data = { ...data, dateDebut: absence.dateDebut, dateReprisePrevue: absence.dateFin, absenceNature: absence.nature }
  }
  const db = readDB(); const now = new Date().toISOString()
  const record: Reprise = { ...data, id: nextNumber(db.reprises), ownerId: user.id, statut: 'En attente', currentApproverId: user.managerId, decisions: [], dateSoumission: now, dateRepriseEffective: now }
  db.reprises.push(record); saveDB(db); return record
}
export function decide(type: 'demande'|'reprise', id: number, kind: DecisionKind, reason = ''): Workflow {
  const db = readDB(); const user = getCurrentUser()
  const record = (type === 'demande' ? db.demandes : db.reprises).find(x => x.id === id)
  if (!user || !record || !canDecide(record)) throw new Error('Cette décision n’est plus disponible pour ce compte.')
  record.decisions.push({ userId: user.id, kind, at: new Date().toISOString(), ...(kind === 'rejeter' && reason.trim() ? { reason: reason.trim() } : {}) })
  if (kind === 'rejeter') { record.statut = 'Rejetée'; record.currentApproverId = null }
  else if (user.managerId) { record.statut = 'En attente'; record.currentApproverId = user.managerId }
  else { record.statut = 'Approuvée'; record.currentApproverId = null }
  saveDB(db); return record
}
export function saveSignalement(data: Omit<Signalement, 'id'|'date'>): void {
  const db = readDB(); db.signalements.push({ ...data, id: nextNumber(db.signalements), date: new Date().toISOString() }); saveDB(db)
}
export function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
export function formatDateTime(iso?: string | null, seconds = false): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return `${formatDate(iso)} - ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', ...(seconds ? { second: '2-digit' as const } : {}), hour12: false })}`
}
export function formatRelative(iso: string): { main: string; sub: string } {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { main: '—', sub: '' }
  const raw = `${d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  const days = Math.floor((Date.now() - d.getTime()) / 86400000)
  const sub = days < 0 ? 'À venir' : days < 1 ? "Aujourd’hui" : days === 1 ? 'Il y a 1 jour' : days < 30 ? `Il y a ${days} jours` : days < 60 ? 'Il y a 1 mois' : days < 365 ? `Il y a ${Math.floor(days / 30)} mois` : days < 730 ? 'Il y a 1 an' : `Il y a ${Math.floor(days / 365)} ans`
  return { main: raw.charAt(0).toUpperCase() + raw.slice(1), sub }
}
