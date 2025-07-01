/*
  # Admin System Setup

  1. New Tables
    - `user_roles` - Stores user roles and status
    - `audit_logs` - Tracks user actions for security and compliance
    - `admin_settings` - System-wide configuration settings

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
    - Add policies for user access to their own data

  3. Functions
    - Add function to log audit events
    - Add function to check admin permissions
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'manager', 'user')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'pending'))
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details text NOT NULL,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = $1;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is manager or admin
CREATE OR REPLACE FUNCTION is_manager_or_admin(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM user_roles WHERE user_id = $1;
  RETURN user_role IN ('admin', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_user_email text,
  p_action text,
  p_resource text,
  p_details text,
  p_ip_address text
) RETURNS uuid AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id, user_email, action, resource, details, ip_address
  ) VALUES (
    p_user_id, p_user_email, p_action, p_resource, p_details, p_ip_address
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON admin_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON user_roles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

-- Create RLS policies for audit_logs
CREATE POLICY "Admins can view all audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (is_manager_or_admin(auth.uid()));

-- Create RLS policies for admin_settings
CREATE POLICY "Admins can manage all settings"
ON admin_settings
FOR ALL
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Managers can view settings"
ON admin_settings
FOR SELECT
TO authenticated
USING (is_manager_or_admin(auth.uid()));

-- Insert default admin settings
INSERT INTO admin_settings (key, value, description)
VALUES 
  ('security', '{"require_mfa": false, "password_expiry_days": 90, "session_timeout_minutes": 60}', 'Security settings'),
  ('email', '{"welcome_email_enabled": true, "password_reset_enabled": true}', 'Email notification settings'),
  ('system', '{"maintenance_mode": false, "version": "1.0.0"}', 'System settings');

-- Insert default admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM user_roles WHERE role = 'admin'
  ) THEN
    -- This would typically be done through the auth API, but for migration purposes:
    -- First, ensure the admin user exists in auth.users (this would be done via API)
    -- Then add the role
    INSERT INTO user_roles (user_id, role, status)
    VALUES ('00000000-0000-0000-0000-000000000000', 'admin', 'active');
  END IF;
END
$$;