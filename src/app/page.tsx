export const runtime = 'nodejs'

import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/auth')
}
