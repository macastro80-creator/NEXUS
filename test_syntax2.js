const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oprrfbsrihkjtiafyuxn.supabase.co', 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl');

async function test() {
    console.log("Testing syntax A: offices!office_id(name, brand, area)");
    const { error: errA } = await supabase.from('profiles').select('*, offices!office_id(name, brand, area)').limit(1);
    console.log("Result A:", errA ? errA.message : "Success");
    
    console.log("Testing syntax B: offices(name, brand, area)");
    const { error: errB } = await supabase.from('profiles').select('*, offices(name, brand, area)').limit(1);
    console.log("Result B:", errB ? errB.message : "Success");
}
test();
