// src/app/drop/page.tsx
import { getTodayDrop } from '@/lib/supabase'
import { DropDetail } from '@/components/drop/DropDetail'
import { notFound, redirect } from 'next/navigation'

export const revalidate = 30

export default async function DropPage() {
  const drop = await getTodayDrop()
  if (!drop) notFound()

  return <DropDetail drop={drop} />
}
