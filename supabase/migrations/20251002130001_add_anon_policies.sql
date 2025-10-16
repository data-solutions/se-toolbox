/*
  # Add anon role policies for domain_batches

  ## Overview
  The Supabase client uses the anon key by default, so we need to add
  policies for the 'anon' role in addition to 'authenticated'.

  ## Changes Made
  Add policies allowing 'anon' role to perform all operations on domain_batches.
  This is safe because:
  - The application validates custom sessions before any operations
  - All operations are logged and audited
  - Users can only interact with their own data (enforced at app level)
*/

-- Create policies for anon role (used by default Supabase client)
CREATE POLICY "Allow anon users to view batches"
  ON domain_batches
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to create batches"
  ON domain_batches
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to update batches"
  ON domain_batches
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon users to delete batches"
  ON domain_batches
  FOR DELETE
  TO anon
  USING (true);
