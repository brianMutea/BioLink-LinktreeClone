export interface Profile {
  id: string
  username: string
  display_name?: string
  bio?: string
  avatar_url?: string
  theme: string
  is_public: boolean
  created_at: string
  updated_at?: string
}

export interface Collection {
  id: string
  user_id: string
  title: string
  description?: string
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Link {
  id: string
  user_id: string
  collection_id?: string | null
  title: string
  url: string
  description?: string
  position: number
  is_active: boolean
  click_count: number
  icon?: string
  created_at: string
  updated_at: string
}

export interface LinkClick {
  id: string
  link_id: string
  clicked_at: string
  ip_address?: string
  user_agent?: string
  referrer?: string
}

export interface Theme {
  id: string
  name: string
  backgroundColor: string
  textColor: string
  buttonColor: string
  buttonTextColor: string
}

export const themes: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    buttonColor: '#000000',
    buttonTextColor: '#ffffff'
  },
  {
    id: 'dark',
    name: 'Dark',
    backgroundColor: '#1a1a1a',
    textColor: '#ffffff',
    buttonColor: '#ffffff',
    buttonTextColor: '#000000'
  },
  {
    id: 'purple',
    name: 'Purple',
    backgroundColor: '#f3f4f6',
    textColor: '#1f2937',
    buttonColor: '#8b5cf6',
    buttonTextColor: '#ffffff'
  },
  {
    id: 'blue',
    name: 'Blue',
    backgroundColor: '#eff6ff',
    textColor: '#1e40af',
    buttonColor: '#3b82f6',
    buttonTextColor: '#ffffff'
  },
  {
    id: 'green',
    name: 'Green',
    backgroundColor: '#f0fdf4',
    textColor: '#166534',
    buttonColor: '#22c55e',
    buttonTextColor: '#ffffff'
  },
  {
    id: 'pink',
    name: 'Pink',
    backgroundColor: '#fdf2f8',
    textColor: '#be185d',
    buttonColor: '#ec4899',
    buttonTextColor: '#ffffff'
  }
]

export const THEME_OPTIONS = {
  backgrounds: [
    { id: 'gradient-1', name: 'Sunset', preview: 'bg-gradient-to-br from-orange-400 to-pink-500' },
    { id: 'gradient-2', name: 'Ocean', preview: 'bg-gradient-to-br from-blue-400 to-teal-500' },
    { id: 'gradient-3', name: 'Forest', preview: 'bg-gradient-to-br from-green-400 to-emerald-600' },
    { id: 'gradient-4', name: 'Purple', preview: 'bg-gradient-to-br from-purple-400 to-pink-500' },
    { id: 'solid-white', name: 'White', preview: 'bg-white' },
    { id: 'solid-black', name: 'Black', preview: 'bg-gray-900' },
  ],
  buttonStyles: [
    { id: 'rounded', name: 'Rounded', preview: 'rounded-full' },
    { id: 'square', name: 'Square', preview: 'rounded-lg' },
    { id: 'minimal', name: 'Minimal', preview: 'rounded-none border-b-2' },
  ]
}