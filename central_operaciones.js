// central_operaciones.js

document.addEventListener('DOMContentLoaded', () => {
    initKanban();
    fetchInventory();
    fetchACMs();
});

// Kanban State
let pipelineDeals = [
    { id: 1, type: 'prelisting', title: 'Casa en Escazu', client: 'Roberto', phone: '50688888888', loc: 'Escazu', value: 350000 },
    { id: 2, type: 'acm', title: 'Lote Uvita', client: 'Sarah', phone: '50622223333', loc: 'Uvita', value: 120000, acmLink: 'https://acm-remax.vercel.app/' },
    { id: 3, type: 'exclusiva', title: 'Condo Rohrmoser', client: 'Juan', phone:'50612345678', loc: 'San Jose', value: 200000 }
];

function initKanban() {
    renderKanban();
}

function renderKanban() {
    const columns = {
        'prospect': [], 'prelisting': [], 'acm': [], 'exclusiva': [],
        'consulta': [], 'muestra': [], 'reserva': [], 'venta': [], 'followup': []
    };

    // Group deals
    pipelineDeals.forEach(deal => {
        if(columns[deal.type]) {
            columns[deal.type].push(deal);
        } else {
             // Default to prospect if unrecognized
            columns['prospect'].push(deal);
        }
    });

    // Render columns
    for (const [colId, deals] of Object.entries(columns)) {
        const el = document.getElementById(`col-${colId}`);
        if(el) {
            el.innerHTML = deals.map(deal => createCardHTML(deal)).join('');
            const countBadge = document.getElementById(`count-${colId}`);
            if(countBadge) countBadge.innerText = deals.length;
        }
    }
}

function createCardHTML(deal) {
    let extraActions = ``;
    if (deal.type === 'prelisting') {
        extraActions = `<button onclick="generateACMFromCard(${deal.id})" class="mt-2 w-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-500 py-1.5 rounded text-[9px] font-black uppercase flex items-center justify-center gap-1 border border-amber-200 dark:border-amber-700/50 hover:bg-amber-100 transition"><i class="fa-solid fa-calculator"></i> Crear ACM</button>`;
    } else if (deal.type === 'acm') {
        const wpLink = `https://wa.me/${deal.phone}?text=${encodeURIComponent("Hola " + deal.client + ", te comparto tu Análisis Comparativo de Mercado (ACM): " + (deal.acmLink || 'https://acm-remax.vercel.app/'))}`;
        extraActions = `<a href="${wpLink}" target="_blank" class="mt-2 w-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-500 py-1.5 rounded text-[9px] font-black uppercase flex items-center justify-center gap-1 border border-green-200 dark:border-green-700/50 hover:bg-green-100 transition"><i class="fa-brands fa-whatsapp"></i> Follow Up</a>`;
    }

    return `
    <div class="kanban-card cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition group relative" draggable="true" ondragstart="event.dataTransfer.setData('text/plain', ${deal.id})">
        <div class="flex justify-between items-start mb-1">
            <h5 class="text-[11px] font-black tracking-tight leading-tight">${deal.title}</h5>
            <div class="dropdown relative">
               <i class="fa-solid fa-ellipsis text-slate-300 text-[10px] hover:text-slate-500" onclick="alert('Options for ${deal.title}')"></i>
            </div>
        </div>
        <p class="text-[9px] text-slate-500 font-bold mb-1"><i class="fa-regular fa-user mr-1"></i>${deal.client}</p>
        <p class="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">$${deal.value ? deal.value.toLocaleString() : 'TBD'}</p>
        ${extraActions}
    </div>
    `;
}

// Pre-Listing Logic
function savePreListing(e) {
    e.preventDefault();
    const title = document.getElementById('plPropName').value;
    const client = document.getElementById('plOwnerName').value;
    const phone = document.getElementById('plPhone').value.replace(/[^0-9]/g, '');
    const loc = document.getElementById('plLocation').value;

    const newDeal = { id: Date.now(), type: 'prelisting', title, client, phone, loc, value: 0 };
    pipelineDeals.push(newDeal);
    renderKanban();
    
    document.getElementById('preListingModal').classList.add('hidden');
    document.getElementById('plPropName').value = '';
    document.getElementById('plOwnerName').value = '';
    document.getElementById('plPhone').value = '';
    document.getElementById('plLocation').value = '';
    alert('Pre-Listing guardado en el Ciclo de Vida.');
}

function generateACMFromPreListing() {
    // Collect from form directly
    const title = document.getElementById('plPropName').value;
    const client = document.getElementById('plOwnerName').value;
    const loc = document.getElementById('plLocation').value;

    if(!title) { alert('Ingresa un nombre de propiedad primero.'); return; }

    // Logic requested: Take Pre-listing info to make ACM.
    const url = new URL('https://acm-remax.vercel.app/');
    url.searchParams.append('client', client);
    url.searchParams.append('prop', title);
    url.searchParams.append('loc', loc);
    
    window.open(url.toString(), '_blank');
}

function generateACMFromCard(dealId) {
    const deal = pipelineDeals.find(d => d.id === dealId);
    if(deal) {
        deal.type = 'acm'; // Move to ACM column automatically?
        renderKanban();

        const url = new URL('https://acm-remax.vercel.app/');
        url.searchParams.append('client', deal.client);
        url.searchParams.append('prop', deal.title);
        url.searchParams.append('loc', deal.loc);
        window.open(url.toString(), '_blank');
    }
}

// Fetch Supabase ACMs
async function fetchACMs() {
    if(!window.supabaseClient) {
        console.warn("Supabase client not initialized.");
        return;
    }
    try {
        const { data, error } = await window.supabaseClient.from('acm_reports').select('*').order('created_at', { ascending: false });
        if(error) throw error;
        
        if (data && data.length > 0) {
            // Transform and add to pipeline
            data.forEach(acm => {
                const deal = {
                    id: 'acm_' + acm.id,
                    type: 'acm',
                    title: acm.property_address || 'Sin Dirección',
                    client: acm.agent_name || 'Desconocido',
                    phone: acm.agent_phone || '', // Needs to be the owner phone really but taking what we have
                    loc: acm.property_address || '',
                    value: acm.price_suggested ? acm.price_suggested.replace(/[^0-9]/g, '') : 0,
                    acmLink: 'https://acm-remax.vercel.app/'
                };
                
                // Avoid duplicates if we reload
                if (!pipelineDeals.find(d => d.id === deal.id)) {
                     pipelineDeals.push(deal);
                }
            });
            renderKanban();
        }
    } catch(e) {
        console.log("Supabase fetch failed", e);
    }
}

// Fetch Inventory for Auto Export
async function fetchInventory() {
    const container = document.getElementById('exportPortfolioContainer');
    try {
        const res = await fetch('properties.json');
        const data = await res.json();
        
        // Take a few random properties assuming they belong to the agent
        const myProps = data.properties.slice(0, 3); 
        
        container.innerHTML = myProps.map(p => `
            <div class="flex items-center justify-between border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-2xl p-3 relative overflow-hidden">
                <div class="flex gap-3">
                    <div class="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                       <img src="${p.fotos ? p.fotos[0] : ''}" class="w-full h-full object-cover">
                    </div>
                    <div class="flex flex-col justify-center">
                        <h4 class="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide truncate w-32 md:w-auto">${p.titulo.substring(0, 30)}</h4>
                        <p class="text-[10px] text-slate-500 font-bold mb-1">${p.ubicacion.zona_sugerida}</p>
                        <p class="text-[10px] text-[#003DA5] dark:text-blue-400 font-black">$${p.precio.venta ? p.precio.venta.toLocaleString() : 'N/A'}</p>
                    </div>
                </div>
                
                <div class="flex flex-col gap-2 shrink-0">
                    <!-- James Edition -->
                    <div class="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                        <span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase w-20 truncate"><i class="fa-solid fa-gem mr-1 text-black dark:text-white"></i> James Ed.</span>
                        <select class="text-[8px] bg-slate-100 dark:bg-slate-700 outline-none rounded p-0.5 w-16">
                            <option value="none">Off</option>
                            <option value="office">Oficina</option>
                            <option value="region">Regional</option>
                        </select>
                    </div>
                    <!-- MercadoLibre -->
                    <div class="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                        <span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase w-20 truncate"><i class="fa-solid fa-handshake mr-1 text-yellow-500"></i> MeLi</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" class="sr-only peer">
                          <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-[#003DA5]"></div>
                        </label>
                    </div>
                    <!-- Chozi -->
                    <div class="flex items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 shadow-sm">
                        <span class="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase w-20 truncate"><i class="fa-solid fa-bolt mr-1 text-purple-500"></i> Chozi</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" value="" class="sr-only peer">
                          <div class="w-7 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-[#003DA5]"></div>
                        </label>
                    </div>
                </div>
            </div>
        `).join('');

        if (container.innerHTML === "") {
             container.innerHTML = '<p class="text-xs text-slate-500 text-center py-4">No exclusive properties found for your profile.</p>';
        }

    } catch (e) {
        container.innerHTML = '<p class="text-xs text-red-500 text-center py-4">Error loading inventory.</p>';
    }
}

