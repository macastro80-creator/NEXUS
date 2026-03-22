import re
import os

files = [
    '/Users/alejandracastro/Desktop/NEXUS/index.html',
    '/Users/alejandracastro/Desktop/NEXUS/my-desk.html',
    '/Users/alejandracastro/Desktop/NEXUS/add-search.html',
    '/Users/alejandracastro/Desktop/NEXUS/network.html',
    '/Users/alejandracastro/Desktop/NEXUS/network-profile.html',
    '/Users/alejandracastro/Desktop/NEXUS/market.html',
    '/Users/alejandracastro/Desktop/NEXUS/profile.html',
    '/Users/alejandracastro/Desktop/NEXUS/admin.html'
]

# We need to add the tailwind config and global-theme.js to the head of all these files too if they don't have it.
# For now just handle the classes.

mappings = {
    'bg-slate-50': 'bg-slate-50 dark:bg-slate-900',
    'bg-white': 'bg-white dark:bg-slate-800',
    'bg-slate-100': 'bg-slate-100 dark:bg-slate-700',
    'bg-slate-200': 'bg-slate-200 dark:bg-slate-600',
    'text-slate-900': 'text-slate-900 dark:text-slate-100',
    'text-slate-800': 'text-slate-800 dark:text-slate-200',
    'text-slate-700': 'text-slate-700 dark:text-slate-300',
    'text-slate-600': 'text-slate-600 dark:text-slate-400',
    'border-slate-100': 'border-slate-100 dark:border-slate-700',
    'border-slate-200': 'border-slate-200 dark:border-slate-600',
    'border-slate-300': 'border-slate-300 dark:border-slate-500',
}

def replace_classes(match):
    class_str = match.group(1)
    tokens = class_str.split()
    new_tokens = []
    for t in tokens:
        # Check if this token should be mapped
        if t in mappings:
            # Only map if the dark variant is not already in the tokens
            dark_variant = mappings[t].split()[1]
            if dark_variant not in tokens and dark_variant not in new_tokens:
                new_tokens.extend(mappings[t].split())
            else:
                new_tokens.append(t)
        else:
            new_tokens.append(t)
            
    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for nt in new_tokens:
        if nt not in seen:
            seen.add(nt)
            deduped.append(nt)
            
    return 'class="' + ' '.join(deduped) + '"'

for filepath in files:
    if os.path.exists(filepath):
        print(f"Processing {filepath}")
        with open(filepath, 'r') as f:
            html = f.read()

        new_html = re.sub(r'class="([^"]*)"', replace_classes, html)

        with open(filepath, 'w') as f:
            f.write(new_html)
    else:
        print(f"File not found: {filepath}")

print("Done class mapping")
