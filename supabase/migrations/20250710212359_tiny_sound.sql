/*
  # Fix password hashing for existing users

  1. Updates
    - Hash existing plain text passwords using SHA-256
    - Update test users with properly hashed passwords
    - Ensure all passwords are stored securely

  2. Security
    - Convert plain text passwords to hashed format
    - Maintain compatibility with authentication function
*/

-- Update existing users' passwords to be properly hashed
UPDATE app_users 
SET password_hash = encode(digest(password_hash, 'sha256'), 'hex')
WHERE password_hash NOT LIKE '%[0-9a-f]%' OR length(password_hash) != 64;

-- Specifically update test users with known passwords
UPDATE app_users 
SET password_hash = encode(digest('admin123', 'sha256'), 'hex')
WHERE email = 'admin@wiser.com';

UPDATE app_users 
SET password_hash = encode(digest('user123', 'sha256'), 'hex')
WHERE email = 'user@wiser.com';

-- Add any other test users if they exist
DO $$
BEGIN
  -- Update any other users that might have plain text passwords
  UPDATE app_users 
  SET password_hash = encode(digest(password_hash, 'sha256'), 'hex')
  WHERE length(password_hash) < 64 AND password_hash !~ '^[0-9a-f]+$';
  
  RAISE NOTICE 'Password hashing update completed';
END $$;