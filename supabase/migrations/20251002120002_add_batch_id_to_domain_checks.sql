/*
  # Add batch_id to domain_checks table

  ## Overview
  This migration adds a batch_id column to link domain checks to batches.
  This allows grouping domain checks together for batch processing.

  ## Changes
  1. Add `batch_id` column (nullable uuid, foreign key to domain_batches)
  2. Add index on `batch_id` for efficient batch queries
  3. Add function to automatically update batch progress counters

  ## Notes
  - batch_id is nullable because existing domain checks may not belong to a batch
  - Foreign key with CASCADE DELETE means if a batch is deleted, domain checks are also deleted
*/

-- Add batch_id column to domain_checks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'domain_checks' AND column_name = 'batch_id'
  ) THEN
    ALTER TABLE domain_checks ADD COLUMN batch_id uuid REFERENCES domain_batches(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for efficient batch queries
CREATE INDEX IF NOT EXISTS idx_domain_checks_batch_id ON domain_checks(batch_id);

-- Function to update batch progress when domain checks complete
CREATE OR REPLACE FUNCTION update_batch_progress()
RETURNS TRIGGER AS $$
DECLARE
  batch_record record;
  total_count integer;
  completed_count integer;
  new_status text;
BEGIN
  -- Only process if the domain check belongs to a batch
  IF NEW.batch_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count total and completed domains in the batch
  SELECT
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'completed') as completed
  INTO total_count, completed_count
  FROM domain_checks
  WHERE batch_id = NEW.batch_id;

  -- Determine new batch status
  IF completed_count = 0 THEN
    new_status := 'pending';
  ELSIF completed_count < total_count THEN
    new_status := 'in_progress';
  ELSE
    new_status := 'completed';
  END IF;

  -- Update the batch
  UPDATE domain_batches
  SET
    total_domains = total_count,
    completed_domains = completed_count,
    status = new_status,
    updated_at = now()
  WHERE id = NEW.batch_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update batch progress after domain check updates
DROP TRIGGER IF EXISTS trigger_update_batch_progress ON domain_checks;
CREATE TRIGGER trigger_update_batch_progress
  AFTER INSERT OR UPDATE OF status ON domain_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_progress();
