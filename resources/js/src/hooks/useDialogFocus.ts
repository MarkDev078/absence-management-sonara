import { useEffect, useRef } from 'react'

/** Fermeture au clavier et confinement du focus dans une modale ouverte. */
export function useDialogFocus<T extends HTMLElement>(open: boolean, onDismiss: () => void): React.RefObject<T | null> {
  const ref = useRef<T>(null)
  const dismiss = useRef(onDismiss)
  dismiss.current = onDismiss
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const timer = window.setTimeout(() => {
      const preferred = ref.current?.querySelector<HTMLElement>('[autofocus]')
      const first = ref.current?.querySelector<HTMLElement>('input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])')
      ;(preferred || first || ref.current)?.focus()
    }, 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); dismiss.current(); return }
      if (e.key !== 'Tab' || !ref.current) return
      const elements = Array.from(ref.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter(el => !!el.getClientRects().length)
      if (!elements.length) { e.preventDefault(); return }
      const first = elements[0]; const last = elements[elements.length - 1]
      if (e.shiftKey && (document.activeElement === first || !ref.current.contains(document.activeElement))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(timer); document.removeEventListener('keydown', onKey); if (previous?.isConnected) previous.focus() }
  }, [open])
  return ref
}
