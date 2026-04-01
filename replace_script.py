import os

def replace_in_file(filepath):
    try:
        with open(filepath, 'r+', encoding='utf-8') as f:
            content = f.read()
            if 'index.html' in content:
                new_content = content.replace('index.html', 'app.html')
                f.seek(0)
                f.write(new_content)
                f.truncate()
                print(f"Updated {filepath}")
    except Exception as e:
        print(f"Skipping {filepath} due to error: {e}")

for root, dirs, files in os.walk('.'):
    # Skip node_modules and hidden folders
    if 'node_modules' in root or '.git' in root or '.vercel' in root or '_bmad' in root:
        continue
    for file in files:
        if file.endswith('.html') or file.endswith('.js'):
            if file == 'replace_script.py':  # skip self
                continue
            replace_in_file(os.path.join(root, file))
