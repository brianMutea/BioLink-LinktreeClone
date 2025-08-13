'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const supabase = createClient()
  const router = useRouter()

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

    try {
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

  const handleAppleSignIn = async () => {
    setError('Apple sign-in is not configured yet. Please use email/password.')
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
    <Label htmlFor="email" className="sr-only">
      Email or username
    </Label>
    <Input
      id="email"
      placeholder="Email or username"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg h-12"
      required
      disabled={isSubmitting}
    />
  </div>

  <div>
    <Label htmlFor="password" className="sr-only">
      Password
    </Label>
    <Input
      id="password"
      placeholder="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent rounded-lg h-12"
      required
      disabled={isSubmitting}
    />
  </div>

  <Button
    type="submit"
    className="w-full bg-gray-800 text-white hover:bg-gray-900 cursor-pointer font-medium h-12 rounded-lg"
    disabled={isSubmitting || !email || !password}
  >
    {isSubmitting ? 'Signing in...' : 'Continue'}
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

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full border-gray-300 hover:bg-gray-50 cursor-pointer font-medium h-12 rounded-lg"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        <Button
          variant="outline"
          className="w-full border-gray-300 hover:bg-gray-50 cursor-pointer font-medium h-12 rounded-lg"
          onClick={handleAppleSignIn}
          disabled={isSubmitting}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continue with Apple
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-center space-x-1 text-sm">
          <Link 
            href="/forgot-password" 
            className="text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            Forgot password?
          </Link>
          <span className="text-gray-400">•</span>
          <Link 
            href="/forgot-username" 
            className="text-purple-600 hover:text-purple-700 cursor-pointer"
          >
            Forgot username?
          </Link>
        </div>
        
        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/signup"
            className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}