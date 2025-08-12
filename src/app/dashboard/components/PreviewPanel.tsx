'use client'

import { useState, useEffect } from 'react'
import { Profile, Link, Collection, themes } from '@/types'
import { ExternalLink, ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface PreviewPanelProps {
  profile: Profile
  links: Link[]
  collections: Collection[]
}

export default function PreviewPanel({ profile, links, collections }: PreviewPanelProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const theme = themes.find(t => t.id === profile.theme) || themes[0]
  const activeLinks = links.filter(link => link.is_active).sort((a, b) => a.position - b.position)

  // Expand all collections by default in preview
  useEffect(() => {
    const allCollectionIds = new Set(collections.map(c => c.id))
    setExpandedCollections(allCollectionIds)
  }, [collections])

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
    <div className="h-full bg-gray-50 p-4 lg:p-6 flex items-center justify-center">
      {/* Phone Frame */}
      <div className="relative">
        {/* Phone Outer Frame */}
        <div className="w-72 h-[580px] lg:w-80 lg:h-[640px] bg-black rounded-[2.5rem] lg:rounded-[3rem] p-2 shadow-2xl">
          {/* Phone Screen */}
          <div 
            className="w-full h-full rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden relative"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            {/* Status Bar */}
            <div className="h-6 bg-black bg-opacity-10 flex items-center justify-between px-4 lg:px-6 text-xs font-medium">
              <span style={{ color: theme.textColor }}>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-current rounded-sm">
                  <div className="w-2 h-1 bg-current rounded-sm m-0.5"></div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 px-4 lg:px-6 py-6 lg:py-8 overflow-y-auto">
              {/* Profile Section */}
              <div className="text-center mb-6 lg:mb-8">
                {/* Avatar */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-3 lg:mb-4 rounded-full overflow-hidden bg-gray-200">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name || profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-xl lg:text-2xl font-bold"
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
                  className="text-lg lg:text-xl font-bold mb-2"
                  style={{ color: theme.textColor }}
                >
                  {profile.display_name || `@${profile.username}`}
                </h1>

                {/* Bio */}
                {profile.bio && (
                  <p 
                    className="text-sm opacity-80 leading-relaxed"
                    style={{ color: theme.textColor }}
                  >
                    {profile.bio}
                  </p>
                )}
              </div>

              {/* Links and Collections */}
              <div className="space-y-3 lg:space-y-4">
                {/* Collections */}
                {groupedLinks.map(({ collection, links: collectionLinks }) => (
                  <div key={collection.id} className="space-y-2">
                    {/* Collection Header */}
                    <button
                      className="w-full flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105"
                      style={{
                        backgroundColor: `${theme.buttonColor}20`,
                        borderColor: theme.buttonColor,
                        border: `1px solid ${theme.buttonColor}40`
                      }}
                      onClick={() => toggleCollection(collection.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <Folder className="w-4 h-4" style={{ color: theme.textColor }} />
                        <span 
                          className="font-medium text-sm"
                          style={{ color: theme.textColor }}
                        >
                          {collection.title}
                        </span>
                      </div>
                      {expandedCollections.has(collection.id) ? (
                        <ChevronDown className="w-4 h-4" style={{ color: theme.textColor }} />
                      ) : (
                        <ChevronRight className="w-4 h-4" style={{ color: theme.textColor }} />
                      )}
                    </button>

                    {/* Collection Links */}
                    {expandedCollections.has(collection.id) && (
                      <div className="space-y-2 ml-4">
                        {collectionLinks.map((link) => (
                          <button
                            key={link.id}
                            onClick={() => handleLinkClick(link)}
                            className="w-full p-3 rounded-lg text-center font-medium transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
                            style={{
                              backgroundColor: theme.buttonColor,
                              color: theme.buttonTextColor,
                              border: `1px solid ${theme.buttonColor}`
                            }}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span className="truncate text-sm">{link.title}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
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
                    className="w-full p-3 lg:p-4 rounded-lg text-center font-medium transition-all duration-200 hover:scale-105 cursor-pointer shadow-sm"
                    style={{
                      backgroundColor: theme.buttonColor,
                      color: theme.buttonTextColor,
                      border: `1px solid ${theme.buttonColor}`
                    }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span className="truncate text-sm lg:text-base">{link.title}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </div>
                  </button>
                ))}

                {/* Empty State */}
                {activeLinks.length === 0 && (
                  <div className="text-center py-8 lg:py-12">
                    <div 
                      className="text-sm opacity-60"
                      style={{ color: theme.textColor }}
                    >
                      No links added yet
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Phone Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 lg:w-32 h-1 bg-white rounded-full opacity-60"></div>
      </div>
    </div>
  )
}