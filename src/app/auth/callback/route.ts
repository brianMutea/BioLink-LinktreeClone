export const runtime = 'nodejs'

import { type EmailOtpType, type SupabaseClient } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

const createUserProfile = async (supabase: SupabaseClient, userId: string, userEmail: string) => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      // Generate a username from email
      const username = userEmail.split('@')[0] + '_' + Math.random().toString(36).substring(2, 8)
      
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: username,
            avatar_url: null,
            theme: null
          }
        ])
      
      if (error) {
        console.error('Error creating profile:', error)
      }
    }
  } catch (err) {
    console.error('Error in createUserProfile:', err)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'
  const code = searchParams.get('code')

  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('code')
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      // Create profile for OAuth users
      await createUserProfile(supabase, data.user.id, data.user.email || '')
      return NextResponse.redirect(redirectTo)
    }
  }

  if (token_hash && type) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error && data.user) {
      // Create profile for email verification users
      await createUserProfile(supabase, data.user.id, data.user.email || '')
      return NextResponse.redirect(redirectTo)
    }
  }

  // redirect the user to an error page with some instructions
  redirectTo.pathname = '/auth'
  redirectTo.searchParams.set('error', 'Could not authenticate user')
  return NextResponse.redirect(redirectTo)
}