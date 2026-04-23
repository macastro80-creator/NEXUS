import os

files = ['/Users/alejandracastro/Desktop/NEXUS/my-desk.html', '/Users/alejandracastro/Desktop/NEXUS/app.html']

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # We want to replace the brand check logic we injected previously in DOMContentLoaded:
    old_logic = """                    const prof = JSON.parse(profileStr);
                    if (prof.brand && prof.brand !== 'REMAX') {"""
    
    new_logic = """                    const prof = JSON.parse(profileStr);
                    if ((prof.brand && prof.brand !== 'REMAX') || !isPremium) {"""
                    
    content = content.replace(old_logic, new_logic)

    # In my-desk.html, we also have openOkrPrompt which was updated to check brand:
    old_okr_prompt = """                    const prof = JSON.parse(profileStr);
                    if (prof.brand && prof.brand !== 'REMAX') return; // Hide for non-remax"""
                    
    new_okr_prompt = """                    const prof = JSON.parse(profileStr);
                    const isPremium = localStorage.getItem('isPremium') === 'true';
                    if ((prof.brand && prof.brand !== 'REMAX') || !isPremium) return; // Hide for non-remax and free tier"""

    content = content.replace(old_okr_prompt, new_okr_prompt)
    
    # We might also want to hide the OKR Tracker widget completely in my-business.html?
    # No, wait, the OKR tracker was originally restricted to a tab or page.
    # The user just asked about notifications and prompts.

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Updated my-desk.html and app.html to check for !isPremium")
