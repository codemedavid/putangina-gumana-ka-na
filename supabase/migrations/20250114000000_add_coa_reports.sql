-- Create COA Reports table
CREATE TABLE IF NOT EXISTS coa_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  batch_number TEXT,
  quantity_mg NUMERIC(10, 2),
  purity_percentage NUMERIC(5, 2) NOT NULL,
  verification_key TEXT UNIQUE,
  verification_url TEXT,
  report_image_url TEXT NOT NULL,
  lab_name TEXT DEFAULT 'Janoshik',
  test_date DATE,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_coa_reports_featured ON coa_reports(featured, sort_order);
CREATE INDEX IF NOT EXISTS idx_coa_reports_active ON coa_reports(active);
CREATE INDEX IF NOT EXISTS idx_coa_reports_verification_key ON coa_reports(verification_key);

-- Enable Row Level Security
ALTER TABLE coa_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active COA reports
CREATE POLICY "Public can view active COA reports"
  ON coa_reports
  FOR SELECT
  USING (active = true);

-- Policy: Admin can do everything (assuming admin role exists)
-- Note: Adjust this based on your auth setup
CREATE POLICY "Admin can manage COA reports"
  ON coa_reports
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_coa_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coa_reports_updated_at
  BEFORE UPDATE ON coa_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_coa_reports_updated_at();

