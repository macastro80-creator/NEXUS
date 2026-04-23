import os

files = ['/Users/alejandracastro/Desktop/NEXUS/my-desk.html', '/Users/alejandracastro/Desktop/NEXUS/app.html']

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Step 1: Add ID to the OKR Reminder Notification Item
    target = """<!-- Reminder Item -->
                <div class="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-[#003DA5] shadow-sm relative group">"""
    replacement = """<!-- Reminder Item -->
                <div id="okrNotificationItem" class="bg-white dark:bg-slate-800 p-4 rounded-2xl border-l-4 border-[#003DA5] shadow-sm relative group">"""
    
    if target in content:
        content = content.replace(target, replacement)
        print(f"Added ID to {file_path}")

    # Step 2: Hide OKR prompts and notifications based on brand
    # There is a <script> block at the end of body or near DOMContentLoaded
    # Let's search for: const isAdmin = localStorage.getItem('isAdmin') === 'true';
    js_target = "const isAdmin = localStorage.getItem('isAdmin') === 'true';"
    js_replacement = js_target + """
            const profileStr = localStorage.getItem('nexusProfile');
            if (profileStr) {
                try {
                    const prof = JSON.parse(profileStr);
                    if (prof.brand && prof.brand !== 'REMAX') {
                        // Not REMAX, so hide OKR notification
                        const okrNotif = document.getElementById('okrNotificationItem');
                        if (okrNotif) okrNotif.style.display = 'none';
                    }
                } catch(e) {}
            }
"""
    if js_target in content:
        content = content.replace(js_target, js_replacement)
        print(f"Injected brand logic in {file_path}")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
