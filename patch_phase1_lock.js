const fs = require('fs');

const files = ['index.html', 'my-desk.html', 'market.html', 'profile.html', 'add-search.html'];

files.forEach(file => {
    if(!fs.existsSync(file)) return;
    let html = fs.readFileSync(file, 'utf8');

    // Update the JS block that locks premium elements
    // We want to force it to lock these elements ALWAYS for Phase 1
    
    // In index.html, profile.html, my-desk.html, the script is at the bottom
    // We can replace the if (!isPremium) block with a block that just locks them universally
    
    html = html.replace(/if \(!isPremium\) \{[\s\S]*?premiumElements\.forEach\(el => \{[\s\S]*?\}\);\s*\}/, 
`// PHASE 1 LAUNCH LOCK
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
            });`);

    // In profile.html, we have some links in a grid.
    if(file === 'profile.html') {
        html = html.replace(/href="market.html"/g, 'href="#" class="premium-only"');
        html = html.replace(/href="office.html"/g, 'href="#" class="premium-only"');
        html = html.replace(/href="my-business.html"/g, 'href="#" class="premium-only"');
        html = html.replace(/href="resources.html"/g, 'href="#" class="premium-only"');
    }

    fs.writeFileSync(file, html, 'utf8');
});
