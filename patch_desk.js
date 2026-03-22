const fs = require('fs');
let html = fs.readFileSync('my-desk.html', 'utf8');

// 1. Top nav styling
html = html.replace(/<nav class="bg-white dark:bg-slate-800 border-b px-4 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">/, 
`<nav class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sticky top-0 z-[60] flex items-center justify-between shadow-sm transition-colors">`);

// 2. Add an empty state to the Buyer Tab
// the Buyer Tab content starts at <div id="buyerTabContent" class="space-y-4 animate-fade"> (or similar)
html = html.replace(/<!-- New Dummy Buyer Card -->/, 
`<!-- EMPTY STATE (Hidden by default, shown if no searches) -->
            <div id="buyerEmptyState" class="hidden flex flex-col items-center justify-center py-12 text-center animate-fade">
                <div class="w-24 h-24 mb-6 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-300 dark:text-slate-600">
                    <i class="fa-solid fa-folder-open text-4xl"></i>
                </div>
                <h3 class="font-black text-lg text-slate-800 dark:text-slate-200 mb-2 lang-en">No Active Searches</h3>
                <h3 class="font-black text-lg text-slate-800 dark:text-slate-200 mb-2 lang-es hidden">Sin Búsquedas Activas</h3>
                <p class="text-xs text-slate-500 font-bold max-w-xs mb-6 lang-en">You don't have any active buyer profiles. Create one to start receiving matches!</p>
                <p class="text-xs text-slate-500 font-bold max-w-xs mb-6 lang-es hidden">No tienes perfiles de comprador. ¡Crea uno para recibir matches!</p>
                <a href="add-search.html" class="bg-[#003DA5] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase shadow-lg hover:shadow-xl transition-shadow">
                    <i class="fa-solid fa-plus mr-2"></i> <span class="lang-en">New Search</span><span class="lang-es hidden">Nueva Búsqueda</span>
                </a>
            </div>

            <!-- New Dummy Buyer Card -->`);

// 3. Improve the slider interaction panel. Currently it's a bit rigid.
html = html.replace(/<div id="inboxPanel" class="fixed top-0 right-0 w-80 sm:w-96 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl property-inbox flex flex-col overflow-hidden">/,
`<div id="inboxPanel" class="fixed top-0 right-0 w-full sm:w-96 h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-2xl property-inbox flex flex-col overflow-hidden transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)">`);

html = html.replace(/<div class="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50 dark:bg-slate-900\/50">/,
`<div class="p-6 overflow-y-auto flex-1 space-y-6 bg-transparent">`);

html = html.replace(/<button onclick="closeInbox\(\)" class="w-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 py-4 rounded-2xl font-black uppercase text-\[10px\] shadow-sm mt-6 active:scale-95 transition">/,
`<button onclick="closeInbox()" class="w-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 py-4 rounded-2xl font-black uppercase text-[10px] shadow-sm mt-6 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition-all">`);

fs.writeFileSync('my-desk.html', html, 'utf8');
