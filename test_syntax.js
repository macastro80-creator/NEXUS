function formatBudget(n) {
    if(!n) return '$0';
    if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + Math.round(n/1000) + 'k';
    return '$' + n;
}
async function loadSupabaseSearches() {
    // We already have `supabase` initialized in db-service.js (if not blocked)
    if (!window.supabase) {
        console.warn('Supabase not loaded yet.');
        return;
    }
    const { data: { user } } = await window.supabase.auth.getUser();
    if (!user) return; // User not logged in? Handled by db-service.js auth check ideally

    // 1. Fetch Searches (for tabBuyer, metricBuyers)
    const { data: searches } = await window.supabase
        .from('searches')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'active');
        
    const activeSearchCount = searches ? searches.length : 0;
    
    // update label
    const metricBuyersEl = document.getElementById('metricBuyers');
    if (metricBuyersEl) {
        metricBuyersEl.innerHTML = `
            ${activeSearchCount} <span class="lang-en">Active</span><span class="lang-es hidden">Activas</span>
        `;
    }

    const container = document.getElementById('mySearchesContainer');
    const emptyState = document.getElementById('buyerEmptyState');
    if (!searches || searches.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        let html = '';
        searches.forEach(s => {
            html += `
            <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <p class="text-[8px] font-black tracking-widest uppercase text-slate-400 mb-1 flex items-center gap-1">
                            <i class="fa-solid fa-location-dot"></i> ${s.location}
                        </p>
                        <h3 class="font-black text-xl text-[#003DA5] dark:text-blue-400 leading-tight">${s.client_name || 'Private Client'}</h3>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mb-4">
                    <div>
                        <p class="text-[8px] font-black text-slate-500 uppercase lang-en">Budget</p>
                        <p class="text-[8px] font-black text-slate-500 uppercase lang-es hidden">Presupuesto</p>
                        <p class="text-xs font-black text-slate-800 dark:text-slate-200">${formatBudget(s.budget_min)} - ${formatBudget(s.budget_max)}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[8px] font-black text-slate-500 uppercase lang-en">Property</p>
                        <p class="text-[8px] font-black text-slate-500 uppercase lang-es hidden">Propiedad</p>
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">${s.property_type}</p>
                    </div>
                </div>
            </div>`;
        });
        container.innerHTML = html;
    }

    // 2. Fetch Matches Sent (for tabSeller, metricListings)
    // To do later, update metricListings specifically.
    const { data: matches } = await window.supabase
        .from('matches')
        .select('*')
        .eq('sender_id', user.id)
        .eq('status', 'new');
    
    if(matches) {
        const metricListingsEl = document.getElementById('metricListings');
        if(metricListingsEl) {
            metricListingsEl.innerHTML = `${matches.length} <span class="lang-en">Active</span><span class="lang-es hidden">Activos</span>`;
        }
    }

    // 3. Fetch Deals for Kanban and Metrics
    const { data: deals } = await window.supabase
        .from('deals')
        .select('*')
        .or(`buyer_agent_id.eq.${user.id},seller_agent_id.eq.${user.id}`);

    let pipelineSum = 0;
    let contractSum = 0;

    if (deals) {
        deals.forEach(d => {
            if (d.stage === 'negotiation') pipelineSum += d.price || 0;
            if (d.stage === 'contract') contractSum += d.price || 0;
        });
    }

    const mPipe = document.getElementById('metricPipelinePotential');
    if (mPipe) mPipe.innerText = formatBudget(pipelineSum);

    const mCont = document.getElementById('metricUnderContract');
    if (mCont) mCont.innerText = formatBudget(contractSum);
}
