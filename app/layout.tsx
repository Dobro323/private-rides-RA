import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Private Rides — Sacramento',
  description: 'Personal driver service in Sacramento, CA. Help with bags, strollers, walkers. Up to 50 miles.',
  keywords: 'private ride Sacramento, personal driver Sacramento, ride with luggage help',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
