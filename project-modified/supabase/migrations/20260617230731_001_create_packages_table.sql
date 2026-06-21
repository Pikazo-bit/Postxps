-- Create packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT UNIQUE NOT NULL,
  recipient_name TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight_kg DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_delivery DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracking events table
CREATE TABLE tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for packages (public read for tracking)
CREATE POLICY "packages_public_read" ON packages FOR SELECT
  USING (true);

-- RLS policies for tracking_events (public read for tracking)
CREATE POLICY "tracking_events_public_read" ON tracking_events FOR SELECT
  USING (true);

-- Insert sample packages
INSERT INTO packages (tracking_number, recipient_name, sender_name, origin, destination, weight_kg, status, estimated_delivery) VALUES
('PED-2024-001234', 'John Smith', 'Amazon Logistics', 'Los Angeles, CA', 'New York, NY', 2.5, 'in_transit', '2024-06-22'),
('PED-2024-001235', 'Sarah Johnson', 'Walmart Shipping', 'Chicago, IL', 'Miami, FL', 1.8, 'delivered', '2024-06-15'),
('PED-2024-001236', 'Michael Chen', 'Best Buy', 'Seattle, WA', 'Denver, CO', 5.2, 'out_for_delivery', '2024-06-18');

-- Insert sample tracking events
INSERT INTO tracking_events (package_id, status, location, description, timestamp) VALUES
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001234'), 'pending', 'Los Angeles, CA', 'Package received at origin facility', '2024-06-15 08:00:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001234'), 'in_transit', 'Phoenix, AZ', 'Package in transit to destination', '2024-06-16 14:30:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001234'), 'in_transit', 'Dallas, TX', 'Package arrived at sorting facility', '2024-06-17 09:15:00'),

((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001235'), 'pending', 'Chicago, IL', 'Package received at origin facility', '2024-06-12 10:00:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001235'), 'in_transit', 'Atlanta, GA', 'Package in transit to destination', '2024-06-13 16:00:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001235'), 'out_for_delivery', 'Miami, FL', 'Package out for delivery', '2024-06-15 07:30:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001235'), 'delivered', 'Miami, FL', 'Package delivered successfully', '2024-06-15 14:22:00'),

((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001236'), 'pending', 'Seattle, WA', 'Package received at origin facility', '2024-06-16 09:00:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001236'), 'in_transit', 'Salt Lake City, UT', 'Package in transit to destination', '2024-06-17 06:45:00'),
((SELECT id FROM packages WHERE tracking_number = 'PED-2024-001236'), 'out_for_delivery', 'Denver, CO', 'Package out for delivery', '2024-06-17 11:30:00');

-- Create index for faster tracking number lookups
CREATE INDEX idx_packages_tracking_number ON packages(tracking_number);
CREATE INDEX idx_tracking_events_package_id ON tracking_events(package_id);