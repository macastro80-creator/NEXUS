const fs = require('fs');
let html = fs.readFileSync('market.html', 'utf8');

// The Market page has a bug where the 'Premium Top Nav' overlaps with the sticky navbar due to z-index.
html = html.replace(/<nav class="bg-white dark:bg-slate-800 border-b sticky top-0 z-50 px-4 py-4 shadow-sm">/,
`<nav class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[60] px-4 py-4 shadow-sm transition-colors">`);

html = html.replace(/<!-- PREMIUM TOP NAV -->[\s\S]*?<!-- PREMIUM OVERLAY -->/,
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

    <div class="p-4 space-y-6 max-w-lg mx-auto">
        
        <div class="grid grid-cols-1 gap-4">
            <section class="gradient-blue rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                <i class="fa-solid fa-handshake absolute -bottom-4 -right-4 text-white/10 text-8xl"></i>
                <h2 class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 lang-en">Closed via NEXUS</h2>
                <h2 class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 lang-es hidden">Cerrado vía NEXUS</h2>
                <div class="text-4xl font-black mb-1">$4,850,000</div>
                <p class="text-[10px] font-bold uppercase opacity-80">14 Verified Collaborations</p>
            </section>

            <section class="gradient-amber rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden">
                <i class="fa-solid fa-file-signature absolute -bottom-4 -right-4 text-white/10 text-8xl"></i>
                <h2 class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 lang-en">Active Pipeline</h2>
                <h2 class="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 lang-es hidden">En Negociación</h2>
                <div class="text-4xl font-black mb-1">$2,120,000</div>
                <p class="text-[10px] font-bold uppercase opacity-80">6 Deals Pending Closing</p>
            </section>
        </div>

        <section class="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
            <!-- PREMIUM OVERLAY -->`);

// Fix profile alert bug in premium lockout logic
html = html.replace(/alert\(currentLang === 'es' \? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top\.' : '💎 This is a Premium feature! Upgrade tu cuenta para acceder a increíbles herramientas de Productores Top\.'\);/,
`

fs.writeFileSync('market.html', html, 'utf8');
