-- ============================================
-- NEXUS Database Schema — Supabase PostgreSQL
-- Run this in Supabase SQL Editor
-- ============================================

-- ==========================================
-- 1. PROFILES (extends Supabase auth.users)
-- ==========================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    brand TEXT DEFAULT 'Independent',
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'remax', 'team_leader', 'regional_director', 'mainadmin', 'buyer')),
    region_id UUID, -- Which Master Franchise
    office_id UUID, -- Which Brokerage
    team_id UUID, -- Which sub-team inside the office
    assigned_agent_id UUID, -- For buyer role
    avatar_url TEXT DEFAULT '',
    tx_volume TEXT DEFAULT '1-5',
    expert_zones TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    -- Enterprise Metrics
    start_date DATE DEFAULT CURRENT_DATE,
    employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time')),
    split_percentage NUMERIC(5,2) DEFAULT 50.00,
    lang TEXT DEFAULT 'en' CHECK (lang IN ('en', 'es')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 2. REGIONS, OFFICES & TEAMS
-- ==========================================

CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'REMAX',
    baseline_income NUMERIC DEFAULT 1500, -- The Survival Line monthly target
    director_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_id UUID REFERENCES regions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT NOT NULL DEFAULT 'REMAX',
    area TEXT NOT NULL DEFAULT '',
    broker_name TEXT DEFAULT '',
    broker_id UUID REFERENCES profiles(id),
    plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'silver', 'gold', 'diamond')),
    max_agents INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    team_leader_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add FK from profiles to offices (deferred because of circular reference)
ALTER TABLE profiles ADD CONSTRAINT fk_profiles_office
    FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL;

-- ==========================================
-- 3. SEARCHES (buyer/renter profiles on Match Board)
-- ==========================================
CREATE TABLE IF NOT EXISTS searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    co_client_name TEXT DEFAULT '',
    co_client_email TEXT DEFAULT '',
    co_buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    search_type TEXT NOT NULL DEFAULT 'buy' CHECK (search_type IN ('buy', 'rent')),
    property_type TEXT NOT NULL DEFAULT 'house',
    location TEXT NOT NULL DEFAULT '',
    budget_min INTEGER DEFAULT 0,
    budget_max INTEGER DEFAULT 0,
    bedrooms INTEGER,
    bathrooms INTEGER,
    lot_size_min NUMERIC,
    lot_size_max NUMERIC,
    must_haves TEXT[] DEFAULT '{}',
    nice_to_haves TEXT[] DEFAULT '{}',
    notes TEXT DEFAULT '',
    timing TEXT DEFAULT 'flexible',
    payment_method TEXT DEFAULT 'cash',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived', 'expired')),
    expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 4. MATCHES (property sent to a search)
-- ==========================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID NOT NULL REFERENCES searches(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    property_name TEXT NOT NULL,
    property_link TEXT DEFAULT '',
    property_price INTEGER DEFAULT 0,
    property_location TEXT DEFAULT '',
    property_bedrooms INTEGER,
    property_bathrooms INTEGER,
    property_size NUMERIC,
    commission NUMERIC(4,2) DEFAULT 5.0,
    image_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'liked', 'visited', 'contract', 'sold', 'rejected', 'waiting_partner')),
    liked_by UUID[] DEFAULT '{}',
    rejected_by UUID[] DEFAULT '{}',
    reject_reason TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 5. TICKETS (support reports)
-- ==========================================
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email TEXT DEFAULT '',
    user_name TEXT DEFAULT '',
    type TEXT NOT NULL DEFAULT 'bug' CHECK (type IN ('bug', 'feature', 'question')),
    subject TEXT NOT NULL,
    body TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 6. LOCATIONS (cantons + districts)
-- ==========================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province TEXT NOT NULL DEFAULT 'San José',
    canton TEXT NOT NULL,
    district TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 7. DEALS (pipeline tracking)
-- ==========================================
CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_id UUID REFERENCES searches(id) ON DELETE SET NULL,
    match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
    buyer_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    seller_agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    property_name TEXT NOT NULL DEFAULT '',
    price INTEGER DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'negotiation' CHECK (stage IN ('negotiation', 'contract', 'sold', 'fell_through')),
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- 8. NOTIFICATIONS
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('new_match', 'feedback_request', 'deal_update', 'ticket_response', 'info')),
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    link TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- INDEXES for performance
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_searches_agent ON searches(agent_id);
CREATE INDEX IF NOT EXISTS idx_searches_status ON searches(status);
CREATE INDEX IF NOT EXISTS idx_searches_location ON searches(location);
CREATE INDEX IF NOT EXISTS idx_matches_search ON matches(search_id);
CREATE INDEX IF NOT EXISTS idx_matches_sender ON matches(sender_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_office ON profiles(office_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_locations_canton ON locations(canton);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles, but only update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- OFFICES: Everyone can read, only admin can modify
CREATE POLICY "Offices are viewable by everyone" ON offices FOR SELECT USING (true);
CREATE POLICY "Admin can manage offices" ON offices FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);

-- SEARCHES: Everyone can read active searches (Match Board), agents manage their own
CREATE POLICY "Active searches are public" ON searches FOR SELECT USING (status = 'active' OR agent_id = auth.uid());
CREATE POLICY "Agents manage own searches" ON searches FOR INSERT WITH CHECK (agent_id = auth.uid());
CREATE POLICY "Agents update own searches" ON searches FOR UPDATE USING (agent_id = auth.uid());
CREATE POLICY "Agents delete own searches" ON searches FOR DELETE USING (agent_id = auth.uid());

-- MATCHES: Sender and search owner can see matches
CREATE POLICY "Match participants can view" ON matches FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM searches WHERE searches.id = matches.search_id AND searches.agent_id = auth.uid())
);
CREATE POLICY "Agents can send matches" ON matches FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Match participants can update" ON matches FOR UPDATE USING (
    sender_id = auth.uid() OR
    EXISTS (SELECT 1 FROM searches WHERE searches.id = matches.search_id AND searches.agent_id = auth.uid())
);

-- TICKETS: Users see own tickets, admin sees all
CREATE POLICY "Users see own tickets" ON tickets FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);
CREATE POLICY "Users can create tickets" ON tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can manage tickets" ON tickets FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);

-- LOCATIONS: Everyone can read, admin can manage
CREATE POLICY "Locations are public" ON locations FOR SELECT USING (true);
CREATE POLICY "Admin can manage locations" ON locations FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);

-- DEALS: Participants can view their deals
CREATE POLICY "Deal participants can view" ON deals FOR SELECT USING (
    buyer_agent_id = auth.uid() OR seller_agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);
CREATE POLICY "Agents can create deals" ON deals FOR INSERT WITH CHECK (
    buyer_agent_id = auth.uid() OR seller_agent_id = auth.uid()
);
CREATE POLICY "Deal participants can update" ON deals FOR UPDATE USING (
    buyer_agent_id = auth.uid() OR seller_agent_id = auth.uid()
);

-- NOTIFICATIONS: Users only see their own
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can mark own as read" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA: Default office + locations
-- ==========================================
INSERT INTO offices (name, brand, area, broker_name) VALUES
    ('REMAX Altitud', 'REMAX', 'Pérez Zeledón', 'Alejandra Castro'),
    ('REMAX Altitud Cero', 'REMAX', 'Dominical', 'Carlos Rodriguez')
ON CONFLICT DO NOTHING;

-- Pérez Zeledón districts (core area)
INSERT INTO locations (province, canton, district, is_active) VALUES
    ('San José', 'Pérez Zeledón', 'San Isidro de El General', true),
    ('San José', 'Pérez Zeledón', 'Daniel Flores', true),
    ('San José', 'Pérez Zeledón', 'Rivas', true),
    ('San José', 'Pérez Zeledón', 'San Pedro', true),
    ('San José', 'Pérez Zeledón', 'Platanares', true),
    ('San José', 'Pérez Zeledón', 'Pejibaye', true),
    ('San José', 'Pérez Zeledón', 'Cajón', true),
    ('San José', 'Pérez Zeledón', 'Barú', true),
    ('San José', 'Pérez Zeledón', 'Río Nuevo', true),
    ('San José', 'Pérez Zeledón', 'Páramo', true),
    ('San José', 'Pérez Zeledón', 'La Amistad', true),
    ('San José', 'Pérez Zeledón', 'El General (Savegre)', true),
    ('Puntarenas', 'Osa', 'Dominical', true),
    ('Puntarenas', 'Osa', 'Uvita', true),
    ('Puntarenas', 'Osa', 'Ojochal', true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- STORAGE BUCKET for avatars
-- ==========================================
-- Run this separately in Supabase Dashboard > Storage:
-- Create a bucket called "avatars" with public access
-- Or run via SQL:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ==========================================
-- 9. ENTERPRISE VIEWS: Agent Survival Metrics
-- ==========================================
-- This view aggregates agent income vs the Regional Survival Line.
CREATE OR REPLACE VIEW agent_performance_metrics AS
SELECT 
    p.id AS agent_id,
    p.full_name AS agent_name,
    p.employment_type,
    p.split_percentage,
    EXTRACT(YEAR FROM age(CURRENT_DATE, p.start_date)) AS years_active,
    o.name AS office_name,
    r.name AS region_name,
    r.baseline_income AS monthly_survival_line,
    
    -- Calculate YTD Sold Volume (Gross Sales Price)
    COALESCE(SUM(d.price) FILTER (WHERE d.stage = 'sold' AND EXTRACT(YEAR FROM d.updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) AS ytd_volume,
    
    -- Calculate YTD Net Income for Agent:
    -- Assuming a 5% standard total commission, divided by 2 (buyer/seller side) = 2.5% gross side commission.
    -- Then multiplied by the agent's split percentage.
    COALESCE(SUM(d.price * 0.025 * (p.split_percentage / 100.0)) FILTER (WHERE d.stage = 'sold' AND EXTRACT(YEAR FROM d.updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) AS ytd_net_income,
    
    -- Compare Net Income YTD against Survival Line YTD expectations
    (r.baseline_income * EXTRACT(MONTH FROM CURRENT_DATE)) AS ytd_survival_target,
    
    -- Survival Status Flag
    CASE 
        WHEN COALESCE(SUM(d.price * 0.025 * (p.split_percentage / 100.0)) FILTER (WHERE d.stage = 'sold' AND EXTRACT(YEAR FROM d.updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)), 0) >= (r.baseline_income * EXTRACT(MONTH FROM CURRENT_DATE)) THEN 'Green Zone 🟢'
        ELSE 'Red Zone 🔴'
    END AS survival_status

FROM profiles p
JOIN offices o ON p.office_id = o.id
JOIN regions r ON o.region_id = r.id
LEFT JOIN deals d ON (p.id = d.buyer_agent_id OR p.id = d.seller_agent_id)
WHERE p.role = 'agent'
GROUP BY p.id, p.full_name, p.employment_type, p.split_percentage, p.start_date, o.name, r.name, r.baseline_income;
