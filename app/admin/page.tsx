import { createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminClient from './AdminClient'

// Simple secret-based protection (add proper auth later)
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { secret?: string; status?: string }
}) {
  if (searchParams.secret !== process.env.ADMIN_SECRET) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 40 }}>
        <h2>401 — Access Denied</h2>
        <p>Add ?secret=YOUR_ADMIN_SECRET to the URL</p>
      </div>
    )
  }

  const supabase = createServiceClient()
  const statusFilter = searchParams.status || 'all'

  let query = supabase
    .from('rides')
    .select('*, drivers(name)')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: rides } = await query

  return <AdminClient rides={rides || []} secret={searchParams.secret!} currentStatus={statusFilter} />
}
