import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # The block might be inside a <script> tag.
    # We want to remove the block that starts with // PHASE 1 LAUNCH LOCK
    # and ends with alert(...); }); } });
    
    # Let's match from // PHASE 1 LAUNCH LOCK to the end of the script block that it sits in, OR just the launchLockedElements block
    # A safer approach:
    new_content = re.sub(r'// PHASE 1 LAUNCH LOCK[^<]*?\}\s*\);\s*\}\s*\);\s*', '', content, flags=re.DOTALL)
    
    # Just in case there are multiple variants:
    new_content = re.sub(r'// PHASE 1 LAUNCH LOCK \(Hardcoded for ALL users\)[\s\S]*?\}\);\s*\}\);\s*', '', new_content, flags=re.DOTALL)
    new_content = re.sub(r'// PHASE 1 LAUNCH LOCK[\s\S]*?\}\);\s*\}\);\s*', '', new_content, flags=re.DOTALL)
    
    if new_content != content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Cleaned {file}")

