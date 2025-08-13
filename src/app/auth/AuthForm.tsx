'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignUp, setIsSignUp] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const createUserProfile = async (userId: string, userEmail: string) => {
    try {
      // Generate a clean username from email (just the part before @)
      const baseUsername = userEmail.split('@')[0]
      let username = baseUsername
      let attempt = 0
      
      // Try to find an available username
      while (attempt < 10) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .single()
        
        if (!existingUser) {
          // Username is available
          break
        }
        
        // Username is taken, try with a number suffix
        attempt++
        username = `${baseUsername}${attempt}`
      }
      
      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            username: username,
            avatar_url: null,
            theme: null
          }
        ])
      
      if (error) {
        console.error('Error creating profile:', error)
        // Don't throw error here as auth was successful
      }
    } catch (err) {
      console.error('Error in createUserProfile:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsSubmitting(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        
        if (error) {
          // Handle specific Supabase errors
          if (error.message.includes('Invalid email')) {
            setError('Please enter a valid email address')
          } else if (error.message.includes('Password')) {
            setError('Password must be at least 6 characters long')
          } else if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Try signing in instead.')
          } else {
            setError(error.message)
          }
        } else if (data.user) {
          // Create user profile
          await createUserProfile(data.user.id, email)
          
          if (data.user.email_confirmed_at) {
            // User is immediately confirmed (email confirmation disabled)
            setSuccess('Account created successfully! Redirecting...')
            setTimeout(() => router.push('/dashboard'), 1500)
          } else {
            // Email confirmation required
            setSuccess('Please check your email to confirm your account before signing in.')
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials.')
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please confirm your email address before signing in.')
          } else {
            setError(error.message)
          }
        } else if (data.user) {
          setSuccess('Signed in successfully! Redirecting...')
          setTimeout(() => router.push('/dashboard'), 1000)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true)
    setError('')
    setSuccess('')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        if (error.message.includes('OAuth')) {
          setError('Google sign-in is not configured. Please use email/password.')
        } else {
          setError(error.message)
        }
        setIsSubmitting(false)
      }
      // If successful, user will be redirected
    } catch (err) {
      console.error('Google auth error:', err)
      setError('Failed to sign in with Google. Please try email/password.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
          {success}
        </div>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
          <Input
            id="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-purple-500"
            required
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="submit"
          className="w-full bg-purple-600 text-white hover:bg-purple-700 cursor-pointer font-medium py-3 rounded-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isSignUp ? 'Creating account...' : 'Signing in...') : 'Continue'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="px-3 bg-white text-gray-500 font-medium">OR</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full border-gray-300 hover:bg-gray-50 cursor-pointer font-medium py-3 rounded-full"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        {isSignUp ? 'Sign up with Google' : 'Sign in with Google'}
      </Button>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setError('')
            setSuccess('')
          }}
          className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer underline"
          disabled={isSubmitting}
        >
          {isSignUp ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}