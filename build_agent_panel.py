import re

with open('/Users/alejandracastro/Desktop/NEXUS/agent-panel.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace <title>
content = re.sub(r'<title>.*?</title>', '<title>Central de Operaciones - NEXUS</title>', content)

# Change header from "My Business" to "Central"
content = re.sub(r'My Business</p>', 'Operaciones</p>', content)

# Remove the rookie modal, caida modal.
content = re.sub(r'<!-- CAIDA MODAL \(Fell Through\).*?<!-- BOTTOM NAVIGATION -->', '<!-- BOTTOM NAVIGATION -->', content, flags=re.DOTALL)
content = re.sub(r'<!-- ROOKIE CHECKLIST MODAL -->.*?<!-- SUCCESS MODAL -->', '<!-- SUCCESS MODAL -->', content, flags=re.DOTALL)

# Add Supabase Client to <head> if not exists
if '@supabase/supabase-js' not in content:
    content = content.replace('</head>', '\n    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>\n</head>')

# Re-write the MAIN DASHBOARD inner sections. 
# We keep the 'Complete OKR Today' button and the 'Airplane Progress' and the 'Plan vs Reality' tracker.
# But we replace "ACTIVE DEALS / PIPELINE", "ROOKIE CHECKLIST BUTTON", and "ACTION CHECKLIST".

def repl_main(match):
    before_deals = match.group(1)
    
    kanban_html = """
            <!-- KANBAN PIPELINE -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 mt-6 overflow-hidden">
                <style>
                    .kanban-board { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; scroll-snap-type: x mandatory; }
                    .kanban-col { min-width: 260px; max-width: 260px; flex-shrink: 0; background: rgba(248, 250, 252, 0.5); border-radius: 1rem; padding: 0.75rem; border: 1px solid #e2e8f0; scroll-snap-align: start; }
                    .dark .kanban-col { background: rgba(30, 41, 59, 0.5); border-color: #334155; }
                    .kanban-card { background: white; border-radius: 0.75rem; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #f1f5f9; margin-bottom: 0.75rem; }
                    .dark .kanban-card { background: #0f172a; border-color: #1e293b; color: white; }
                </style>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xs font-black uppercase tracking-widest text-[#003DA5] dark:text-blue-400">
                        <i class="fa-solid fa-timeline text-[#003DA5] mr-1.5"></i>
                        <span class="lang-en">Transaction Pipeline</span>
                        <span class="lang-es hidden">Ciclo de Vida</span>
                    </h3>
                    <button onclick="document.getElementById('preListingModal').classList.remove('hidden')" class="bg-gradient-to-r from-blue-600 to-[#003DA5] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm">
                        <i class="fa-solid fa-plus mr-1"></i> Pre-Listing
                    </button>
                </div>

                <div class="kanban-board custom-scrollbar" id="kanbanBoard">
                    <!-- Column: Prospección -->
                    <div class="kanban-col">
                        <h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-users text-blue-400 mr-1"></i> Prospección</span> <span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4>
                        <div id="col-prospect" class="min-h-[100px]"></div>
                    </div>
                    <!-- Column: Pre Listing -->
                    <div class="kanban-col">
                        <h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-clipboard-list text-purple-400 mr-1"></i> Pre Listing</span> <span id="count-prelisting" class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4>
                        <div id="col-prelisting" class="min-h-[100px]"></div>
                    </div>
                    <!-- Column: ACM -->
                    <div class="kanban-col">
                        <h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-calculator text-amber-400 mr-1"></i> ACM</span> <span id="count-acm" class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4>
                        <div id="col-acm" class="min-h-[100px]"></div>
                    </div>
                    <!-- Column: Exclusiva -->
                    <div class="kanban-col">
                        <h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-house-lock text-green-400 mr-1"></i> Exclusiva</span> <span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4>
                        <div id="col-exclusiva" class="min-h-[100px]"></div>
                    </div>
                    <!-- Remaining cols... -->
                    <div class="kanban-col"><h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-comments text-indigo-400 mr-1"></i> Consulta</span><span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4><div class="min-h-[100px]"></div></div>
                    <div class="kanban-col"><h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-eye text-cyan-400 mr-1"></i> Muestra</span><span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4><div class="min-h-[100px]"></div></div>
                    <div class="kanban-col"><h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-handshake text-emerald-400 mr-1"></i> Reserva</span><span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4><div class="min-h-[100px]"></div></div>
                    <div class="kanban-col"><h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-file-contract text-red-400 mr-1"></i> Venta</span><span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4><div class="min-h-[100px]"></div></div>
                    <div class="kanban-col"><h4 class="text-[10px] font-black uppercase text-slate-500 mb-3 ml-1 flex justify-between"><span><i class="fa-solid fa-reply-all text-pink-400 mr-1"></i> Follow up</span><span class="bg-slate-200 dark:bg-slate-700 px-1.5 rounded text-[8px]">0</span></h4><div class="min-h-[100px]"></div></div>
                </div>
            </div>

            <!-- PROPERTY PORTFOLIO AUTO-EXPORT -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 mt-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
                        <i class="fa-solid fa-server text-emerald-500 mr-1.5"></i>
                        <span class="lang-en">Auto-Export Portfolio</span>
                        <span class="lang-es hidden">Exportación de Cartera</span>
                    </h3>
                </div>
                
                <div id="exportPortfolioContainer" class="space-y-4">
                    <!-- Dynamic properties will load here -->
                    <p class="text-xs text-slate-500 font-medium italic text-center py-4">Cargando inventario de API...</p>
                </div>
            </div>

"""
    return before_deals + kanban_html

content = re.sub(r'(<!-- TABBED PLAN VS REALITY TRACKER -->.*?</div>\s*</div>\s*)<!-- ACTIVE DEALS / PIPELINE -->.*?(?=\s*</main>)', repl_main, content, flags=re.DOTALL)

# Inject the Pre-Listing Modal right before </main>
modal_html = """
    <!-- PRE-LISTING MODAL -->
    <div id="preListingModal" class="fixed inset-0 z-[110] bg-slate-900/80 hidden flex items-center justify-center p-4 backdrop-blur-md">
        <div class="bg-white dark:bg-slate-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onclick="document.getElementById('preListingModal').classList.add('hidden')" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full flex items-center justify-center transition z-10">
                <i class="fa-solid fa-times"></i>
            </button>
            <div class="shrink-0 mb-4 pr-10">
                <h3 class="text-lg font-black uppercase tracking-widest text-[#003DA5]">
                    <i class="fa-solid fa-clipboard-list mr-1.5"></i> <span class="lang-en">New Pre-Listing</span><span class="lang-es hidden">Nuevo Pre-Listing</span>
                </h3>
            </div>
            <form onsubmit="savePreListing(event)" class="space-y-4 overflow-y-auto custom-scrollbar pr-2 grow text-left">
                <div>
                    <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nombre de la Propiedad</label>
                    <input type="text" id="plPropName" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none mt-1">
                </div>
                <div>
                    <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nombre del Propietario</label>
                    <input type="text" id="plOwnerName" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none mt-1">
                </div>
                <div>
                    <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Teléfono / WhatsApp</label>
                    <input type="tel" id="plPhone" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none mt-1">
                </div>
                <div>
                    <label class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ubicación</label>
                    <input type="text" id="plLocation" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold outline-none mt-1">
                </div>
                <!-- Action Buttons: Save and Generate ACM -->
                <div class="flex gap-2">
                    <button type="submit" class="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest mt-2 active:scale-95 transition-transform">
                        <i class="fa-solid fa-save mr-1"></i> Guardar
                    </button>
                    <button type="button" onclick="generateACMFromPreListing()" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest mt-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-1">
                        <i class="fa-solid fa-calculator"></i> Crear ACM
                    </button>
                </div>
            </form>
        </div>
    </div>
"""
content = re.sub(r'</main>', modal_html + '\n    </main>', content)

# Remove the inline nav script that overrides dot location by mistake, there's two of them.
content = re.sub(r'<script>\s*\(function\(\)\{\s*var page = location.pathname\.split\(\'/\'\)\.pop\(\).*?</script>', '', content, flags=re.DOTALL)

with open('/Users/alejandracastro/Desktop/NEXUS/agent-panel.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done parsing and injecting layout.")
