import re

with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Tabs
html = html.replace(
    '''<button onclick="switchTab('locations')" id="tabLocations" class="tab-btn flex-1 py-3 rounded-lg transition-all text-slate-500">
                <i class="fa-solid fa-map mr-1"></i> <span data-i18n="tabLocations">Locations</span>
            </button>''',
    '''<button onclick="switchTab('locations')" id="tabLocations" class="tab-btn flex-1 py-3 rounded-lg transition-all text-slate-500">
                <i class="fa-solid fa-map mr-1"></i> <span data-i18n="tabLocations">Locations</span>
            </button>
            <button onclick="switchTab('requests')" id="tabRequests" class="tab-btn flex-1 py-3 rounded-lg transition-all text-slate-500">
                <i class="fa-solid fa-briefcase mr-1"></i> <span data-i18n="tabRequests">Requests</span>
            </button>'''
)

# 2. Update switchTab function
html = html.replace(
    "['tickets','offices','agents','locations', 'searches']",
    "['tickets','offices','agents','locations','searches','requests']"
)

# 3. Add Requests Section HTML
requests_html = '''
    <!-- ====== REQUESTS SECTION ====== -->
    <div id="sectionRequests" class="max-w-2xl mx-auto p-4 space-y-4 animate-fade hidden">
        <div class="flex justify-between items-center">
            <h2 class="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest italic">
                <i class="fa-solid fa-briefcase text-[#003DA5] mr-1"></i> <span data-i18n="planRequests">Plan Requests</span>
            </h2>
        </div>
        <div id="requestsListAdmin" class="space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar"></div>
    </div>
'''
html = html.replace('<!-- ====== AGENTS SECTION ====== -->', requests_html + '\n    <!-- ====== AGENTS SECTION ====== -->')

# 4. Add JS for Requests
js_requests = '''
let adminPlanRequests = [];
async function loadPlanRequests() {
    if (isSupabaseConfigured() && supabase) {
        try {
            adminPlanRequests = await getAllPlanRequests();
            renderPlanRequests();
        } catch(e) { console.warn('Could not load plan requests:', e); }
    }
}
function renderPlanRequests() {
    const list = document.getElementById('requestsListAdmin');
    if (!adminPlanRequests || adminPlanRequests.length === 0) {
        list.innerHTML = '<p class="text-xs text-center font-bold text-slate-400 py-4">No plan requests found.</p>';
        return;
    }
    const statusColors = {
        'new': 'bg-blue-100 text-blue-700',
        'contacted': 'bg-amber-100 text-amber-700',
        'closed_won': 'bg-green-100 text-green-700',
        'closed_lost': 'bg-red-100 text-red-700'
    };
    list.innerHTML = adminPlanRequests.map(r => `
        <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border shadow-sm transition-all hover:border-[#003DA5]">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="text-[12px] font-black text-slate-900 dark:text-white">${r.contact_name}</h3>
                    <p class="text-[9px] font-bold text-slate-400"><i class="fa-solid fa-envelope mr-1"></i>${r.contact_email}</p>
                </div>
                <div class="text-right">
                    <span class="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${statusColors[r.status] || 'bg-slate-100 text-slate-500'}">${r.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                <div><p class="text-[7px] text-slate-400 uppercase font-black">Plan</p><p class="text-[10px] font-bold text-[#003DA5]">${r.desired_service.toUpperCase()}</p></div>
                <div><p class="text-[7px] text-slate-400 uppercase font-black">Agents</p><p class="text-[10px] font-bold">${r.agent_count}</p></div>
                <div><p class="text-[7px] text-slate-400 uppercase font-black">Location</p><p class="text-[10px] font-bold truncate">${r.zone || r.country}</p></div>
            </div>
            <div class="flex justify-end gap-2 mt-2">
                <button onclick="adminUpdatePlanReq('${r.id}', 'contacted')" class="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-black uppercase hover:bg-amber-100 active:scale-95 transition">Mark Contacted</button>
                <button onclick="adminUpdatePlanReq('${r.id}', 'closed_won')" class="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase hover:bg-green-100 active:scale-95 transition">Closed Won</button>
                <button onclick="adminUpdatePlanReq('${r.id}', 'closed_lost')" class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[9px] font-black uppercase hover:bg-red-100 active:scale-95 transition">Lost</button>
            </div>
        </div>
    `).join('');
}
async function adminUpdatePlanReq(id, status) {
    if(!confirm(`Mark this as ${status}?`)) return;
    try {
        await updatePlanRequestStatus(id, status);
        adminPlanRequests = adminPlanRequests.map(r => String(r.id)===String(id) ? {...r, status} : r);
        renderPlanRequests();
    } catch(err) { alert('Error: ' + err.message); }
}

'''
html = html.replace('// ===== SEARCHES ADMIN =====', js_requests + '\n// ===== SEARCHES ADMIN =====')

# 5. Add loadPlanRequests to initAll
html = html.replace('async function initAll() { await loadTickets(); await loadOffices(); await loadAgents(); loadLocationTree(); await updateDashboardKPIs(); await loadAdminSearches(); }',
                    'async function initAll() { await loadTickets(); await loadOffices(); await loadAgents(); loadLocationTree(); await updateDashboardKPIs(); await loadAdminSearches(); await loadPlanRequests(); }')

# 6. Update KPIs to show Volume/Sales
kpi_html_old = '''<div class="grid grid-cols-4 gap-2 mb-4">
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiOffices" class="text-xl font-black text-[#003DA5]">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest"><span data-i18n="kpiOffices">Offices</span></p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiTeams" class="text-xl font-black text-purple-600">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest"><span data-i18n="kpiTeams">Teams</span></p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiRemax" class="text-xl font-black text-[#ED1C24]">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest"><span data-i18n="kpiRemax">REMAX</span></p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiExternal" class="text-xl font-black text-green-600">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest"><span data-i18n="kpiExternal">External</span></p>
            </div>
        </div>'''
kpi_html_new = '''<div class="grid grid-cols-5 gap-2 mb-4">
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border border-[#003DA5]/20 shadow-sm col-span-2 overflow-hidden relative">
                <div class="absolute -right-4 -bottom-4 w-16 h-16 bg-[#003DA5] opacity-5 rounded-full"></div>
                <p id="kpiVolume" class="text-[17px] font-black text-[#003DA5]">$0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest">Global YTD Vol</p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiOffices" class="text-xl font-black text-[#003DA5]">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest overflow-hidden text-ellipsis"><span data-i18n="kpiOffices">Offices</span></p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiRemax" class="text-xl font-black text-[#ED1C24]">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest overflow-hidden text-ellipsis"><span data-i18n="kpiRemax">REMAX</span></p>
            </div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl border text-center shadow-sm">
                <p id="kpiExternal" class="text-xl font-black text-slate-600">0</p>
                <p class="text-[7px] font-black text-slate-400 uppercase tracking-widest overflow-hidden text-ellipsis"><span data-i18n="kpiExternal">External</span></p>
            </div>
        </div>'''
html = html.replace(kpi_html_old, kpi_html_new)
html = html.replace("document.getElementById('kpiOffices').textContent = kpis.totalOffices;", "document.getElementById('kpiOffices').textContent = kpis.totalOffices; if(document.getElementById('kpiVolume')) document.getElementById('kpiVolume').textContent = '$'+(kpis.totalVolume || 0).toLocaleString();")

# 7. Add Agent Edit UI/Modal
agent_modal_html = '''
<!-- Edit Agent Modal -->
<div id="editAgentModal" class="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4 hidden">
    <div class="bg-white dark:bg-slate-800 w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700 animate-fade">
        <button onclick="document.getElementById('editAgentModal').classList.add('hidden')" class="absolute top-4 right-4 text-slate-400 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 hover:text-red-500 transition-colors"><i class="fa-solid fa-xmark"></i></button>
        <h3 class="font-black text-sm uppercase tracking-widest italic mb-4 text-[#003DA5]"><i class="fa-solid fa-user-pen mr-1"></i> Edit User Role</h3>
        
        <input type="hidden" id="editAgentId">
        
        <div class="space-y-4">
            <div>
                <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Role</label>
                <select id="editAgentRole" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                    <option value="agent">Agent (Standard)</option>
                    <option value="remax">REMAX Agent</option>
                    <option value="broker">Broker (Office Owner)</option>
                    <option value="team_leader">Team Leader</option>
                    <option value="officeadmin">Office Admin</option>
                    <option value="regional_director">Regional Director</option>
                    <option value="mainadmin">Main Admin (Super)</option>
                </select>
            </div>
            <div>
                <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Assigned Office</label>
                <select id="editAgentOffice" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                    <option value="">-- No Office --</option>
                </select>
            </div>
            <button onclick="saveAgentEdit()" class="w-full bg-[#003DA5] text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-4">
                <i class="fa-solid fa-save"></i> Save Changes
            </button>
        </div>
    </div>
</div>
'''
html = html.replace('</body>', agent_modal_html + '\n</body>')

# 8. Add JS for modal
js_edit = '''
function openEditAgentModal(id, currentRole, currentOfficeId) {
    document.getElementById('editAgentId').value = id;
    document.getElementById('editAgentRole').value = currentRole || 'agent';
    
    // Populate offices dropdown
    const officeSelect = document.getElementById('editAgentOffice');
    officeSelect.innerHTML = '<option value="">-- No Office --</option>' + 
        offices.map(o => `<option value="${o.id}">${o.name} (${o.brand})</option>`).join('');
    
    if (currentOfficeId) {
        officeSelect.value = currentOfficeId;
    }
    document.getElementById('editAgentModal').classList.remove('hidden');
}

async function saveAgentEdit() {
    const id = document.getElementById('editAgentId').value;
    const role = document.getElementById('editAgentRole').value;
    const officeId = document.getElementById('editAgentOffice').value;
    
    try {
        await updateUserAdmin(id, role, officeId || null);
        document.getElementById('editAgentModal').classList.add('hidden');
        alert('User updated successfully');
        await loadAgents();
    } catch(e) {
        alert('Failed to update: ' + e.message);
    }
}
'''
html = html.replace('// ===== LOCATIONS =====', js_edit + '\n// ===== LOCATIONS =====')

# 9. Update Agent Render to include Edit button
html = html.replace(
'''<div class="flex gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                    <button onclick="adminDeleteAgent('${a.id}')" class="w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete Permanent"><i class="fa-solid fa-trash text-[10px]"></i></button>''',
'''<div class="flex gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
                    <button onclick="openEditAgentModal('${a.id}', '${a.role}', '${a.office_id || ''}')" class="w-7 h-7 bg-[#003DA5]/10 text-[#003DA5] dark:text-blue-400 rounded-lg hover:bg-[#003DA5]/20 transition-colors" title="Edit Role/Office"><i class="fa-solid fa-pen text-[10px]"></i></button>
                    <button onclick="adminDeleteAgent('${a.id}')" class="w-7 h-7 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Delete Permanent"><i class="fa-solid fa-trash text-[10px]"></i></button>'''
)

html = html.replace("joined: a.created_at?.substring(0,7) || '2024-01'", "joined: a.created_at?.substring(0,7) || '2024-01', office_id: a.office_id")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin.html successfully via python.")
