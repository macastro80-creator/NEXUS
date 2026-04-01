const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://oprrfbsrihkjtiafyuxn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
    const { data, error } = await supabase.from('profiles').select('office_id, role, offices!office_id(name)').limit(1);
    console.log("offices!office_id(name):", error ? error.message : "SUCCESS!");

    const { data2, error2 } = await supabase.from('office_national_ranking').select('*').limit(1);
    console.log("office_national_ranking:", error2 ? error2.message : "SUCCESS!");

    const { data3, error3 } = await supabase.from('properties').select('*').limit(1);
    console.log("properties:", error3 ? error3.message : "SUCCESS!");
}
test();
