import type { ReactElement } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.tsx'
import Dashboard from './pages/Dashboard.tsx'
import NouvelleDemande from './pages/NouvelleDemande.tsx'
import Historique from './pages/Historique.tsx'
import DemandeDetail from './pages/DemandeDetail.tsx'
import NouvelleReprise from './pages/NouvelleReprise.tsx'
import RepriseDetail from './pages/RepriseDetail.tsx'
import ManagerDetail from './pages/ManagerDetail.tsx'
import { ReportProvider } from './components/ReportDialog.tsx'
import { getCurrentUser } from './data/demoDb.ts'

function Private({ children }: { children: ReactElement }): ReactElement {
  return getCurrentUser() ? children : <Navigate to="/" replace />
}
export default function App(): ReactElement {
  return <BrowserRouter><ReportProvider><Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
    <Route path="/nouvelle-demande" element={<Private><NouvelleDemande /></Private>} />
    <Route path="/historique" element={<Private><Historique /></Private>} />
    <Route path="/demande/:id" element={<Private><DemandeDetail /></Private>} />
    <Route path="/nouvelle-reprise" element={<Private><NouvelleReprise /></Private>} />
    <Route path="/reprise/:id" element={<Private><RepriseDetail /></Private>} />
    <Route path="/equipe" element={<Private><Historique team /></Private>} />
    <Route path="/equipe/demande/:id" element={<Private><ManagerDetail /></Private>} />
    <Route path="/equipe/reprise/:id" element={<Private><ManagerDetail type="reprise" /></Private>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ReportProvider></BrowserRouter>
}
