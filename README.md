# BioLink App

A complete Linktree clone built with modern web technologies. Create your personalized biolink page with custom links, collections, themes, and more.

## 🚀 Features

### Authentication & User Management

- ✅ Email authentication (signup/login) with clean username generation
- ✅ Google OAuth integration
- ✅ Automatic profile creation with email-based usernames
- ✅ Beautiful 50/50 split login/signup pages with Linktree-style design
- ✅ Protected dashboard routes

### Link Management

- ✅ Add, edit, and delete custom links
- ✅ Drag-and-drop reordering of links
- ✅ Link click tracking and analytics
- ✅ Collections for organizing links into groups
- ✅ Move links between collections with drag-and-drop
- ✅ Ungroup functionality for collection links

### Profile Customization

- ✅ Profile image upload with Supabase storage
- ✅ Custom bio and username editing
- ✅ Multiple theme options (Blue, Green, Purple, Pink, Orange)
- ✅ Real-time preview panel with mobile-first design
- ✅ Public profile pages at `/{username}`

### User Experience

- ✅ Fully responsive mobile-first design
- ✅ Phone-like preview panel matching Linktree aesthetics
- ✅ Dropdown profile menu with settings integration
- ✅ Modal overlays with backdrop blur effects
- ✅ Intuitive drag-and-drop interface with proper drop zones

## 🛠️ Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **@dnd-kit** - Modern drag-and-drop library
- **Lucide React** - Beautiful icon library

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication with email and OAuth providers
  - File storage for profile images
  - Real-time subscriptions

### Key Libraries

- **@supabase/supabase-js** - Supabase client
- **@supabase/ssr** - Server-side rendering support
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging

## 📁 Project Structure

```
biolink-app/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── login/           # Separate login page
│   │   │   ├── signup/          # Separate signup page
│   │   │   └── callback/        # OAuth callback handler
│   │   ├── dashboard/
│   │   │   ├── components/      # Dashboard-specific components
│   │   │   │   ├── tabs/        # Tab components (Links, Settings)
│   │   │   │   ├── modals/      # Modal components
│   │   │   │   └── ui/          # UI components
│   │   │   └── page.tsx         # Main dashboard
│   │   ├── [username]/          # Dynamic public profile pages
│   │   ├── api/                 # API routes
│   │   └── globals.css          # Global styles
│   ├── components/
│   │   ├── ui/                  # Reusable UI components
│   │   └── icons.tsx            # Icon components
│   ├── lib/                     # Utility functions and types
│   └── utils/
│       └── supabase/            # Supabase configuration
├── supabase/
│   └── fixed-schema.sql         # Complete database schema
└── public/                      # Static assets
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following tables:

### Core Tables

- **`profiles`** - User profiles with username, bio, avatar, and theme settings
- **`links`** - Individual biolinks with URL, title, description, and positioning
- **`collections`** - Link collections for organization with drag-and-drop support
- **`link_clicks`** - Click tracking and analytics data

### Key Features

- Row Level Security (RLS) policies for data protection
- Foreign key relationships with proper cascading
- Position-based ordering for drag-and-drop functionality
- Optimized indexes for performance

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd biolink-app
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup

```bash
# Apply the database schema to your Supabase project
# Copy the contents of supabase/fixed-schema.sql
# Run it in your Supabase SQL editor
```

### 4. Supabase Configuration

#### Authentication Settings

In your Supabase dashboard → Authentication → Settings:

- ✅ Enable email signup
- ✅ Disable email confirmations (for development)
- ✅ Add redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (for production)

#### Storage Setup

In your Supabase dashboard → Storage:

- Create a bucket named `avatars`
- Set it to public for profile image access

#### Google OAuth (Optional)

In Authentication → Providers → Google:

- Enable Google provider
- Add your Google OAuth credentials

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your biolink app!

## 🎨 Key Features Explained

### Username Generation

- Automatically extracts clean usernames from email addresses
- `test@gmail.com` → `test` (instead of random characters)
- Handles conflicts with numbered suffixes (`test1`, `test2`, etc.)

### Drag-and-Drop System

- Powered by @dnd-kit for accessibility and performance
- Move links within collections or between collections
- Reorder collections themselves
- Visual drop zones and feedback

### Theme System

- Multiple color themes with consistent design
- Real-time preview updates
- Stored in user profiles for persistence

### Mobile-First Design

- Responsive layout that works on all devices
- Phone-like preview panel for accurate mobile representation
- Touch-friendly drag-and-drop on mobile devices

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Update Supabase redirect URLs with your production domain
4. Deploy!

### Other Platforms

The app works on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Organization

- **Components**: Reusable UI components in `src/components/`
- **Pages**: Next.js pages in `src/app/`
- **Types**: TypeScript definitions in `src/lib/types.ts`
- **Utils**: Helper functions in `src/utils/`
- **Styles**: Tailwind classes with custom components

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
