import glob

target_code = """                premiumElements.forEach(el => {
                    if (el && el.tagName === 'A') {
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            alert(currentLang === 'es' ? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top.' : '💎 This is a Premium feature! Upgrade your account to access incredible Top-Producer tools.');
                        });
                    }
                });"""

replacement_code = """                premiumElements.forEach(el => {
                    if (el && el.tagName === 'A') {
                        // Add visual lock for standard users
                        el.classList.add('grayscale', 'opacity-60');
                        el.classList.remove('hover:bg-white/5', 'hover:text-amber-400');
                        // Inject padlock icon
                        el.insertAdjacentHTML('beforeend', '<div class="absolute top-1 right-1 lg:top-2 lg:right-2 bg-slate-900 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-20"><i class="fa-solid fa-lock text-[9px] text-slate-400"></i></div>');

                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            alert(currentLang === 'es' ? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top.' : '💎 This is a Premium feature! Upgrade your account to access incredible Top-Producer tools.');
                        });
                    }
                });"""

for filepath in glob.glob("*.html"):
    with open(filepath, "r") as f:
        content = f.read()
    
    if target_code in content:
        content = content.replace(target_code, replacement_code)
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Snippet not exact match in {filepath}")

