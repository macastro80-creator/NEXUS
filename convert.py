import re
import os

filepath = '/Users/alejandracastro/Desktop/NEXUS/index.html'
with open(filepath, 'r') as f:
    html = f.read()

# I need to match classes inside class="..."
# Then inside those quotes, replace specific tokens

mappings = {
    'bg-slate-900': 'bg-slate-50 dark:bg-slate-900',
    'bg-slate-800': 'bg-white dark:bg-slate-800',
    'bg-slate-700': 'bg-slate-100 dark:bg-slate-700',
    'bg-slate-600': 'bg-slate-200 dark:bg-slate-600',
    'text-slate-100': 'text-slate-900 dark:text-slate-100',
    'text-slate-200': 'text-slate-800 dark:text-slate-200',
    'text-slate-300': 'text-slate-700 dark:text-slate-300',
    'text-slate-400': 'text-slate-600 dark:text-slate-400',
    'border-slate-700': 'border-slate-100 dark:border-slate-700',
    'border-slate-600': 'border-slate-200 dark:border-slate-600',
    'border-slate-500': 'border-slate-300 dark:border-slate-500',
}

def replace_classes(match):
    class_str = match.group(1)
    tokens = class_str.split()
    new_tokens = []
    for t in tokens:
        # Check if t is exactly one of the keys
        if t in mappings:
            new_tokens.append(mappings[t])
        else:
            new_tokens.append(t)
    return 'class="' + ' '.join(new_tokens) + '"'

# The regex matches class="[^"]*"
new_html = re.sub(r'class="([^"]*)"', replace_classes, html)

with open(filepath, 'w') as f:
    f.write(new_html)

print("Done")
