'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { Profile, themes } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Upload, User as UserIcon, Check, Copy, ExternalLink, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface SettingsModalProps {
  user: User
  profile: Profile
  onClose: () => void
  onUpdate: (profile: Profile) => void
}

export default function SettingsModal({ user, profile, onClose, onUpdate }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account'>('profile')
  
  // Profile tab state
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  
  // Appearance tab state
  const [selectedTheme, setSelectedTheme] = useState(profile.theme || 'default')
  
  // Account tab state
  const [username, setUsername] = useState(profile.username || '')
  const [isPublic, setIsPublic] = useState(profile.is_public)
  
  // General state
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const profileUrl = `${window.location.origin}/${profile.username}`

  const handleSave = async () => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      
      // Check if username is already taken (if changed)
      if (username !== profile.username) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', profile.id)
          .single()

        if (existingProfile) {
          setError('Username is already taken')
          setIsLoading(false)
          return
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          bio: bio || null,
          theme: selectedTheme,
          username: username.toLowerCase().trim(),
          is_public: isPublic
        })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      onUpdate(data)
      setSuccess('Settings updated successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      const { data, error } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error

      onUpdate(data)
      setSuccess('Profile picture updated!')
    } catch (error) {
      setError('Failed to upload profile picture')
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const copyProfileUrl = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const validateUsername = (value: string) => {
    const regex = /^[a-zA-Z0-9_-]+$/
    return regex.test(value) && value.length >= 3 && value.length <= 30
  }

  return (
    <div className="absolute inset-0 bg-black/10 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="cursor-pointer text-xl font-semibold text-gray-900 ">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'appearance'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Appearance
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'account'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Account
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <Check className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Profile Picture
                </Label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Display Name */}
              <div>
                <Label htmlFor="display-name" className="text-sm font-medium text-gray-700">
                  Display Name
                </Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                  className="mt-1"
                />
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell people about yourself"
                  rows={3}
                  maxLength={160}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">{bio.length}/160 characters</p>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Theme
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {themes.map((theme) => (
                    <div
                      key={theme.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTheme === theme.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTheme(theme.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: theme.backgroundColor }}
                        >
                          <div
                            className="w-full h-full rounded-full border-2"
                            style={{ borderColor: theme.buttonColor }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-gray-500">
                            {theme.id === 'default' && 'Clean and simple'}
                            {theme.id === 'dark' && 'Dark mode'}
                            {theme.id === 'purple' && 'Purple accent'}
                            {theme.id === 'blue' && 'Blue accent'}
                            {theme.id === 'green' && 'Green accent'}
                            {theme.id === 'pink' && 'Pink accent'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Profile URL */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">Your BioLink URL</h3>
                    <p className="text-sm text-blue-700">{profileUrl}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyProfileUrl}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(profileUrl, '_blank')}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user.email || ''}
                  disabled
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className={`mt-1 ${!validateUsername(username) && username ? 'border-red-300' : ''}`}
                />
                {!validateUsername(username) && username && (
                  <p className="text-xs text-red-600 mt-1">
                    Username must be 3-30 characters and contain only letters, numbers, hyphens, and underscores
                  </p>
                )}
              </div>

              {/* Privacy Settings */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Public Profile</h4>
                  <p className="text-sm text-gray-600">Allow others to view your profile and links</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || (activeTab === 'account' && !validateUsername(username))}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}