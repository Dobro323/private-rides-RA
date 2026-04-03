import { createServiceClient } from '@/lib/supabase/server'
import AdminClient from './AdminClient'

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
    .select('*')
    .order('created_at', { ascending: false })

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: rides } = await query

  return <AdminClient rides={rides || []} secret={searchParams.secret!} currentStatus={statusFilter} />
}
