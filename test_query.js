const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://oprrfbsrihkjtiafyuxn.supabase.co', 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl');

async function test() {
    const { data, error } = await supabase
        .from('matches')
        .select('*, searches(client_name, location, profiles:agent_id(full_name), matches(id, status))')
        .limit(1);

    console.log("Error:", error);
    console.log("Data:", JSON.stringify(data, null, 2));
}

test();
