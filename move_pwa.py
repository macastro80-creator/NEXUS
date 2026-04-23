import os

file_path = '/Users/alejandracastro/Desktop/NEXUS/profile.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The exact block to move
pwa_block = """    <!-- PWA INSTALL APP SECTION -->
    <section class="max-w-lg mx-auto p-4 mb-4 border-t border-slate-200 dark:border-slate-700" id="pwaInstallSection" style="display: none;">
        <div class="bg-blue-50 dark:bg-slate-800 p-6 rounded-[32px] border border-blue-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 z-10">
                <i class="fa-solid fa-download text-xl"></i>
            </div>
            <h3 class="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest mb-1 z-10 lang-en">Install Desktop/Mobile App</h3>
            <h3 class="text-xs font-black text-blue-900 dark:text-blue-100 uppercase tracking-widest mb-1 z-10 lang-es hidden">Instalar App Móvil / PC</h3>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-4 z-10 lang-en">Click below to install NEXUS to your home screen for a faster native experience.</p>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-4 z-10 lang-es hidden">Instala NEXUS en tu escritorio/inicio para una experiencia nativa y más rápida.</p>
            
            <button id="installAppBtn" type="button" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg transition-transform active:scale-95 flex items-center gap-2 z-10">
                <i class="fa-solid fa-mobile-screen"></i>
                <span class="lang-en">Save to Device</span>
                <span class="lang-es hidden">Guardar en mi equipo</span>
            </button>
        </div>
    </section>
"""

# Let's cleanly remove it (taking into account any trailing whitespace differences if necessary)
# Instead of hardcoded replace, we can rely on the fact that we injected it exactly like this.
# but let's just make it slightly flexible if trailing newlines exist
if pwa_block in content:
    content = content.replace(pwa_block, "")
    print("Found and removed original block.")
else:
    # Try finding just by lines just in case
    import re
    pwa_pattern = re.compile(r'    <!-- PWA INSTALL APP SECTION -->.*?</section>\n', re.DOTALL)
    if pwa_pattern.search(content):
        content = pwa_pattern.sub('', content)
        print("Found and removed original block using regex.")
    else:
        print("COULD NOT FIND BLOCK TO REMOVE!")

# Now we insert it right after the PREMIUM TOP NAV closes (around line 104) and before <form
target_insert = '    <form class="p-4 space-y-6 max-w-lg mx-auto">'

if target_insert in content:
    content = content.replace(target_insert, pwa_block + '\n' + target_insert)
    print("Successfully inserted block higher up.")
else:
    print("COULD NOT FIND TARGET TO INSERT!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
