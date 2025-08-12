import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Get or create profile
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Create profile if it doesn't exist
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          theme: 'default',
          is_public: true,
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      redirect('/auth')
    }

    profile = newProfile
  }

  // Get user's links
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  return (
    <DashboardClient
      user={user}
      profile={profile}
      initialLinks={links || []}
    />
  )
}