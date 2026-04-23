import re

with open('admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add User Form HTML
add_user_html = '''
        <!-- Add New Agent/User -->
        <div class="bg-white dark:bg-slate-800 p-5 rounded-[28px] border shadow-sm">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                <i class="fa-solid fa-user-plus text-green-500 mr-1"></i> <span data-i18n="addAgent">Add New User / Agent</span>
            </h3>
            <p class="text-[10px] text-slate-400 font-bold mb-3 italic">Creates a user account immediately. They should log in with "NexusUser2026!" and change their password.</p>
            <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Full Name</label>
                    <input type="text" id="newAgentName" placeholder="e.g. Juan Perez" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                </div>
                <div>
                    <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Email</label>
                    <input type="email" id="newAgentEmail" placeholder="juan@remax.com" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                </div>
                <div>
                    <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Role</label>
                    <select id="newAgentRole" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                        <option value="agent">Agent (Standard)</option>
                        <option value="remax">REMAX Agent</option>
                        <option value="broker">Broker (Office Owner)</option>
                        <option value="team_leader">Team Leader</option>
                        <option value="officeadmin">Office Admin</option>
                        <option value="mainadmin">Main Admin</option>
                    </select>
                </div>
                <div>
                    <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Assigned Office (Optional)</label>
                    <select id="newAgentOffice" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                        <option value="">-- No Office --</option>
                    </select>
                </div>
                <div class="col-span-2">
                    <label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2">Brand</label>
                    <input type="text" id="newAgentBrand" placeholder="e.g. REMAX" class="w-full p-3 border border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-[11px]">
                </div>
            </div>
            <button onclick="adminCreateNewAgent()" class="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
                <i class="fa-solid fa-plus"></i> Create User
            </button>
        </div>
'''

html = html.replace('<!-- Agent List -->', add_user_html + '\n        <!-- Agent List -->')

# Need to update offices dropdown when offices load
js_hook = '''
    // Also populate new agent office dropdown
    const naOffice = document.getElementById('newAgentOffice');
    if (naOffice) {
        naOffice.innerHTML = '<option value="">-- No Office --</option>' + offices.map(o => `<option value="${o.id}">${o.name}</option>`).join('');
    }
'''

html = html.replace("list.innerHTML = offices.map(o => `", js_hook + "\n    list.innerHTML = offices.map(o => `")

# JS function to handle the creation
js_create = '''
async function adminCreateNewAgent() {
    const name = document.getElementById('newAgentName').value.trim();
    const email = document.getElementById('newAgentEmail').value.trim();
    const role = document.getElementById('newAgentRole').value;
    const officeId = document.getElementById('newAgentOffice').value;
    const brand = document.getElementById('newAgentBrand').value.trim();
    
    if (!name || !email) {
        alert('Please fill the name and email.');
        return;
    }
    
    try {
        await adminCreateUserAdmin(email, name, role, officeId || null, brand || 'Independent');
        alert('User created successfully! They must log in with password: NexusUser2026!');
        await loadAgents();
        document.getElementById('newAgentName').value = '';
        document.getElementById('newAgentEmail').value = '';
        document.getElementById('newAgentBrand').value = '';
    } catch(err) {
        alert('Error creating user: ' + err.message);
    }
}
'''

html = html.replace('// ===== LOCATIONS =====', js_create + '\n// ===== LOCATIONS =====')

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated admin.html successfully to add user creation form.")
