const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBrokerERP() {
    try {
        console.log("Signing in...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: 'admin@test.com',
            password: 'NexusTest2026!'
        });
        if (signInError) throw signInError;
        
        const user = signInData.user;
        console.log("Logged in as:", user.email);

        console.log("Fetching profile...");
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('office_id, role, offices!office_id(name)')
            .eq('id', user.id)
            .single();
            
        if (profErr) throw profErr;
        console.log("Profile:", profile);

        const myOfficeId = profile.office_id;

        if (myOfficeId) {
            console.log("Fetching rankings...");
            const { data: ranks, error: rankErr } = await supabase
                .from('office_national_ranking')
                .select('*')
                .eq('office_id', myOfficeId)
                .single();
            if (rankErr && rankErr.code !== 'PGRST116') throw rankErr; // ignoring 0 rows
        }

        console.log("Fetching agents...");
        let agentQuery = supabase.from('profiles').select('*').eq('role', 'agent');
        if (myOfficeId) agentQuery = agentQuery.eq('office_id', myOfficeId);
        
        const { data: agents, error: agentErr } = await agentQuery;
        if (agentErr) throw agentErr;
        console.log(`Found ${agents.length} agents.`);

        console.log("Fetching properties...");
        let propQuery = supabase.from('properties').select('location, prop_type');
        if (myOfficeId) propQuery = propQuery.eq('office_id', myOfficeId);
        
        const { data: properties, error: propErr } = await propQuery;
        if (propErr) throw propErr;
        console.log(`Found ${properties.length} properties.`);

        console.log("SUCCESS!");
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

testBrokerERP();
