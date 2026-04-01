const fs = require('fs');
let html = fs.readFileSync('app.html', 'utf8');

// 1. Fix the top nav border / sticky behavior styling to make it feel premium
html = html.replace(/<nav class="bg-white dark:bg-slate-800 border-b px-4 py-4 sticky top-0 z-50 flex justify-between items-center shadow-sm">/, 
`<nav class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 sticky top-0 z-[60] flex justify-between items-center shadow-sm transition-colors">`);

// 2. Fix the Premium Top Nav styling which looks out of place
html = html.replace(/<!-- PREMIUM TOP NAV -->[\s\S]*?<!-- NOTIFICATIONS PANEL \(Matchmaker\) -->/, 
`<!-- PREMIUM TOP NAV -->
    <div id="premium-top-nav" class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 flex justify-between items-center mt-2 mb-4 mx-4 rounded-2xl overflow-hidden shadow-2xl relative shadow-amber-500/10 z-[55]">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <a href="Mi_Oficina.html" id="nav-office" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group premium-only">
            <i class="fa-solid fa-building mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Office</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Oficina</span>
        </a>
        <div class="w-[1px] h-8 bg-amber-500/20 relative z-10"></div>
        <a href="my-business.html" id="nav-business" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group premium-only">
            <i class="fa-solid fa-briefcase-medical mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Business</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Negocio</span>
        </a>
        <div class="w-[1px] h-8 bg-amber-500/20 relative z-10"></div>
        <a href="#" id="nav-resources" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group premium-only">
            <i class="fa-solid fa-book-open mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Resources</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Recursos</span>
        </a>
    </div>

    <!-- NOTIFICATIONS PANEL (Matchmaker) -->`);

fs.writeFileSync('app.html', html, 'utf8');
