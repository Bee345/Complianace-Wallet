-- Supabase Schema for Compliance Wallet

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone_number TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  name TEXT,
  dob TEXT,
  state TEXT,
  lga TEXT,
  password_hash TEXT NOT NULL,
  profile_photo_url TEXT,
  role TEXT DEFAULT 'VENDOR',
  wallet_balance REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LGA Bands Table
CREATE TABLE IF NOT EXISTS lga_bands (
  id TEXT PRIMARY KEY,
  lga_id TEXT NOT NULL,
  name TEXT NOT NULL,
  min_turnover REAL NOT NULL,
  max_turnover REAL NOT NULL,
  daily_tax REAL NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses Table
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  cac_registration_number TEXT,
  registration_status TEXT DEFAULT 'DRAFT',
  lga_id TEXT NOT NULL,
  address TEXT,
  business_type TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax Records Table
CREATE TABLE IF NOT EXISTS tax_records (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES users(id),
  date TIMESTAMPTZ NOT NULL,
  turnover_amount REAL NOT NULL,
  turnover_currency TEXT DEFAULT 'NGN',
  calculated_tax_amount REAL NOT NULL,
  calculated_tax_currency TEXT DEFAULT 'NGN',
  lga_band_id TEXT,
  is_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Levy Records Table
CREATE TABLE IF NOT EXISTS levy_records (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES users(id),
  date TIMESTAMPTZ NOT NULL,
  amount REAL NOT NULL,
  currency TEXT DEFAULT 'NGN',
  lga_id TEXT NOT NULL,
  category TEXT,
  receipt_photo_url TEXT,
  is_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Permits Table
CREATE TABLE IF NOT EXISTS health_permits (
  id TEXT PRIMARY KEY,
  vendor_id TEXT NOT NULL REFERENCES users(id),
  permit_number TEXT,
  issue_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  photo_url TEXT,
  status TEXT DEFAULT 'COMPLIANT',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Settings Table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  pidgin_voice_enabled BOOLEAN DEFAULT TRUE,
  dark_mode_enabled BOOLEAN DEFAULT FALSE
);

-- Seed LGA Bands
INSERT INTO lga_bands (id, lga_id, name, min_turnover, max_turnover, daily_tax) VALUES
('band_ph_1', 'Port Harcourt', 'Micro-A', 0, 5000, 100),
('band_ph_2', 'Port Harcourt', 'Micro-B', 5001, 20000, 250),
('band_ph_3', 'Port Harcourt', 'Small-A', 20001, 100000, 500),
('band_ph_4', 'Port Harcourt', 'Small-B', 100001, 500000, 1000)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies (Example - adjust as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE levy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own data
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (id = auth.uid()::text);
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
-- ... more policies as needed
