-- Disable email verification requirement for development
-- This allows users to login without confirming their email
-- Note: In production, you should keep email verification enabled

-- Update auth settings to allow login without email confirmation
-- This is done through Supabase Auth configuration, not SQL

-- However, we can confirm existing users' emails if needed:
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;
