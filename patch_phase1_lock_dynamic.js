const fs = require('fs');

const files = ['index.html', 'my-desk.html', 'market.html', 'profile.html', 'add-search.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Currently the script we injected starts with "// PHASE 1 LAUNCH LOCK"
    // Let's replace the block with dynamic email checking
    const newLockScript = `// PHASE 1 LAUNCH LOCK (Dynamic by Email)
            const userEmail = localStorage.getItem('userEmail') || '';
            const isAltitudStaff = userEmail.endsWith('@remax-altitud.cr');

            // Only lock if NOT Altitud Staff
            if (!isAltitudStaff) {
                const launchLockedElements = [
                    document.getElementById('nav-market'),
                    document.getElementById('nav-office'),
                    document.getElementById('nav-business'),
                    document.getElementById('nav-resources'),
                    ...Array.from(document.querySelectorAll('.premium-only')),
                    ...Array.from(document.querySelectorAll('a[href="office.html"]')),
                    ...Array.from(document.querySelectorAll('a[href="my-business.html"]')),
                    ...Array.from(document.querySelectorAll('a[href="resources.html"]')),
                    ...Array.from(document.querySelectorAll('a[href="market.html"]'))
                ];
                
                // Remove nulls and apply locks
                launchLockedElements.filter(Boolean).forEach(el => {
                    if (el && el.tagName === 'A' || el.tagName === 'BUTTON' || el.tagName === 'DIV' && el.getAttribute('onclick')) {
                        // Apply visual lock
                        el.classList.add('grayscale', 'opacity-60', 'relative');
                        
                        // Don't add duplicate lock icons if it already has one
                        if (!el.innerHTML.includes('fa-lock')) {
                            el.insertAdjacentHTML('beforeend', '<div class="absolute top-1 right-1 lg:top-2 lg:right-2 bg-slate-900 border border-[#003DA5] rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"><i class="fa-solid fa-lock text-[8px] text-white"></i></div>');
                        }

                        // Remove existing hrefs or onclicks
                        if (el.tagName === 'A') el.removeAttribute('href');
                        if (el.hasAttribute('onclick')) el.removeAttribute('onclick');

                        // Add new click listener
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Get language
                            const lang = localStorage.getItem('nexusLang') || 'en';
                            alert(lang === 'es' ? '🚀 ¡Próximamente en la Fase 2!' : '🚀 Coming Soon in Phase 2!');
                        });
                    }
                });
            }`;

    html = html.replace(/\/\/ PHASE 1 LAUNCH LOCK[\s\S]*?\}\);\s*\}\);/, newLockScript);

    // In profile.html, we hardcoded href="#" in the previous step. We should restore them if possible, or script it.
    // Actually, if we hardcoded href="#", it's permanently broken even if the lock script doesn't run.
    if(file === 'profile.html') {
        // Let's restore the hrefs safely based on classes
        html = html.replace(/<a href="#" class="([^"]*)premium-only([^"]*)" onclick="window\.location\.href='my-business\.html'"/g, '<a href="my-business.html" class="$1premium-only$2"');
        html = html.replace(/<a href="#" class="([^"]*)premium-only([^"]*)" onclick="window\.location\.href='office\.html'"/g, '<a href="office.html" class="$1premium-only$2"');
        html = html.replace(/<a href="#" class="([^"]*)premium-only([^"]*)" onclick="window\.location\.href='resources\.html'"/g, '<a href="resources.html" class="$1premium-only$2"');
        
        // Wait, did we add onclick in profile.html previously? No, let's just do a generic search and replace the block manually.
    }

    fs.writeFileSync(file, html, 'utf8');
});
