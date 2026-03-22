import glob
import re

replacement_block = """                premiumElements.forEach(el => {
                    if (el && el.tagName === 'A') {
                        // Apply visual lock
                        el.classList.add('grayscale', 'opacity-60');
                        el.insertAdjacentHTML('beforeend', '<div class="absolute top-1 right-1 lg:top-2 lg:right-2 bg-slate-900 border border-slate-700 rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"><i class="fa-solid fa-lock text-[8px] text-slate-400"></i></div>');

                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            alert(currentLang === 'es' ? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top.' : '💎 This is a Premium feature! Upgrade your account to access incredible Top-Producer tools.');
                        });
                    }
                });"""

for filepath in glob.glob("*.html"):
    with open(filepath, "r") as f:
        content = f.read()
    
    # Regex to find the exact block since indentation might vary
    pattern = r"premiumElements\.forEach\(el => \{.*?\n.*?if \(el && el\.tagName === 'A'\) \{.*?\n.*?el\.addEventListener\('click', \(e\) => \{.*?\n.*?e\.preventDefault\(\);.*?\n.*?alert\(currentLang === 'es' \? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top\.' : '💎 This is a Premium feature! Upgrade tu cuenta para acceder a increíbles herramientas de Productores Top\.'\);.*?\n.*?\}\);.*?\n.*?\}\n.*?\}\);"
    
    # A simpler way is to just replace the premiumElements.forEach loop lines using string substitution
    if "premiumElements.forEach(el =>" in content:
        # Find the start index
        start_idx = content.find("premiumElements.forEach(el => {")
        if start_idx != -1:
            end_idx = content.find("});\n            }\n        });", start_idx) + 4
            
            # replace the block
            new_content = content[:start_idx] + replacement_block + content[end_idx:]
            
            with open(filepath, "w") as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
             print(f"Start index missing in {filepath}")

