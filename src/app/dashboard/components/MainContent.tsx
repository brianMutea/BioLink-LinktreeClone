'use client'

import { User } from '@supabase/supabase-js'
import { Profile, Link, Collection } from '@/types'
import LinksTab from './tabs/LinksTab'

interface MainContentProps {
  user: User
  profile: Profile
  links: Link[]
  collections: Collection[]
  onLinksChange: (links: Link[]) => void
  onCollectionsChange: (collections: Collection[]) => void
  onProfileChange: (profile: Profile) => void
}

export default function MainContent({
  profile,
  links,
  collections,
  onLinksChange,
  onCollectionsChange,
}: MainContentProps) {
  return (
    <div className="flex-1 min-w-0 bg-white lg:bg-gray-50">
      <LinksTab
        profile={profile}
        links={links}
        collections={collections}
        onLinksChange={onLinksChange}
        onCollectionsChange={onCollectionsChange}
      />
    </div>
  )
}