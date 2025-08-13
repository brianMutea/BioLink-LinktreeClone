export const runtime = 'nodejs'

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { linkId } = await request.json()
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''

    // Call the database function to increment clicks and track
    const { error } = await supabase.rpc('increment_link_clicks', {
      link_uuid: linkId,
      ip_addr: ip,
      user_agent_str: userAgent,
      referrer_str: referrer
    })

    if (error) {
      console.error('Error tracking click:', error)
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}