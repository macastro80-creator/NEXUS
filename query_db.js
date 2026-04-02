const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://oprrfbsrihkjtiafyuxn.supabase.co', 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl');

async function check() {
    const { data: s } = await supabase.from('searches').select('*');
    console.log("Searches total:", s?.length || 0);
    if(s?.length) console.log(s[0]);
}
check();
