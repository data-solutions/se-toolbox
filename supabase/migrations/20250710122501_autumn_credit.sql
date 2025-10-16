/*
  # User Management System

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `permissions` (jsonb)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `email` (text, unique)
      - `full_name` (text)
      - `role_id` (uuid, references user_roles)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `last_login` (timestamptz)
      - `created_by` (uuid, references auth.users)
    
    - `user_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `session_token` (text, unique)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `last_activity` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Users can view/edit own data
    - Admins can manage all users

  3. Default Data
    - Create 4 default roles with permissions
    - Administrator, Sales Engineer, AE / CSM, Ops Team

  4. Functions and Triggers
    - Auto-create profile on user signup
    - Update last_login on auth
    - Role management functions
    - Permission checking functions
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Insert default roles
INSERT INTO user_roles (name, description, permissions) VALUES
  ('Administrator', 'Full system access', '{"manage_users": true, "manage_roles": true, "view_all_data": true, "system_admin": true}'::jsonb),
  ('Sales Engineer', 'Sales engineering role with standard access', '{"view_own_data": true, "create_conversations": true, "upload_files": true}'::jsonb),
  ('AE / CSM', 'Account Executive / Customer Success Manager', '{"view_own_data": true, "view_team_data": true, "create_conversations": true, "upload_files": true, "manage_accounts": true}'::jsonb),
  ('Ops Team', 'Operations team with reporting access', '{"view_own_data": true, "view_reports": true, "create_conversations": true, "upload_files": true, "manage_operations": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Create profiles table (without DEFAULT subquery)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  full_name text,
  role_id uuid REFERENCES user_roles(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login timestamptz,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  last_activity timestamptz DEFAULT now()
);

-- Enable RLS on user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- RLS Policies for user_roles
CREATE POLICY "Users can view roles" ON user_roles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only admins can manage roles" ON user_roles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'Administrator'
    )
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'Administrator'
    )
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'Administrator'
    )
  );

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN user_roles r ON p.role_id = r.id
      WHERE p.id = auth.uid() AND r.name = 'Administrator'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_role_id uuid;
BEGIN
  -- Get default role ID (Sales Engineer)
  SELECT id INTO default_role_id FROM user_roles WHERE name = 'Sales Engineer' LIMIT 1;
  
  -- Insert profile for new user
  INSERT INTO profiles (id, username, email, full_name, role_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    default_role_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update last_login
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles 
  SET last_login = now(), updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_login on auth
DROP TRIGGER IF EXISTS on_auth_login ON auth.users;
CREATE TRIGGER on_auth_login
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_last_login();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE user_sessions 
  SET is_active = false
  WHERE expires_at < now() AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin users view
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
  p.id,
  p.username,
  p.email,
  p.full_name,
  p.is_active,
  p.created_at,
  p.updated_at,
  p.last_login,
  r.name as role_name,
  r.description as role_description,
  r.permissions as role_permissions,
  creator.username as created_by_username,
  creator.email as created_by_email
FROM profiles p
LEFT JOIN user_roles r ON p.role_id = r.id
LEFT JOIN profiles creator ON p.created_by = creator.id;

-- Create user activity view
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
  p.id,
  p.username,
  p.email,
  p.last_login,
  COUNT(s.id) as active_sessions,
  r.name as role_name
FROM profiles p
LEFT JOIN user_roles r ON p.role_id = r.id
LEFT JOIN user_sessions s ON p.id = s.user_id AND s.is_active = true AND s.expires_at > now()
GROUP BY p.id, p.username, p.email, p.last_login, r.name;

-- Function to assign role to user
CREATE OR REPLACE FUNCTION assign_user_role(
  p_user_id uuid,
  p_role_name text
)
RETURNS boolean AS $$
DECLARE
  role_id uuid;
BEGIN
  -- Check if caller is administrator
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Only administrators can assign roles';
  END IF;

  -- Get role ID
  SELECT id INTO role_id FROM user_roles WHERE name = p_role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Update user role
  UPDATE profiles 
  SET role_id = role_id, updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate user
CREATE OR REPLACE FUNCTION deactivate_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if caller is administrator
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Only administrators can deactivate users';
  END IF;

  -- Deactivate user
  UPDATE profiles 
  SET is_active = false, updated_at = now()
  WHERE id = p_user_id;

  -- Deactivate all user sessions
  UPDATE user_sessions 
  SET is_active = false
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to activate user
CREATE OR REPLACE FUNCTION activate_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if caller is administrator
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Only administrators can activate users';
  END IF;

  -- Activate user
  UPDATE profiles 
  SET is_active = true, updated_at = now()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid DEFAULT auth.uid())
RETURNS jsonb AS $$
DECLARE
  permissions jsonb;
BEGIN
  SELECT r.permissions INTO permissions
  FROM profiles p
  JOIN user_roles r ON p.role_id = r.id
  WHERE p.id = p_user_id AND p.is_active = true;

  RETURN COALESCE(permissions, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION has_permission(
  p_permission text,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean AS $$
DECLARE
  permissions jsonb;
BEGIN
  permissions := get_user_permissions(p_user_id);
  RETURN (permissions->p_permission)::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new user (for admin use)
CREATE OR REPLACE FUNCTION create_user_profile(
  p_email text,
  p_username text,
  p_full_name text DEFAULT '',
  p_role_name text DEFAULT 'Sales Engineer'
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  role_id uuid;
BEGIN
  -- Check if caller is administrator
  IF NOT EXISTS (
    SELECT 1 FROM profiles p
    JOIN user_roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'Administrator'
  ) THEN
    RAISE EXCEPTION 'Only administrators can create users';
  END IF;

  -- Get role ID
  SELECT id INTO role_id FROM user_roles WHERE name = p_role_name;
  
  IF role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Generate new UUID for user
  new_user_id := gen_random_uuid();

  -- Insert into profiles (this will be used when the user actually signs up)
  INSERT INTO profiles (id, username, email, full_name, role_id, created_by)
  VALUES (new_user_id, p_username, p_email, p_full_name, role_id, auth.uid());

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;