export const runtime = 'nodejs'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import LoginForm from './LoginForm'

export default async function LoginPage() {
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
              <span className="ml-2 text-xl font-bold text-gray-900">BioLink - Linktree Inspired Clone</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Log in to your BioLink
              </p>
            </div>
            
            <LoginForm />
          </div>
        </div>
      </div>

      {/* Right side - Creative Visual */}
      <div className="hidden lg:block relative flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-green-400">
          {/* Decorative geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Large geometric shapes */}
            <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-yellow-400/20 rounded-3xl rotate-12"></div>
            <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-white/30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-pink-400/25 rounded-2xl -rotate-45"></div>
            <div className="absolute bottom-1/4 right-1/3 w-36 h-36 bg-orange-400/20 rounded-full"></div>
          </div>
          
          {/* Mock Linktree profile showcasing features */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-sm">
              {/* Profile header */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Alex Chen</h3>
                  <p className="text-sm text-gray-600">Digital Creator</p>
                </div>
              </div>
              
              {/* Mock links */}
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 text-center border border-pink-200">
                  <span className="text-sm font-semibold text-gray-800">🎥 Latest YouTube Video</span>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl p-4 text-center border border-blue-200">
                  <span className="text-sm font-semibold text-gray-800">📸 Instagram</span>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 text-center border border-green-200">
                  <span className="text-sm font-semibold text-gray-800">🛍️ Shop My Favorites</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating social media icons */}
          <div className="absolute top-8 right-8 flex flex-col space-y-4">
            <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white font-bold text-lg">▶</span>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">📷</span>
            </div>
          </div>

          {/* Bottom floating elements */}
          <div className="absolute bottom-8 left-8 flex space-x-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                <span className="text-sm font-semibold text-gray-800">$36</span>
              </div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <span className="text-sm font-semibold text-gray-800">🔥 Trending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}