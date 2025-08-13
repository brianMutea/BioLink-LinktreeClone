
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  // Redirect to signup by default
  redirect('/auth/signup')
}