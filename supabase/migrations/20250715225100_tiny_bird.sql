/*
  # Create domain checks table

  1. New Tables
    - `domain_checks`
      - `id` (uuid, primary key)
      - `domain` (text, not null)
      - `status` (text, not null)
      - `results` (jsonb, not null) - Complete check results
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key to app_users)

  2. Security
    - Enable RLS on `domain_checks` table
    - Add policies for authenticated users to manage their checks

  3. Indexes
    - Index on domain for fast lookups
    - Index on created_at for date filtering
    - Index on created_by for user filtering
*/

CREATE TABLE IF NOT EXISTS domain_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  results jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES app_users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE domain_checks ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_domain_checks_domain ON domain_checks(domain);
CREATE INDEX IF NOT EXISTS idx_domain_checks_created_at ON domain_checks(created_at);
CREATE INDEX IF NOT EXISTS idx_domain_checks_created_by ON domain_checks(created_by);
CREATE INDEX IF NOT EXISTS idx_domain_checks_domain_created_at ON domain_checks(domain, created_at DESC);

-- RLS Policies
CREATE POLICY "Users can view all domain checks"
  ON domain_checks
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert domain checks"
  ON domain_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update domain checks"
  ON domain_checks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their own domain checks"
  ON domain_checks
  FOR DELETE
  TO authenticated
  USING (created_by = (current_setting('app.current_user_id'::text, true))::uuid);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_domain_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_domain_checks_updated_at_trigger
  BEFORE UPDATE ON domain_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_domain_checks_updated_at();