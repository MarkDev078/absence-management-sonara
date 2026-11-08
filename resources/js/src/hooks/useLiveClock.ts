import { useState, useEffect, useCallback } from 'react'

export interface LiveClock {
  now: Date
  timeStr: string
  dateStr: string
  shortDate: string
  refresh: () => void
}

/**
 * Horloge live de la navbar — s'actualise chaque seconde.
 * Centralise le formattage FR pour éviter les 4 duplications par page.
 * Rafraîchit aussi la date à minuit automatiquement.
 */
export function useLiveClock(): LiveClock {
  const [now, setNow] = useState(() => new Date())

  const refresh = useCallback(() => setNow(new Date()), [])

  useEffect(() => {
    // Tick chaque seconde pour que le changement de minute tombe pile
    const iv = window.setInterval(() => setNow(new Date()), 1000)
    // Re-sync au retour d'onglet (visibility) pour éviter un affichage figé après veille
    const onVis = (): void => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(iv)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const timeStr = now.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const dateStr = now.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const shortDate = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return { now, timeStr, dateStr, shortDate, refresh }
}
