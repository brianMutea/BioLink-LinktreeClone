import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignupForm from './SignupForm'

export default async function SignupPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">BioLink - Linktree Inspired Clone
</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Join BioLink
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Sign up for free!
              </p>
            </div>
            
            <SignupForm />
            
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              By clicking <span className="font-semibold">Create account</span>, you agree to BioLink&apos;s{' '}
              <Link
                href="/terms"
                className="text-gray-700 underline hover:text-gray-900 cursor-pointer"
              >
                privacy notice
              </Link>
              ,{' '}
              <Link
                href="/privacy"
                className="text-gray-700 underline hover:text-gray-900 cursor-pointer"
              >
                T&Cs
              </Link>
              {' '}and to receive offers, news and updates.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Creative Visual */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Geometric shapes */}
            <div className="absolute top-1/4 right-1/4 w-56 h-56 bg-purple-400/20 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-white/25 rounded-3xl rotate-45"></div>
            <div className="absolute top-1/2 left-1/2 w-28 h-28 bg-blue-400/30 rounded-2xl -rotate-12"></div>
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-green-400/25 rounded-full"></div>
          </div>
          
          {/* Mock Linktree profile showcasing creator features */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-sm">
              {/* Profile header with creator badge */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs">📸</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Nikole Brake</h3>
                  <p className="text-sm text-gray-600">under of Shape Shifters</p>
                </div>
              </div>

              {/* Username display */}
              <div className="mb-4 bg-purple-500 rounded-2xl p-3 flex items-center space-x-2">
                <span className="text-white text-lg">✱</span>
                <span className="text-white font-semibold">/shapeshft3rs</span>
                <span className="text-white text-lg">📷</span>
              </div>
              
              {/* Mock expandable sections */}
              <div className="space-y-3">
                <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Slow flow</span>
                  <span className="text-gray-400">⌄</span>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Online courses</span>
                  <span className="text-gray-400">⌄</span>
                </div>
                <div className="bg-gray-100 rounded-xl p-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">Wellness retreats</span>
                  <span className="text-gray-400">⌄</span>
                </div>
              </div>

              {/* Social media icons */}
              <div className="flex justify-center space-x-3 mt-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">𝕏</span>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">▶</span>
                </div>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">♪</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom floating image card */}
          <div className="absolute bottom-8 right-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs">
              <div className="w-full h-32 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🧘‍♀️</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">Mindful Movement</p>
            </div>
          </div>

          {/* Top floating help icon */}
          <div className="absolute top-8 right-8">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}