/*
  # Fix domain_checks RLS policy

  1. Security
    - Update INSERT policy to allow authenticated users to insert their own records
    - Ensure WITH CHECK clause matches the user's ID
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Allow authenticated users to insert domain checks" ON domain_checks;

-- Create new INSERT policy with proper WITH CHECK clause
CREATE POLICY "Allow authenticated users to insert domain checks"
  ON domain_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);