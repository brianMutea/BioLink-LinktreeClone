'use client'

import { useState, useEffect } from 'react'
import { Profile, Link, Collection, themes } from '@/types'
import { ExternalLink, ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface PublicProfileClientProps {
  profile: Profile
  links: Link[]
}

export default function PublicProfileClient({ profile, links }: PublicProfileClientProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const theme = themes.find(t => t.id === profile.theme) || themes[0]
  const activeLinks = links.filter(link => link.is_active).sort((a, b) => a.position - b.position)

  // Load collections
  useEffect(() => {
    loadCollections()
  }, [profile.id])

  const loadCollections = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .order('position', { ascending: true })

      if (error) throw error
      setCollections(data || [])
      
      // Expand all collections by default
      const allCollectionIds = new Set(data?.map(c => c.id) || [])
      setExpandedCollections(allCollectionIds)
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  const handleLinkClick = async (link: Link) => {
    // Track click
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkId: link.id }),
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
    
    // Open link
    window.open(link.url, '_blank')
  }

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  // Group links by collection
  const unGroupedLinks = activeLinks.filter(link => !link.collection_id)
  const groupedLinks = collections.map(collection => ({
    collection,
    links: activeLinks.filter(link => link.collection_id === collection.id)
  })).filter(group => group.links.length > 0)

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="w-full max-w-sm sm:max-w-md mx-auto">
        {/* Profile Section */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Avatar */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden bg-gray-200">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.display_name || profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-xl sm:text-2xl font-bold"
                style={{ 
                  backgroundColor: theme.buttonColor,
                  color: theme.buttonTextColor 
                }}
              >
                {(profile.display_name || profile.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Name */}
          <h1 
            className="text-xl sm:text-2xl font-bold mb-2"
            style={{ color: theme.textColor }}
          >
            {profile.display_name || `@${profile.username}`}
          </h1>

          {/* Bio */}
          {profile.bio && (
            <p 
              className="text-sm sm:text-base opacity-80 leading-relaxed mb-4 sm:mb-6 px-2"
              style={{ color: theme.textColor }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links and Collections */}
        <div className="space-y-3 sm:space-y-4">
          {/* Collections */}
          {groupedLinks.map(({ collection, links: collectionLinks }) => (
            <div key={collection.id} className="space-y-2 sm:space-y-3">
              {/* Collection Header */}
              <button
                className="w-full flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer"
                style={{
                  backgroundColor: `${theme.buttonColor}20`,
                  borderColor: theme.buttonColor,
                  border: `1px solid ${theme.buttonColor}40`
                }}
                onClick={() => toggleCollection(collection.id)}
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.textColor }} />
                  <span 
                    className="font-medium text-sm sm:text-base"
                    style={{ color: theme.textColor }}
                  >
                    {collection.title}
                  </span>
                </div>
                {expandedCollections.has(collection.id) ? (
                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.textColor }} />
                ) : (
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: theme.textColor }} />
                )}
              </button>

              {/* Collection Links */}
              {expandedCollections.has(collection.id) && (
                <div className="space-y-2 sm:space-y-3 ml-4 sm:ml-6">
                  {collectionLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleLinkClick(link)}
                      className="w-full p-3 sm:p-4 rounded-lg text-center font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer"
                      style={{
                        backgroundColor: theme.buttonColor,
                        color: theme.buttonTextColor,
                        border: `1px solid ${theme.buttonColor}`
                      }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span className="truncate text-sm sm:text-base">{link.title}</span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Ungrouped Links */}
          {unGroupedLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className="w-full p-3 sm:p-4 rounded-lg text-center font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm cursor-pointer"
              style={{
                backgroundColor: theme.buttonColor,
                color: theme.buttonTextColor,
                border: `1px solid ${theme.buttonColor}`
              }}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="truncate text-sm sm:text-base">{link.title}</span>
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </div>
            </button>
          ))}

          {/* Empty State */}
          {activeLinks.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <div 
                className="text-sm sm:text-base opacity-60"
                style={{ color: theme.textColor }}
              >
                No links available
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 sm:mt-12">
          <a
            href="/"
            className="text-xs sm:text-sm opacity-60 hover:opacity-80 transition-opacity cursor-pointer"
            style={{ color: theme.textColor }}
          >
            Create your own biolink
          </a>
        </div>
      </div>
    </div>
  )
}