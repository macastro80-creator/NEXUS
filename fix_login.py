import re

with open('login.html', 'r') as f:
    content = f.read()

# Replace `supabase.auth` with `window.supabase.auth` to be 100% explicit
content = re.sub(r'(\s+)await supabase\.auth\.', r'\1await window.supabase.auth.', content)

with open('login.html', 'w') as f:
    f.write(content)

print("Fixed login.html")
