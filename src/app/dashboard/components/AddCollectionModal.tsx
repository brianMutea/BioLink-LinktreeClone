'use client'
export const runtime = 'nodejs'

import { useState } from 'react'
import { Profile, Collection } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Folder } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface AddCollectionModalProps {
  onClose: () => void
  onAdd: (collection: Collection) => void
  profile: Profile
}

export default function AddCollectionModal({ onClose, onAdd, profile }: AddCollectionModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!title.trim()) {
      setError('Collection title is required')
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Get the next position
      const { data: collections } = await supabase
        .from('collections')
        .select('position')
        .eq('user_id', profile.id)
        .order('position', { ascending: false })
        .limit(1)
      
      const nextPosition = collections && collections.length > 0 ? collections[0].position + 1 : 0

      // Insert new collection
      const { data, error } = await supabase
        .from('collections')
        .insert([
          {
            title: title.trim(),
            description: description.trim() || null,
            user_id: profile.id,
            position: nextPosition,
            is_active: true
          }
        ])
        .select()
        .single()

      if (error) {
        setError('Failed to create collection: ' + error.message)
      } else if (data) {
        onAdd(data)
      }
    } catch (err) {
      setError('Failed to create collection. Please try again.')
      console.error('Add collection error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add collection</h2>
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
                Collection title
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Folder className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Social Media"
                  className="h-12 pl-12 text-base border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                Description (optional)
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this collection"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm text-black"
              />
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
              disabled={isLoading || !title.trim()}
              className="px-6 py-2.5 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Creating...' : 'Create collection'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}