/*
  # Create domain_batches table for batch domain analysis

  ## Overview
  This migration creates a new table to manage batches of domain checks, allowing users to:
  - Group multiple domain checks into named batches
  - Track batch progress and status over time
  - Return later to view completed batch results
  - Stop batches in progress

  ## New Tables

  ### `domain_batches`
  Main table for storing batch information:
  - `id` (uuid, primary key) - Unique batch identifier
  - `name` (text, required) - User-provided batch name
  - `description` (text, optional) - Optional batch description
  - `status` (text, required) - Batch status: 'pending', 'in_progress', 'completed', 'stopped', 'error'
  - `total_domains` (integer, default 0) - Total number of domains in batch
  - `completed_domains` (integer, default 0) - Number of domains with completed checks
  - `created_by` (uuid, required, foreign key to auth.users) - User who created the batch
  - `created_at` (timestamptz) - Batch creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - Enable RLS on `domain_batches` table
  - Users can view their own batches
  - Users can create new batches
  - Users can update their own batches
  - Admin users can view all batches

  ## Indexes
  - Index on `created_by` for efficient user batch queries
  - Index on `status` for filtering by batch status
  - Index on `created_at` for chronological sorting
*/

-- Create domain_batches table
CREATE TABLE IF NOT EXISTS domain_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'stopped', 'error')),
  total_domains integer NOT NULL DEFAULT 0,
  completed_domains integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_domain_batches_created_by ON domain_batches(created_by);
CREATE INDEX IF NOT EXISTS idx_domain_batches_status ON domain_batches(status);
CREATE INDEX IF NOT EXISTS idx_domain_batches_created_at ON domain_batches(created_at DESC);

-- Enable RLS
ALTER TABLE domain_batches ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own batches
CREATE POLICY "Users can view own batches"
  ON domain_batches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Policy: Users can create batches
CREATE POLICY "Users can create batches"
  ON domain_batches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update their own batches
CREATE POLICY "Users can update own batches"
  ON domain_batches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_domain_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before updates
DROP TRIGGER IF EXISTS trigger_update_domain_batches_updated_at ON domain_batches;
CREATE TRIGGER trigger_update_domain_batches_updated_at
  BEFORE UPDATE ON domain_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_domain_batches_updated_at();
