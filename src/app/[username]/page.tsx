export const runtime = 'nodejs'

import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Profile, Link } from '@/types'
import PublicProfileClient from './PublicProfileClient'

interface PublicProfilePageProps {
  params: Promise<{
    username: string
  }>
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()
  
  // Get profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .eq('is_public', true)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // Get active links for this profile
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  const activeLinks = links || []

  return (
    <PublicProfileClient 
      profile={profile as Profile} 
      links={activeLinks as Link[]} 
    />
  )
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { username } = await params
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, username')
    .eq('username', username)
    .eq('is_public', true)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  return {
    title: `${profile.display_name || profile.username} - Biolink`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s links`,
  }
}
