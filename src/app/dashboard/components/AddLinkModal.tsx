'use client'

import { useState } from 'react'
import { Profile, Link } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, ExternalLink, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AddLinkModalProps {
  onClose: () => void
  onAdd: (link: Link) => void
  profile: Profile
}

export default function AddLinkModal({ onClose, onAdd, profile }: AddLinkModalProps) {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateUrl = (inputUrl: string) => {
    if (!inputUrl) return ''
    
    // Add https:// if missing
    let formattedUrl = inputUrl
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      formattedUrl = 'https://' + inputUrl
    }
    
    try {
      new URL(formattedUrl)
      return formattedUrl
    } catch {
      return ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate URL
    const validUrl = validateUrl(url)
    if (!validUrl) {
      setError('Please enter a valid URL')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Get the next position
      const { data: links } = await supabase
        .from('links')
        .select('position')
        .eq('user_id', profile.id)
        .order('position', { ascending: false })
        .limit(1)
      
      const nextPosition = links && links.length > 0 ? links[0].position + 1 : 0

      // Insert new link (without click_count as it has a default value)
      const { data, error } = await supabase
        .from('links')
        .insert([
          {
            title: title || 'Untitled',
            url: validUrl,
            user_id: profile.id,
            position: nextPosition,
            is_active: true
          }
        ])
        .select()
        .single()

      if (error) {
        setError('Failed to add link: ' + error.message)
      } else if (data) {
        // Add default values for fields that might not be returned
        const newLink: Link = {
          ...data,
          click_count: data.click_count || 0,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString()
        }
        onAdd(newLink)
      }
    } catch (err) {
      setError('Failed to add link. Please try again.')
      console.error('Add link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add link</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Title (optional)
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. My Instagram"
                className="h-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>

            <div>
              <Label htmlFor="url" className="text-sm font-medium text-gray-700 mb-2 block">
                URL
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g. instagram.com/username"
                  className="h-12 pl-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2.5 text-sm font-medium border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="px-6 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Adding...' : 'Add link'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}