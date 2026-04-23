import os

target_files = ['db-service.js', 'supabase-client.js']

for fname in target_files:
    if os.path.exists(fname):
        with open(fname, 'r') as f:
            content = f.read()
        
        # Replace the problematic initialization
        # Find: var supabase = window.supabaseInstance || null;
        # Replace with: window.supabase = window.supabaseInstance || null; var supabase = window.supabase;
        content = content.replace(
            "var supabase = window.supabaseInstance || null;",
            "window.supabase = window.supabaseInstance || window.supabase || null;\nvar supabase = window.supabase;"
        )
        
        with open(fname, 'w') as f:
            f.write(content)
        
        print(f"Fixed {fname}")

