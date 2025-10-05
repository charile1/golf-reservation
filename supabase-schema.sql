-- Golf Reservation Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Customer Table
CREATE TABLE customer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tee Time Table
CREATE TABLE tee_time (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  time TEXT NOT NULL,
  course_name TEXT NOT NULL,
  green_fee INTEGER NOT NULL,
  onsite_payment INTEGER DEFAULT 0,
  slots_total INTEGER NOT NULL DEFAULT 4,
  slots_booked INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'JOINING', 'CONFIRMED', 'CANCELED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking Table
CREATE TABLE booking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tee_time_id UUID NOT NULL REFERENCES tee_time(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customer(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  people_count INTEGER NOT NULL CHECK (people_count > 0),
  companion_names TEXT[],
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELED')),
  paid_at TIMESTAMP WITH TIME ZONE,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_customer_phone ON customer(phone);
CREATE INDEX idx_tee_time_date ON tee_time(date);
CREATE INDEX idx_tee_time_status ON tee_time(status);
CREATE INDEX idx_booking_tee_time_id ON booking(tee_time_id);
CREATE INDEX idx_booking_customer_id ON booking(customer_id);
CREATE INDEX idx_booking_status ON booking(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tee_time_updated_at BEFORE UPDATE ON tee_time
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_updated_at BEFORE UPDATE ON booking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update tee_time status and slots_booked
CREATE OR REPLACE FUNCTION update_tee_time_stats()
RETURNS TRIGGER AS $$
DECLARE
  total_booked INTEGER;
  total_slots INTEGER;
BEGIN
  -- Calculate total confirmed bookings for this tee time
  SELECT COALESCE(SUM(people_count), 0) INTO total_booked
  FROM booking
  WHERE tee_time_id = COALESCE(NEW.tee_time_id, OLD.tee_time_id)
    AND status = 'CONFIRMED';

  -- Get total slots
  SELECT slots_total INTO total_slots
  FROM tee_time
  WHERE id = COALESCE(NEW.tee_time_id, OLD.tee_time_id);

  -- Update tee_time
  UPDATE tee_time
  SET
    slots_booked = total_booked,
    status = CASE
      WHEN total_booked = 0 THEN 'AVAILABLE'
      WHEN total_booked > 0 AND total_booked < total_slots THEN 'JOINING'
      WHEN total_booked >= total_slots THEN 'CONFIRMED'
      ELSE status
    END
  WHERE id = COALESCE(NEW.tee_time_id, OLD.tee_time_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update tee_time stats when booking changes
CREATE TRIGGER update_tee_time_on_booking_change
AFTER INSERT OR UPDATE OR DELETE ON booking
FOR EACH ROW
EXECUTE FUNCTION update_tee_time_stats();

-- Enable Row Level Security (RLS)
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE tee_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admin only access)
-- Only authenticated users can view/edit (assumes only admin users will be in auth.users)
CREATE POLICY "Allow authenticated users full access to customer" ON customer
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to tee_time" ON tee_time
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to booking" ON booking
  FOR ALL USING (auth.role() = 'authenticated');

-- Sample data (optional - for testing)
INSERT INTO tee_time (date, time, course_name, green_fee, slots_total, status)
VALUES
  ('2025-10-10', '06:45', '오션비치리조트', 150000, 4, 'AVAILABLE'),
  ('2025-10-11', '07:30', '오션힐스포항', 180000, 4, 'AVAILABLE'),
  ('2025-10-12', '08:00', '오션힐스영천', 200000, 4, 'AVAILABLE');
