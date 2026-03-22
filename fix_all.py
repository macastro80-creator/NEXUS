import glob
import re

replacement_block = """                premiumElements.forEach(el => {
                    if (el && el.tagName === 'A') {
                        // Apply visual lock
                        el.classList.add('grayscale', 'opacity-60', 'relative');
                        el.insertAdjacentHTML('beforeend', '<div class="absolute top-1 right-1 lg:top-2 lg:right-2 bg-slate-900 border border-slate-700 rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"><i class="fa-solid fa-lock text-[8px] text-slate-400"></i></div>');

                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            alert(currentLang === 'es' ? '💎 ¡Esta es una función Premium! Actualiza tu cuenta para acceder a increíbles herramientas de Productores Top.' : '💎 This is a Premium feature! Upgrade tu cuenta para acceder a increíbles herramientas de Productores Top.');
                        });
                    }
                });"""

for filepath in glob.glob("*.html"):
    with open(filepath, "r") as f:
        content = f.read()

    # Let's fix the pointer-events-none first
    content = content.replace(" pointer-events-none", "")

    # Now let's accurately replace the JS block using Regex to avoid spacing issues
    # We want to replace from 'premiumElements.forEach(el => {' to the matching '});'
    # Since it's a known block, regex `premiumElements\.forEach.*?\n.*?\n.*?\n.*?\n.*?\n.*?\n.*?\}\);` might work, or simpler: find index of `premiumElements.forEach(el => {` and index of `alert(` and next `});`
    
    start_str = "premiumElements.forEach(el => {"
    end_str = "                });"

    # Some files might have `                 premiumElements.forEach` (extra space)
    idx_start = content.find(start_str)
    if idx_start == -1:
        # Try finding with any whitespace
        match = re.search(r"^[ \t]*premiumElements\.forEach\(el => \{", content, re.MULTILINE)
        if match:
            idx_start = match.start()

    if idx_start != -1:
        # Find next "});" that aligns with the end
        idx_end = content.find("});", idx_start)
        # It's actually nested `el.addEventListener...});` then `if...}` then `});`
        # Let's just use the fact that it ends with `                });`
        match_end = re.search(r"^[ \t]*\}\);", content[idx_start:], re.MULTILINE)
        if match_end:
            # We found the first `});` which closes `addEventListener`
            # The second `});` closes `forEach`.
            # Let's just find `alert(` and then the next `});` then the next `});`
            idx_alert = content.find("alert(", idx_start)
            idx_first_close = content.find("});", idx_alert)
            idx_second_close = content.find("});", idx_first_close + 3)
            
            if idx_second_close != -1:
                final_end = idx_second_close + 3
                new_content = content[:idx_start] + replacement_block + content[final_end:]
                with open(filepath, "w") as f:
                    f.write(new_content)
                print(f"Updated JS in {filepath}")
            else:
                print(f"Could not find end of block in {filepath}")
        else:
            print(f"Could not find any close in {filepath}")
    else:
        print(f"Start string not found in {filepath}")

