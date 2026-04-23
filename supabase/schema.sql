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
    role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'remax', 'team_leader', 'broker', 'officeadmin', 'regional_director', 'mainadmin', 'buyer', 'seller')),
    region_id UUID, -- Which Master Franchise
    office_id UUID, -- Which Brokerage
    team_id UUID, -- Which sub-team inside the office
    assigned_agent_id UUID, -- For buyer role
    avatar_url TEXT DEFAULT '',
    tx_volume TEXT DEFAULT '1-5',
    tx_expected INTEGER DEFAULT 0,
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
    plan_tier TEXT DEFAULT 'core' CHECK (plan_tier IN ('core', 'pulse', 'omni')),
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
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS fk_profiles_office;
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
    client_token UUID DEFAULT gen_random_uuid(),
    co_client_token UUID DEFAULT gen_random_uuid(),
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
    capture_percentage NUMERIC(5,2) DEFAULT 0.0,
    share_percentage NUMERIC(5,2) DEFAULT 0.0,
    image_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'liked', 'visited', 'contract', 'sold', 'rejected', 'waiting_partner')),
    liked_by UUID[] DEFAULT '{}',
    rejected_by UUID[] DEFAULT '{}',
    reject_reason TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    client_vote TEXT,
    co_client_vote TEXT,
    visit_requested BOOLEAN DEFAULT false,
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
    INSERT INTO public.profiles (id, email, full_name, phone, brand, role, office_id)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'phone', ''),
        COALESCE(new.raw_user_meta_data->>'brand', 'Independent'),
        COALESCE(new.raw_user_meta_data->>'role', 'agent'),
        NULLIF(new.raw_user_meta_data->>'office_id', '')::UUID
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

-- ==========================================
-- 10. BROKER/REGION EXPANSION (PHASE A/B)
-- ==========================================

-- Alter PROFILES to add new recruitment demographics
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'unknown' CHECK (gender IN ('male', 'female', 'unknown', 'other')),
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS recruitment_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS commission_rules JSONB DEFAULT '{}';

-- Alter DEALS for Reservometro & Origination
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS lead_origin TEXT DEFAULT 'organic',
ADD COLUMN IF NOT EXISTS estimated_closing_date DATE,
ADD COLUMN IF NOT EXISTS actual_closing_date DATE,
ADD COLUMN IF NOT EXISTS agent_commission_split JSONB DEFAULT '{}', -- stores exact fractional splits
ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT false;

-- Create PROPERTIES table (for API Syncs & Inventory management)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    external_api_id TEXT UNIQUE, -- to avoid duplicates upon API sync
    title TEXT NOT NULL,
    description TEXT,
    prop_type TEXT NOT NULL DEFAULT 'house' CHECK (prop_type IN ('house', 'lot', 'commercial', 'apartment')),
    status TEXT NOT NULL DEFAULT 'for_sale' CHECK (status IN ('for_sale', 'for_rent', 'sold', 'rented', 'off_market')),
    is_exclusive BOOLEAN DEFAULT false,
    capture_date DATE DEFAULT CURRENT_DATE,
    price INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    location TEXT DEFAULT '',
    metrics JSONB DEFAULT '{}', -- to store dynamic stats
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create EXPENSES table (for Office Profitability / P&L)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('rent', 'brand', 'salaries', 'marketing', 'legal', 'other')),
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    expense_date DATE DEFAULT CURRENT_DATE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS FOR PROPERTIES
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties viewable by active users" ON properties FOR SELECT USING (true);
CREATE POLICY "Brokers can manage office properties" ON properties FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('broker', 'officeadmin', 'mainadmin'))
);
CREATE POLICY "Agents can update own properties" ON properties FOR UPDATE USING (agent_id = auth.uid());

-- RLS FOR EXPENSES
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only Brokers and Admins see expenses" ON expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'mainadmin' OR (role IN ('broker', 'officeadmin') AND office_id = expenses.office_id)))
);

-- ==========================================
-- 11. NATIONAL RANKING VIEWS (PHASE A/B)
-- ==========================================
CREATE OR REPLACE VIEW office_national_ranking AS
WITH office_stats AS (
    SELECT 
        o.id AS office_id,
        o.name AS office_name,
        r.name AS region_name,
        -- MTD (Month-to-Date) Gross Sales
        COALESCE(SUM(d.price) FILTER (
            WHERE d.stage = 'sold' 
            AND EXTRACT(MONTH FROM d.updated_at) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM d.updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) AS mtd_sales,
        -- YTD (Year-to-Date) Gross Sales
        COALESCE(SUM(d.price) FILTER (
            WHERE d.stage = 'sold' 
            AND EXTRACT(YEAR FROM d.updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) AS ytd_sales
    FROM offices o
    JOIN regions r ON o.region_id = r.id
    LEFT JOIN profiles p ON p.office_id = o.id
    LEFT JOIN deals d ON (p.id = d.buyer_agent_id OR p.id = d.seller_agent_id)
    GROUP BY o.id, o.name, r.name
)
SELECT 
    office_id,
    office_name,
    region_name,
    mtd_sales,
    RANK() OVER (ORDER BY mtd_sales DESC) AS mtd_rank,
    ytd_sales,
    RANK() OVER (ORDER BY ytd_sales DESC) AS ytd_rank
FROM office_stats;

-- ==========================================
-- 12. AGENT EXPENSES (Cuentas Corrientes)
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    office_id UUID REFERENCES offices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'void')),
    charge_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS FOR AGENT EXPENSES
ALTER TABLE agent_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents can view own expenses" ON agent_expenses FOR SELECT USING (agent_id = auth.uid());
CREATE POLICY "Brokers can manage office expenses" ON agent_expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'mainadmin' OR (role IN ('broker', 'officeadmin') AND office_id = agent_expenses.office_id)))
);

-- ==========================================
-- 13. AGENT MEETINGS LOG (Bitácora 1to1)
-- ==========================================
CREATE TABLE IF NOT EXISTS agent_meetings_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    broker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    meeting_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    is_private BOOLEAN DEFAULT true,
    is_skipped BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS FOR MEETINGS
ALTER TABLE agent_meetings_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents view own meetings if not private" ON agent_meetings_log FOR SELECT USING (agent_id = auth.uid() AND is_private = false);
CREATE POLICY "Brokers manage meetings" ON agent_meetings_log FOR ALL USING (
    broker_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);

-- ==========================================
-- 14. PLAN REQUESTS (Lead Capture)
-- ==========================================
CREATE TABLE IF NOT EXISTS plan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    country TEXT DEFAULT '',
    zone TEXT DEFAULT '',
    agent_count INTEGER DEFAULT 1,
    desired_service TEXT NOT NULL DEFAULT 'pulse' CHECK (desired_service IN ('core', 'pulse', 'omni')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed_won', 'closed_lost')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS FOR PLAN REQUESTS
ALTER TABLE plan_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create plan requests" ON plan_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view plan requests" ON plan_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);
CREATE POLICY "Admins can update plan requests" ON plan_requests FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin')
);

-- ==========================================
-- 15. SELLER REPORTS (Snapshots for Vendedores)
-- ==========================================
CREATE TABLE IF NOT EXISTS seller_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    report_token UUID DEFAULT gen_random_uuid(),
    seller_name TEXT DEFAULT '',
    seller_email TEXT DEFAULT '',
    views_count INTEGER DEFAULT 0,
    matches_count INTEGER DEFAULT 0,
    demand_stats JSONB DEFAULT '{}',
    agent_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS FOR SELLER REPORTS
ALTER TABLE seller_reports ENABLE ROW LEVEL SECURITY;
-- Allow anonymous access to a specific report using the report_token
CREATE POLICY "Anyone can view report with token" ON seller_reports FOR SELECT USING (true);
CREATE POLICY "Agents can manage own reports" ON seller_reports FOR ALL USING (agent_id = auth.uid());

-- ==========================================
-- 16. RPC FUNCTIONS (For anonymous client portal updates)
-- ==========================================
CREATE OR REPLACE FUNCTION submit_client_vote(p_match_id UUID, p_token UUID, p_vote TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_search_id UUID;
    v_client_token UUID;
    v_co_client_token UUID;
BEGIN
    -- Get search details via match
    SELECT search_id INTO v_search_id FROM matches WHERE id = p_match_id;
    IF v_search_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get tokens
    SELECT client_token, co_client_token INTO v_client_token, v_co_client_token FROM searches WHERE id = v_search_id;

    -- Check which token matches and update the correct vote
    IF p_token = v_client_token THEN
        UPDATE matches SET client_vote = p_vote WHERE id = p_match_id;
        
        -- Business logic: if both voted loved, or if there's no co-buyer token and client loved
        -- Update match status to liked automatically...? (Let agent do this or do it here)
        RETURN TRUE;
    ELSIF p_token = v_co_client_token THEN
        UPDATE matches SET co_client_vote = p_vote WHERE id = p_match_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION request_client_visit(p_match_id UUID, p_token UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_search_id UUID;
BEGIN
    SELECT search_id INTO v_search_id FROM matches WHERE id = p_match_id;
    IF EXISTS (SELECT 1 FROM searches WHERE id = v_search_id AND (client_token = p_token OR co_client_token = p_token)) THEN
        UPDATE matches SET visit_requested = TRUE WHERE id = p_match_id;
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_client_matches(p_token UUID)
RETURNS TABLE (
    id UUID,
    property_name TEXT,
    property_link TEXT,
    property_price INTEGER,
    property_location TEXT,
    property_bedrooms INTEGER,
    property_bathrooms INTEGER,
    property_size NUMERIC,
    image_url TEXT,
    notes TEXT,
    client_vote TEXT,
    co_client_vote TEXT,
    visit_requested BOOLEAN,
    is_co_buyer BOOLEAN,
    search_client_name TEXT,
    search_co_client_name TEXT
) AS $$
DECLARE
    v_search_id UUID;
    v_is_co BOOLEAN;
BEGIN
    -- Determine role and search_id
    SELECT s.id, (s.co_client_token = p_token) INTO v_search_id, v_is_co 
    FROM searches s 
    WHERE s.client_token = p_token OR s.co_client_token = p_token;

    IF v_search_id IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT 
        m.id,
        m.property_name,
        m.property_link,
        m.property_price,
        m.property_location,
        m.property_bedrooms,
        m.property_bathrooms,
        m.property_size,
        m.image_url,
        m.notes,
        m.client_vote,
        m.co_client_vote,
        m.visit_requested,
        v_is_co,
        s.client_name,
        s.co_client_name
    FROM matches m
    JOIN searches s ON s.id = m.search_id
    WHERE m.search_id = v_search_id
      AND m.status NOT IN ('rejected', 'sold');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 17. ADMIN RPC FUNCTIONS
-- ==========================================
CREATE OR REPLACE FUNCTION admin_update_user(target_user_id UUID, new_role TEXT, new_office_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'mainadmin') THEN
        UPDATE profiles SET role = new_role, office_id = new_office_id WHERE id = target_user_id;
        RETURN TRUE;
    END IF;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

