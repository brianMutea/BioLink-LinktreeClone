# BioLink App

A Linktree-style biolink application built with Next.js and Supabase.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Supabase:

   - Copy `.env.local.example` to `.env.local` (already done)
   - Apply the database schema from `supabase/schema.sql` to your Supabase project
   - In Supabase dashboard > Authentication > Settings:
     - Enable email signup
     - Disable email confirmations (for testing)
     - Add `http://localhost:3000/auth/callback` to redirect URLs

3. Run the development server:

```bash
npm run dev
```

## Features

- ✅ Email authentication (signup/login)
- ✅ Google OAuth (configurable)
- ✅ Automatic profile creation
- ✅ Protected dashboard route
- ✅ Responsive UI with Tailwind CSS

## Project Structure

```
src/
├── app/
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Protected dashboard
│   └── layout.tsx      # Root layout
├── components/
│   ├── ui/            # Reusable UI components
│   └── icons.tsx      # Icon components
└── utils/
    └── supabase/      # Supabase client configuration
```

## Database Schema

The app uses two main tables:

- `profiles` - User profile information
- `links` - User's biolinks

Schema is defined in `supabase/schema.sql`.
