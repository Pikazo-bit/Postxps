-- Create quotes table to store all quote requests
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  service_type text NOT NULL,
  message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a quote (public form)
CREATE POLICY "Anyone can submit a quote" ON quotes FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can read quotes
CREATE POLICY "Admins can read quotes" ON quotes FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);
