const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkProfiles() {
    const { data, error } = await supabase.from('profiles').select('email, role, full_name');
    if (error) {
        console.error("Error fetching profiles:", error);
    } else {
        console.log("Current Profiles in DB:");
        console.table(data);
    }
}
checkProfiles();
