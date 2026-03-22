-- ==============================================================================
-- NEXUS MIGRATION: Co-Buyer Tinder Board & RLS Fixes
-- Run this in your Supabase SQL Editor to enable the new Dual-Decision engine!
-- ==============================================================================

-- 1. Add Explicit Buyer IDs to Searches
-- We add these so both the primary client and their partner can be securely linked 
-- to the search without overwriting the original agent's `agent_id`.
ALTER TABLE searches 
ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- 2. Update MATCHES RLS Policies
-- Drop the old restrictive policies
DROP POLICY IF EXISTS "Match participants can view" ON matches;
DROP POLICY IF EXISTS "Match participants can update" ON matches;

-- Create new policies allowing Sender, Agent, Primary Buyer, and Partner to view matches
CREATE POLICY "Match participants can view" ON matches FOR SELECT USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM searches 
        WHERE searches.id = matches.search_id 
        AND (
            searches.agent_id = auth.uid() OR 
            searches.buyer_id = auth.uid() OR 
            searches.partner_id = auth.uid() OR
            searches.co_buyer_id = auth.uid() -- legacy support
        )
    )
);

CREATE POLICY "Match participants can update" ON matches FOR UPDATE USING (
    sender_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM searches 
        WHERE searches.id = matches.search_id 
        AND (
            searches.agent_id = auth.uid() OR 
            searches.buyer_id = auth.uid() OR 
            searches.partner_id = auth.uid() OR
            searches.co_buyer_id = auth.uid()
        )
    )
);

-- 3. Update SEARCHES RLS Policies
-- Allow buyers to see their own searches in addition to agents
DROP POLICY IF EXISTS "Active searches are public" ON searches;
CREATE POLICY "Active searches are public" ON searches FOR SELECT USING (
    status = 'active' OR 
    agent_id = auth.uid() OR 
    buyer_id = auth.uid() OR 
    partner_id = auth.uid() OR
    co_buyer_id = auth.uid()
);

-- Done! The frontend query logic will now successfully retrieve data for BOTH partners.
