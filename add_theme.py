import os

files = [
    '/Users/alejandracastro/Desktop/NEXUS/my-desk.html',
    '/Users/alejandracastro/Desktop/NEXUS/add-search.html',
    '/Users/alejandracastro/Desktop/NEXUS/network.html',
    '/Users/alejandracastro/Desktop/NEXUS/network-profile.html',
    '/Users/alejandracastro/Desktop/NEXUS/market.html',
    '/Users/alejandracastro/Desktop/NEXUS/profile.html',
    '/Users/alejandracastro/Desktop/NEXUS/admin.html'
]

script_to_add = """    <script>
        tailwind.config = {
            darkMode: 'class',
        }
    </script>
    <script src="global-theme.js"></script>"""

toggle_html = """        <div class="flex items-center gap-3">
            <button onclick="toggleDarkMode()" class="text-slate-400 hover:text-[#003DA5] dark:hover:text-yellow-400 transition-colors text-lg px-2">
                <i class="fa-solid fa-moon dark:hidden"></i>
                <i class="fa-solid fa-sun hidden dark:inline"></i>
            </button>"""

for filepath in files:
    with open(filepath, 'r') as f:
        html = f.read()

    # 1. Add script to head
    if 'global-theme.js' not in html:
        html = html.replace('<script src="https://cdn.tailwindcss.com"></script>', '<script src="https://cdn.tailwindcss.com"></script>\n' + script_to_add)

    # 2. Add moon toggle to the nav. 
    # The nav usually ends with a div for the right-side elements. We can inject it right before `</nav>`.
    # Let's just find `</nav>` and insert a wrapper safely. 
    # Actually, a safer way is to find the last `</div>` before `</nav>` and wrap it, but regex might be tricky.
    # Instead, let's just insert the button right before `</nav>` as an absolute positioned element or just flex.
    # Wait, the nav is already `flex justify-between`. If we just append the button before `</nav>`, it will be the 3rd flex child if there are 2. 
    # It's better to just add it.
    
    if 'toggleDarkMode' not in html:
        # We will just inject it right before the last closing div of the nav if we can, 
        # or simply before `</nav>`
        html = html.replace('</nav>', '    <button onclick="toggleDarkMode()" class="text-slate-400 hover:text-[#003DA5] dark:hover:text-yellow-400 transition-colors text-lg px-4">\n        <i class="fa-solid fa-moon dark:hidden"></i>\n        <i class="fa-solid fa-sun hidden dark:inline"></i>\n    </button>\n</nav>')

    with open(filepath, 'w') as f:
        f.write(html)
print("Done adding theme toggle")
