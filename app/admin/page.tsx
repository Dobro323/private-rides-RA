import { createServiceClient } from '@/lib/supabase/server'

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
  const { data: rides, error } = await supabase
    .from('rides')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ fontFamily: 'monospace', padding: 40 }}>
      <h2>Debug Admin</h2>
      <p><b>Error:</b> {error ? JSON.stringify(error) : 'none'}</p>
      <p><b>Rides count:</b> {rides?.length ?? 0}</p>
      <pre style={{ fontSize: 12 }}>{JSON.stringify(rides, null, 2)}</pre>
    </div>
  )
}
