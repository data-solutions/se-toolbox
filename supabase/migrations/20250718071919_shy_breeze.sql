/*
  # Disable RLS for domain_checks table

  Since the application doesn't use Supabase authentication system,
  we need to disable Row Level Security to allow insertions and updates.

  1. Changes
    - Disable RLS on domain_checks table
    - Drop existing RLS policies
    - Allow public access for all operations
*/

-- Disable Row Level Security
ALTER TABLE domain_checks DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to delete their own domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Allow authenticated users to insert domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Allow authenticated users to update domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Allow authenticated users to view all domain checks" ON domain_checks;

-- Grant public access (since no authentication system is used)
GRANT ALL ON domain_checks TO anon;
GRANT ALL ON domain_checks TO authenticated;