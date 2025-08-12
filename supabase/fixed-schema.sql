-- =====================================================
-- FIXED BIOLINK DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Update profiles table with all necessary columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Step 2: Create collections table FIRST (before links table references it)
DROP TABLE IF EXISTS collections CASCADE;
CREATE TABLE collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 3: Drop and recreate links table with proper collection reference
DROP TABLE IF EXISTS links CASCADE;
CREATE TABLE links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 4: Create link_clicks table for analytics
DROP TABLE IF EXISTS link_clicks CASCADE;
CREATE TABLE link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT
);

-- Step 5: Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Step 6: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 8: Create RLS Policies for collections
DROP POLICY IF EXISTS "Users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can manage own collections" ON collections;

CREATE POLICY "Users can view public collections" ON collections
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = collections.user_id 
      AND profiles.is_public = true
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can manage own collections" ON collections
  FOR ALL USING (auth.uid() = user_id);

-- Step 9: Create RLS Policies for links
DROP POLICY IF EXISTS "Users can view public links" ON links;
DROP POLICY IF EXISTS "Users can manage own links" ON links;

CREATE POLICY "Users can view public links" ON links
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = links.user_id 
      AND profiles.is_public = true
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Users can manage own links" ON links
  FOR ALL USING (auth.uid() = user_id);

-- Step 10: Create RLS Policies for link_clicks
DROP POLICY IF EXISTS "Anyone can insert link clicks" ON link_clicks;
DROP POLICY IF EXISTS "Users can view own link clicks" ON link_clicks;

CREATE POLICY "Anyone can insert link clicks" ON link_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own link clicks" ON link_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_clicks.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Step 11: Create storage policies for profile pictures
DROP POLICY IF EXISTS "Users can upload own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Profile pictures are publicly viewable" ON storage.objects;

CREATE POLICY "Users can upload own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-pictures' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Step 12: Create functions for link and collection management
CREATE OR REPLACE FUNCTION update_link_positions(link_ids UUID[], new_positions INTEGER[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(link_ids, 1) LOOP
    UPDATE links 
    SET position = new_positions[i], updated_at = now()
    WHERE id = link_ids[i] AND user_id = auth.uid();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_collection_positions(collection_ids UUID[], new_positions INTEGER[])
RETURNS void AS $$
BEGIN
  FOR i IN 1..array_length(collection_ids, 1) LOOP
    UPDATE collections 
    SET position = new_positions[i], updated_at = now()
    WHERE id = collection_ids[i] AND user_id = auth.uid();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_click_count(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET click_count = click_count + 1, updated_at = now()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION move_link_to_collection(link_id UUID, target_collection_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET collection_id = target_collection_id, updated_at = now()
  WHERE id = link_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION remove_link_from_collection(link_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET collection_id = NULL, updated_at = now()
  WHERE id = link_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 13: Create triggers to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_collections_updated_at ON collections;
CREATE TRIGGER update_collections_updated_at 
    BEFORE UPDATE ON collections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_links_updated_at ON links;
CREATE TRIGGER update_links_updated_at 
    BEFORE UPDATE ON links 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 14: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_collection_id ON links(collection_id);
CREATE INDEX IF NOT EXISTS idx_links_position ON links(position);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_position ON collections(position);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_link_clicks_clicked_at ON link_clicks(clicked_at);

-- Step 15: Insert default profile for existing users if needed
INSERT INTO profiles (id, username, theme, is_public, created_at, updated_at)
SELECT 
  auth.users.id,
  COALESCE(auth.users.email, 'user_' || substr(auth.users.id::text, 1, 8)),
  'default',
  true,
  auth.users.created_at,
  now()
FROM auth.users
WHERE auth.users.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;