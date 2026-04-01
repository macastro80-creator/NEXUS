        function toggleNotifications() {
            const panel = document.getElementById('notificationsPanel');
            if (panel.classList.contains('hidden')) {
                panel.classList.remove('hidden');
                panel.classList.add('flex');
            } else {
                panel.classList.add('hidden');
                panel.classList.remove('flex');
            }
        }
        
        async function loadSupabaseSearches() {
            let client;
            if (typeof supabase !== 'undefined' && supabase) {
                client = supabase;
            } else if (window.supabase) {
                client = window.supabase.createClient('https://oprrfbsrihkjtiafyuxn.supabase.co', 'sb_publishable_vcgGRA09bHX1suZrkqYcAg_hpumhYHl');
            } else {
                console.warn('Supabase not loaded yet.');
                return;
            }
            
            const { data } = await client.auth.getUser();
            const user = data?.user;
            if (!user) {
                console.warn('User not logged in, unable to load searches.');
                return;
            }

            // 1. Fetch Searches
            const { data: searches } = await client
                .from('searches')
                .select('*')
                .eq('agent_id', user.id)
                .eq('status', 'active');
                
            const activeSearchCount = searches ? searches.length : 0;
            const metricBuyersEl = document.getElementById('metricBuyers');
            if (metricBuyersEl) {
                metricBuyersEl.innerHTML = activeSearchCount + ' <span class="lang-en">Active</span><span class="lang-es hidden">Activas</span>';
            }

            const container = document.getElementById('mySearchesContainer');
            const emptyState = document.getElementById('buyerEmptyState');
            if (!searches || searches.length === 0) {
                if(container) container.innerHTML = '';
                if(emptyState) emptyState.classList.remove('hidden');
            } else if (container) {
                if(emptyState) emptyState.classList.add('hidden');
                let html = '';
                searches.forEach(s => { html += renderMySearchCard(s); });
                container.innerHTML = html;
            }

            // 2. Fetch Matches Sent
            const { data: matches } = await client
                .from('matches')
                .select('*')
                .eq('sender_id', user.id)
                .in('status', ['new', 'visited', 'liked', 'contract', 'waiting_partner']);
            
            if(matches) {
                const activeMatches = matches.length;
                const metricListingsEl = document.getElementById('metricListings');
                if(metricListingsEl) {
                    metricListingsEl.innerHTML = activeMatches + ' <span class="lang-en">Active</span><span class="lang-es hidden">Activos</span>';
                }
            }

            // 3. Fetch Deals for Kanban Metrics
            const { data: deals } = await client
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
            if (mPipe) mPipe.innerText = typeof formatBudget === 'function' ? formatBudget(pipelineSum) : '$' + pipelineSum;

