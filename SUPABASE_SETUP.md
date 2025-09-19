# Supabase Setup Guide for RavenAI

This guide will help you set up Supabase authentication and database for your RavenAI application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `ravenai-client`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
4. Click "Create new project"

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Set Up Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Create Profiles Table
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Create Meetings Table
```sql
-- Create meetings table
CREATE TABLE meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT,
  platform TEXT CHECK (platform IN ('google_meet', 'zoom', 'teams')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in minutes
  participants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);
```

### Create Transcriptions Table
```sql
-- Create transcriptions table
CREATE TABLE transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  speaker TEXT,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confidence FLOAT,
  language TEXT DEFAULT 'en',
  is_final BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view transcriptions of own meetings" ON transcriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = transcriptions.meeting_id 
      AND meetings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transcriptions for own meetings" ON transcriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE meetings.id = transcriptions.meeting_id 
      AND meetings.user_id = auth.uid()
    )
  );
```

## 5. Configure Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure your site URL: `http://localhost:3000` (for development)

### Enable OAuth Providers (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google** and/or **GitHub** if desired
3. Add your OAuth credentials

## 6. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth`
3. Try creating an account and signing in
4. Check your Supabase dashboard to see the new user in **Authentication** → **Users**

## 7. Production Deployment

For production deployment:

1. Update your site URL in Supabase settings to your production domain
2. Add your production environment variables to your hosting platform
3. Consider setting up additional security policies as needed

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Make sure your `.env.local` file is in the project root
   - Verify the variable names match exactly
   - Restart your development server after adding environment variables

2. **"Invalid API key"**
   - Double-check your Supabase URL and anon key
   - Ensure you're using the anon key, not the service role key

3. **"Row Level Security policy violation"**
   - Check that your RLS policies are correctly set up
   - Verify the user is authenticated before making database calls

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Discord Community](https://discord.supabase.com/)
