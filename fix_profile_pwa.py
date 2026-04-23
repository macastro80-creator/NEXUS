import os

file_path = '/Users/alejandracastro/Desktop/NEXUS/profile.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Insert the HTML Section before the HELP & SUPPORT SECTION
target_html = "<!-- HELP & SUPPORT SECTION -->"
pwa_html = """<!-- PWA INSTALL APP SECTION -->
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

    <!-- HELP & SUPPORT SECTION -->"""

content = content.replace(target_html, pwa_html)

# 2. Insert the Javascript logic before the final script ends, right before </script>\n</body>
target_js = """    </script>
</body>"""
pwa_js = """
        // --- PWA INSTALL LOGIC ---
        let deferredPrompt;
        const pwaInstallSection = document.getElementById('pwaInstallSection');
        const installAppBtn = document.getElementById('installAppBtn');

        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            deferredPrompt = e;
            // Update UI notify the user they can install the PWA
            if(pwaInstallSection) {
                pwaInstallSection.style.display = 'block';
            }
        });

        if(installAppBtn) {
            installAppBtn.addEventListener('click', async () => {
                // Hide the app provided install promotion
                pwaInstallSection.style.display = 'none';
                if (!deferredPrompt) return;
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                // We've used the prompt, and can't use it again, throw it away
                deferredPrompt = null;
            });
        }
        
        window.addEventListener('appinstalled', () => {
            // Hide the app-provided install promotion
            if(pwaInstallSection) pwaInstallSection.style.display = 'none';
            deferredPrompt = null;
            console.log('PWA is installed');
        });
    </script>
</body>"""

# need to make sure we replace the LAST occurrence of `</script>\n</body>`
# So we reverse, replace once, and reverse back. Or just use rfind
def rreplace(s, old, new, occurrence):
    li = s.rsplit(old, occurrence)
    return new.join(li)

content = rreplace(content, target_js, pwa_js, 1)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Update successful.')
