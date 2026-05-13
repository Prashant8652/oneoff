'use client'
// src/hooks/useCountdown.ts
import { useState, useEffect } from 'react'
import { getCountdown, type CountdownTime } from '@/lib/utils'

export function useCountdown(expiresAt: string | null): CountdownTime {
  const [time, setTime] = useState<CountdownTime>({
    hours: 0, minutes: 0, seconds: 0, total: 0
  })

  useEffect(() => {
    if (!expiresAt) return
    const tick = () => setTime(getCountdown(expiresAt))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return time
}
