/*
  # Fix authentication function digest error

  1. Extensions
    - Enable pgcrypto extension for password hashing functions
  
  2. Functions
    - Fix authenticate_user function to properly use digest function
    - Fix create_user function to properly hash passwords
    - Fix validate_session function
    - Fix logout_user function
  
  3. Security
    - Ensure proper password hashing with SHA-256
    - Maintain session management functionality
*/

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing functions to recreate them properly
DROP FUNCTION IF EXISTS authenticate_user(text, text);
DROP FUNCTION IF EXISTS create_user(text, text, text, text, text);
DROP FUNCTION IF EXISTS validate_session(text);
DROP FUNCTION IF EXISTS logout_user(text);

-- Create authenticate_user function with proper password hashing
CREATE OR REPLACE FUNCTION authenticate_user(
  p_email text,
  p_password text
)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role_name text,
  role_permissions jsonb,
  session_token text
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_username text;
  v_email text;
  v_full_name text;
  v_role_name text;
  v_role_permissions jsonb;
  v_session_token text;
  v_password_hash text;
BEGIN
  -- Get user details and verify password
  SELECT 
    u.id, 
    u.username, 
    u.email, 
    u.full_name, 
    u.password_hash,
    COALESCE(r.name, 'user') as role_name,
    COALESCE(r.permissions, '{}'::jsonb) as role_permissions
  INTO 
    v_user_id, 
    v_username, 
    v_email, 
    v_full_name, 
    v_password_hash,
    v_role_name,
    v_role_permissions
  FROM app_users u
  LEFT JOIN user_roles r ON u.role_id = r.id
  WHERE u.email = p_email AND u.is_active = true;

  -- Check if user exists and password matches
  IF v_user_id IS NULL OR v_password_hash != encode(digest(p_password, 'sha256'), 'hex') THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;

  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'hex');

  -- Create session
  INSERT INTO app_user_sessions (user_id, session_token, ip_address, user_agent)
  VALUES (v_user_id, v_session_token, inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent');

  -- Update last login
  UPDATE app_users SET last_login = now() WHERE id = v_user_id;

  -- Return user data
  RETURN QUERY SELECT 
    v_user_id,
    v_username,
    v_email,
    v_full_name,
    v_role_name,
    v_role_permissions,
    v_session_token;
END;
$$;

-- Create validate_session function
CREATE OR REPLACE FUNCTION validate_session(p_session_token text)
RETURNS TABLE(
  user_id uuid,
  username text,
  email text,
  full_name text,
  role_name text,
  role_permissions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_username text;
  v_email text;
  v_full_name text;
  v_role_name text;
  v_role_permissions jsonb;
BEGIN
  -- Get user details from active session
  SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    COALESCE(r.name, 'user') as role_name,
    COALESCE(r.permissions, '{}'::jsonb) as role_permissions
  INTO 
    v_user_id,
    v_username,
    v_email,
    v_full_name,
    v_role_name,
    v_role_permissions
  FROM app_user_sessions s
  JOIN app_users u ON s.user_id = u.id
  LEFT JOIN user_roles r ON u.role_id = r.id
  WHERE s.session_token = p_session_token 
    AND s.is_active = true 
    AND s.expires_at > now()
    AND u.is_active = true;

  -- Check if session is valid
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired session';
  END IF;

  -- Update last activity
  UPDATE app_user_sessions 
  SET last_activity = now() 
  WHERE session_token = p_session_token;

  -- Return user data
  RETURN QUERY SELECT 
    v_user_id,
    v_username,
    v_email,
    v_full_name,
    v_role_name,
    v_role_permissions;
END;
$$;

-- Create logout_user function
CREATE OR REPLACE FUNCTION logout_user(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Deactivate session
  UPDATE app_user_sessions 
  SET is_active = false 
  WHERE session_token = p_session_token;

  -- Return success
  RETURN true;
END;
$$;

-- Create create_user function with proper password hashing
CREATE OR REPLACE FUNCTION create_user(
  p_email text,
  p_username text,
  p_password text,
  p_full_name text DEFAULT NULL,
  p_role_name text DEFAULT 'user'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_role_id uuid;
  v_password_hash text;
BEGIN
  -- Hash the password
  v_password_hash := encode(digest(p_password, 'sha256'), 'hex');

  -- Get role ID
  SELECT id INTO v_role_id FROM user_roles WHERE name = p_role_name AND is_active = true;
  
  IF v_role_id IS NULL THEN
    -- Get default user role
    SELECT id INTO v_role_id FROM user_roles WHERE name = 'user' AND is_active = true;
  END IF;

  -- Create user
  INSERT INTO app_users (email, username, password_hash, full_name, role_id)
  VALUES (p_email, p_username, v_password_hash, p_full_name, v_role_id)
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$;

-- Grant execute permissions to public (authenticated users)
GRANT EXECUTE ON FUNCTION authenticate_user(text, text) TO public;
GRANT EXECUTE ON FUNCTION validate_session(text) TO public;
GRANT EXECUTE ON FUNCTION logout_user(text) TO public;
GRANT EXECUTE ON FUNCTION create_user(text, text, text, text, text) TO public;