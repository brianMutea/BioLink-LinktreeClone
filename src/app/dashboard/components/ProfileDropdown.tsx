'use client'
export const runtime = 'nodejs'

import { useState, useRef, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile } from '@/types'
import { ChevronDown, Settings, LogOut, ExternalLink } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface ProfileDropdownProps {
  user: User
  profile: Profile
  onSettingsClick: () => void
}

export default function ProfileDropdown({ profile, onSettingsClick }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth')
  }

  const handleViewProfile = () => {
    window.open(`/${profile.username}`, '_blank')
    setIsOpen(false)
  }

  const handleSettingsClick = () => {
    onSettingsClick()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white font-bold">
              {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="font-medium text-gray-900 truncate">
            {profile.display_name || profile.username}
          </div>
          <div className="text-sm text-gray-500 truncate">
            biolink/{profile.username}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* View Profile */}
          <button
            onClick={handleViewProfile}
            className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">View profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={handleSettingsClick}
            className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700 cursor-pointer">Settings</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Log out</span>
          </button>
        </div>
      )}
    </div>
  )
}