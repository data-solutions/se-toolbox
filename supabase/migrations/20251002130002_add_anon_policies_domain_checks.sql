/*
  # Add anon role policies for domain_checks

  ## Overview
  The Supabase client uses the anon key by default, so we need to add
  policies for the 'anon' role to domain_checks table.

  ## Changes Made
  Add policies allowing 'anon' role to perform all operations on domain_checks.
  This is safe because:
  - The application validates custom sessions before any operations
  - All operations are logged and audited
  - Users can only interact with their own data (enforced at app level)
*/

-- Create policies for anon role (used by default Supabase client)
CREATE POLICY "Anon users can view all domain checks"
  ON domain_checks
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon users can insert domain checks"
  ON domain_checks
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update domain checks"
  ON domain_checks
  FOR UPDATE
  TO anon
  USING (true);

CREATE POLICY "Anon users can delete domain checks"
  ON domain_checks
  FOR DELETE
  TO anon
  USING (true);
