const fs = require('fs');
const files = ['app.html', 'my-desk.html', 'market.html', 'profile.html', 'add-search.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    const newLockScript = `// PHASE 1 LAUNCH LOCK (Hardcoded for ALL users)
            const launchLockedElements = [
                document.getElementById('nav-office'),
                document.getElementById('nav-business'),
                document.getElementById('nav-resources'),
                ...Array.from(document.querySelectorAll('.premium-only')),
                ...Array.from(document.querySelectorAll('a[href="office.html"]')),
                ...Array.from(document.querySelectorAll('a[href="my-business.html"]')),
                ...Array.from(document.querySelectorAll('a[href="resources.html"]')),
                ...Array.from(document.querySelectorAll('a[href="market.html"]'))
            ];
            
            // Remove nulls and apply locks unconditionally for everyone
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
                        const lang = localStorage.getItem('nexusLang') || 'en';
                        alert(lang === 'es' ? '🚀 ¡Próximamente en la Fase 2!' : '🚀 Coming Soon in Phase 2!');
                    });
                }
            });`;

    // Replace the previous dynamic lock block
    html = html.replace(/\/\/ PHASE 1 LAUNCH LOCK \(Dynamic by Email\)[\s\S]*?\}\);\s*\}/, newLockScript);
    
    fs.writeFileSync(file, html, 'utf8');
});
