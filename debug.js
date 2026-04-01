const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testDisambiguate() {
    let { error: e1 } = await supabase.from('profiles').select('id, offices!office_id(name)').limit(1);
    console.log("Using !office_id:", e1 ? e1.message : "OK");

    let { error: e2 } = await supabase.from('profiles').select('id, offices!fk_profiles_office(name)').limit(1);
    console.log("Using !fk_profiles_office:", e2 ? e2.message : "OK");
    
    // Also test db-service.js getCurrentProfile method which probably broke too:
    let { error: e3 } = await supabase.from('profiles').select('id, offices!office_id(name, brand, area)').limit(1);
    console.log("Using getCurrentProfile fix:", e3 ? e3.message : "OK");
}

testDisambiguate();
