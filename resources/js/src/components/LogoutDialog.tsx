type Props = { isOpen: boolean; onConfirm: () => void; onCancel: () => void }
export default function LogoutDialog({ isOpen, onConfirm, onCancel }: Props): React.ReactElement | null {
  if (!isOpen) return null
  return (
    <div className="avert-overlay" onClick={onCancel}>
      <div className="avert-dialog" onClick={e => e.stopPropagation()}>
        <header className="avert-header">
          <h2>DÉCONNEXION</h2>
          <span className="material-symbols-outlined">logout</span>
        </header>
        <div className="avert-body">
          <p>Vous êtes sur le point de vous déconnecter de votre session.</p>
          <p className="avert-ask">Voulez-vous vraiment vous déconnecter ?</p>
        </div>
        <footer className="avert-footer">
          <button className="avert-btn avert-btn-danger" onClick={onConfirm}><span className="material-symbols-outlined">logout</span> ME DÉCONNECTER</button>
          <button className="avert-btn avert-btn-cancel" onClick={onCancel}><span className="material-symbols-outlined">close</span> RESTER</button>
        </footer>
      </div>
    </div>
  )
}
