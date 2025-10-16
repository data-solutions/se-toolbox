/*
  # Fix domain_checks RLS policies

  1. Security Updates
    - Update INSERT policy to use auth.uid() instead of uid()
    - Ensure proper authentication check for domain_checks table
    - Fix foreign key reference to use auth.users instead of app_users

  2. Changes Made
    - Drop existing problematic policies
    - Create new INSERT policy with correct auth.uid() function
    - Update foreign key constraint to reference auth.users table
    - Ensure all authenticated users can insert their own records
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow authenticated users to insert their own domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can insert own domain checks" ON domain_checks;

-- Drop the foreign key constraint that references app_users
ALTER TABLE domain_checks DROP CONSTRAINT IF EXISTS domain_checks_created_by_fkey;

-- Add foreign key constraint to reference auth.users instead
ALTER TABLE domain_checks ADD CONSTRAINT domain_checks_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create new INSERT policy with correct authentication
CREATE POLICY "Allow authenticated users to insert domain checks"
  ON domain_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Ensure SELECT policy works correctly
DROP POLICY IF EXISTS "Allow authenticated users to view all domain checks" ON domain_checks;
CREATE POLICY "Allow authenticated users to view all domain checks"
  ON domain_checks
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure UPDATE policy works correctly  
DROP POLICY IF EXISTS "Allow authenticated users to update domain checks" ON domain_checks;
CREATE POLICY "Allow authenticated users to update domain checks"
  ON domain_checks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure DELETE policy works correctly
DROP POLICY IF EXISTS "Allow authenticated users to delete their own domain checks" ON domain_checks;
CREATE POLICY "Allow authenticated users to delete their own domain checks"
  ON domain_checks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);