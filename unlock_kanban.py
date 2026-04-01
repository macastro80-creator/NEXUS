import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to match id="nav-business" or href="my-business.html" where it has "premium-only"
    # We want to replace 'premium-only' with '' in the same tag.
    
    # Simple search and replace for lines containing my-business or nav-business
    new_lines = []
    changed = False
    for line in content.splitlines():
        if ('nav-business' in line or 'my-business.html' in line) and 'premium-only' in line:
            new_line = line.replace('premium-only', '')
            new_lines.append(new_line)
            changed = True
        else:
            new_lines.append(line)
            
    if changed:
        new_content = '\n'.join(new_lines)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Unlocked Kanban in {file}")
