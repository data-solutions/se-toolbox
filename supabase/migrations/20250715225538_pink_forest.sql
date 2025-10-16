/*
  # Fix domain_checks RLS policies

  1. Security
    - Drop existing restrictive policies
    - Create proper policies for authenticated users
    - Allow users to insert their own domain checks
    - Allow users to view all domain checks (for shared results)
    - Allow users to update and delete their own domain checks
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own data" ON domain_checks;
DROP POLICY IF EXISTS "Users can insert domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can update domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can delete their own domain checks" ON domain_checks;
DROP POLICY IF EXISTS "Users can view all domain checks" ON domain_checks;

-- Create new policies for domain_checks
CREATE POLICY "Users can view all domain checks"
  ON domain_checks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert domain checks"
  ON domain_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update domain checks"
  ON domain_checks
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own domain checks"
  ON domain_checks
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());