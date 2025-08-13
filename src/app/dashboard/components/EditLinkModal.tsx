'use client'
export const runtime = 'nodejs'

import { useState } from 'react'
import { Link } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Link as LinkIcon, Trash2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface EditLinkModalProps {
  link: Link
  onClose: () => void
  onUpdate: (link: Link) => void
  onDelete: (linkId: string) => void
}

export default function EditLinkModal({ link, onClose, onUpdate, onDelete }: EditLinkModalProps) {
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
      
      const { data, error } = await supabase
        .from('links')
        .update({
          title: title || 'Untitled',
          url: validUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', link.id)
        .select()
        .single()

      if (error) {
        setError('Failed to update link: ' + error.message)
      } else if (data) {
        onUpdate(data)
      }
    } catch (err) {
      setError('Failed to update link. Please try again.')
      console.error('Update link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) return
    
    setIsDeleting(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', link.id)

      if (error) {
        setError('Failed to delete link: ' + error.message)
      } else {
        onDelete(link.id)
      }
    } catch (err) {
      setError('Failed to delete link. Please try again.')
      console.error('Delete link error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Edit link</h2>
          <button
            onClick={onClose}
            className="text-black-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
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
                Title
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

          <div className="mt-8 flex justify-between">
            {/* Delete Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || isLoading}
              className="px-4 py-2.5 text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isDeleting}
                className="px-6 py-2.5 text-sm font-medium border-gray-200 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || isDeleting || !url.trim()}
                className="px-6 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}