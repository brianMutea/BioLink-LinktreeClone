'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile, Link, Collection } from '@/types'
import ProfileDropdown from './components/ProfileDropdown'
import MainContent from './components/MainContent'
import PreviewPanel from './components/PreviewPanel'
import SettingsModal from './components/SettingsModal'
import { createClient } from '@/utils/supabase/client'

interface DashboardClientProps {
  user: User
  profile: Profile
  initialLinks: Link[]
}

export default function DashboardClient({ user, profile, initialLinks }: DashboardClientProps) {
  const [links, setLinks] = useState<Link[]>(initialLinks)
  const [currentProfile, setCurrentProfile] = useState<Profile>(profile)
  const [collections, setCollections] = useState<Collection[]>([])
  const [showSettings, setShowSettings] = useState(false)

  // Load collections
  useEffect(() => {
    loadCollections()
  }, [currentProfile.id])

  const loadCollections = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', currentProfile.id)
        .eq('is_active', true)
        .order('position', { ascending: true })

      if (error) throw error
      setCollections(data || [])
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">BioLink</span>
          </div>

          {/* Mobile Profile */}
          <div className="w-48">
            <ProfileDropdown 
              user={user}
              profile={currentProfile}
              onSettingsClick={() => setShowSettings(true)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 bg-white border-r border-gray-200 flex-shrink-0 min-h-screen">
          <div className="p-4">
            {/* Logo */}
            <div className="flex items-center mb-8">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">BioLink</span>
            </div>

            {/* Profile Dropdown */}
            <ProfileDropdown 
              user={user}
              profile={currentProfile}
              onSettingsClick={() => setShowSettings(true)}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col xl:flex-row min-w-0">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <MainContent
              user={user}
              profile={currentProfile}
              links={links}
              collections={collections}
              onLinksChange={setLinks}
              onCollectionsChange={setCollections}
              onProfileChange={setCurrentProfile}
            />
          </div>

          {/* Preview Panel - Hidden on mobile, shown on desktop */}
          <div className="hidden xl:block w-96 flex-shrink-0 border-l border-gray-200">
            <PreviewPanel
              profile={currentProfile}
              links={links}
              collections={collections}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          profile={currentProfile}
          onClose={() => setShowSettings(false)}
          onUpdate={setCurrentProfile}
        />
      )}
    </div>
  )
}