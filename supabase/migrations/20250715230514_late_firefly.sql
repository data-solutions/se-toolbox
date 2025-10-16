/*
  # Fix RLS policies for domain_checks table

  1. Security Changes
    - Drop existing policies that may be too restrictive
    - Create proper INSERT policy for authenticated users
    - Create proper SELECT policy for viewing results
    - Create proper UPDATE/DELETE policies for data management

  2. Policy Details
    - INSERT: Allow authenticated users to insert their own domain checks
    - SELECT: Allow authenticated users to view all domain checks (shared cache)
    - UPDATE: Allow authenticated users to update any domain check
    - DELETE: Allow authenticated users to delete their own domain checks
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can view all domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can update domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can delete their own domain checks" ON domain_checks;

-- Create INSERT policy - users can insert their own domain checks
CREATE POLICY "Allow authenticated users to insert their own domain checks"
  ON domain_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Create SELECT policy - users can view all domain checks (shared cache)
CREATE POLICY "Allow authenticated users to view all domain checks"
  ON domain_checks
  FOR SELECT
  TO authenticated
  USING (true);

-- Create UPDATE policy - users can update any domain check (for shared cache updates)
CREATE POLICY "Allow authenticated users to update domain checks"
  ON domain_checks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create DELETE policy - users can delete their own domain checks
CREATE POLICY "Allow authenticated users to delete their own domain checks"
  ON domain_checks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);