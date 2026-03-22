import os

TOP_NAV = """    <!-- PREMIUM TOP NAV -->
    <div id="premium-top-nav" class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-amber-500/30 flex justify-between items-center premium-only mt-2 mb-4 mx-4 rounded-2xl overflow-hidden shadow-2xl relative shadow-amber-500/10">
        <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <a href="Mi_Oficina.html" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group">
            <i class="fa-solid fa-building mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Office</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Oficina</span>
        </a>
        <div class="w-[1px] h-8 bg-amber-500/20 relative z-10"></div>
        <a href="REMAX_APP.html" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group">
            <i class="fa-solid fa-briefcase-medical mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Business</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Negocio</span>
        </a>
        <div class="w-[1px] h-8 bg-amber-500/20 relative z-10"></div>
        <a href="#" class="flex-1 flex flex-col items-center justify-center text-amber-500 py-3 hover:bg-white/5 transition relative z-10 group">
            <i class="fa-solid fa-book-open mb-1 text-sm group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] transition"></i>
            <span class="text-[9px] font-black uppercase tracking-widest lang-en">Resources</span>
            <span class="text-[9px] font-black uppercase tracking-widest lang-es hidden">Recursos</span>
        </a>
    </div>"""

BOTTOM_NAV = """    <!-- BOTTOM NAVIGATION -->
    <div class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t py-4 px-6 flex justify-between items-center text-slate-600 dark:text-slate-400 z-50 shadow-xl pb-6 overflow-x-auto no-scrollbar gap-4">
        <a href="index.html" data-nav="index.html" class="flex flex-col items-center justify-center min-w-[3rem] text-slate-400 hover:text-[#003DA5] transition-colors relative">
            <i class="fa-solid fa-house mb-1 text-xl hover:scale-110 transition-transform"></i>
            <span class="text-[10px] font-bold" data-i18n="navFeed">Match Board</span>
        </a>
        <a href="my-desk.html" data-nav="my-desk.html" class="flex flex-col items-center justify-center min-w-[3rem] text-slate-400 hover:text-[#003DA5] transition-colors relative">
            <i class="fa-solid fa-briefcase mb-1 text-xl hover:scale-110 transition-transform"></i>
            <span class="text-[10px] font-bold" data-i18n="navMyDesk">My Hub</span>
        </a>
        
        <!-- Premium Links -->
        <a href="market.html" data-nav="market.html" id="nav-market" class="flex flex-col items-center justify-center min-w-[3.5rem] text-amber-500 hover:text-amber-400 transition-all relative group premium-only">
            <div class="absolute inset-0 bg-amber-500/10 blur-xl rounded-full group-hover:bg-amber-500/20 transition"></div>
            <i class="fa-solid fa-chart-line mb-1 text-xl drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] group-hover:scale-110 transition-transform"></i>
            <span class="text-[10px] font-black uppercase tracking-widest lang-en">Market</span>
            <span class="text-[10px] font-black uppercase tracking-widest lang-es hidden" data-i18n="navMarket">Mercado</span>
        </a>

        <!-- Universal Link -->
        <a href="profile.html" data-nav="profile.html" class="flex flex-col items-center justify-center min-w-[3rem] text-slate-400 hover:text-[#003DA5] transition-colors relative">
            <i class="fa-solid fa-user mb-1 text-xl hover:scale-110 transition-transform"></i>
            <span class="text-[10px] font-bold" data-i18n="navProfile">Profile</span>
        </a>
    </div>
    <script>
    (function(){
        var page = location.pathname.split('/').pop() || 'index.html';
        var links = document.querySelectorAll('[data-nav]');
        links.forEach(function(a){
            if(a.getAttribute('data-nav') === page){
                a.classList.remove('text-slate-400','text-amber-500');
                a.classList.add('text-[#003DA5]');
                var dot = document.createElement('div');
                dot.className = 'absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#003DA5] rounded-full';
                a.appendChild(dot);
            }
        });
    })();
    </script>"""

def replace_block(content, marker_start, marker_inner, replace_with):
    start_idx = content.find(marker_start)
    if start_idx == -1:
        start_idx = content.find(marker_inner)
        if start_idx == -1:
            return content, False
        div_start_idx = start_idx
    else:
        div_start_idx = content.find(marker_inner, start_idx)
        if div_start_idx == -1:
            div_start_idx = start_idx

    open_divs = 0
    i = div_start_idx
    closing_idx = -1

    while i < len(content):
        if content[i:i+4] == '<div':
            open_divs += 1
            i += 4
            continue
        elif content[i:i+6] == '</div>':
            open_divs -= 1
            if open_divs == 0:
                closing_idx = i + 6
                break
            i += 6
            continue
        i += 1
    
    if closing_idx != -1:
        new_content = content[:start_idx] + replace_with + content[closing_idx:]
        return new_content, True
    return content, False


def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = False
    
    # 1. Top Nav
    new_content, c = replace_block(content, '<!-- PREMIUM TOP NAV -->', '<div id="premium-top-nav"', TOP_NAV)
    if not c:
        # try without comment
        new_content, c = replace_block(content, '<div id="premium-top-nav"', '<div id="premium-top-nav"', TOP_NAV)
    
    if c:
        changed = True
        content = new_content

    # 2. Bottom Nav
    new_content, c = replace_block(content, '<!-- BOTTOM NAVIGATION -->', '<div class="fixed bottom-0', BOTTOM_NAV)
    if not c:
        new_content, c = replace_block(content, '<div class="fixed bottom-0', '<div class="fixed bottom-0', BOTTOM_NAV)
        
    if c:
        changed = True
        content = new_content

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for f in os.listdir('/Users/alejandracastro/Desktop/NEXUS'):
    if f.endswith('.html'):
        process_file(os.path.join('/Users/alejandracastro/Desktop/NEXUS', f))
        
print("Done!")
