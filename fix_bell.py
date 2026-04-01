import os
import re

files = ["index.html", "market.html", "my-desk.html", "profile.html", "admin.html"]

badge_html_replacement = '''<span id="notif-badge" style="display:none;" class="absolute -top-1 -right-1 min-w-[15px] h-[15px] bg-[#ED1C24] text-white text-[9px] font-black rounded-full border-2 border-white flex items-center justify-center px-[4px] shadow-sm leading-none">0</span>'''

for html_file in files:
    if not os.path.exists(html_file):
        continue
    with open(html_file, "r") as f:
        content = f.read()

    # Search for the bell icon and its nested dot
    # We'll use regex to match the bell span specifically
    content = re.sub(
        r'<span[^>]*class="[^"]*animate-pulse[^"]*"[^>]*><\/span>',
        badge_html_replacement,
        content
    )
    
    with open(html_file, "w") as f:
        f.write(content)
        
print("HTML bell icons updated!")
