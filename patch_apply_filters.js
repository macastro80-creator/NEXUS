const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The Apply Filters buttons just hide the panel, let's make them actually filter.
html = html.replace(/<button onclick="toggleFilter\(\)"\s*class="w-full bg-\[#003DA5\] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg mt-4 lang-en">Apply\s*Filters<\/button>/,
`<button onclick="applyFilters()" class="w-full bg-[#003DA5] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg mt-4 lang-en">Apply Filters</button>`);

html = html.replace(/<button onclick="toggleFilter\(\)"\s*class="w-full bg-\[#003DA5\] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg mt-4 lang-es hidden">Aplicar\s*Filtros<\/button>/,
`<button onclick="applyFilters()" class="w-full bg-[#003DA5] text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg mt-4 lang-es hidden">Aplicar Filtros</button>`);

// Now add the applyFilters JS function near toggleFilter()
const applyFiltersJS = `
            function applyFilters() {
                toggleFilter(); // Hide the sidebar
                
                const cards = document.querySelectorAll('.feed-viewport > div, .swipe-card'); // Target Feed posts
                
                if (filters.length === 0 || filters.includes('All Types') || filters.includes('Todos los Tipos')) {
                    // Show all
                    cards.forEach(card => card.style.display = '');
                    return;
                }
                
                // Otherwise, check if the card contains any of the filter keywords
                cards.forEach(card => {
                    if (card.id === 'filterSidebar' || card.id === 'overlay') return; // Skip non-cards
                    
                    const text = card.innerText.toLowerCase();
                    const matches = filters.some(f => {
                        const term = f.toLowerCase();
                        // Handle Spanish/English equivalents to ensure it works in both UI modes
                        if (term === 'house' || term === 'casa') return text.includes('house') || text.includes('casa');
                        if (term === 'condo' || term === 'condominio') return text.includes('condo') || text.includes('apartment') || text.includes('condominio');
                        if (term === 'finca' || term === 'farm') return text.includes('finca') || text.includes('farm');
                        if (term === 'land/lot' || term === 'lote') return text.includes('lot') || text.includes('lote') || text.includes('land');
                        if (term === 'commercial' || term === 'comercial') return text.includes('commercial') || text.includes('comercial');
                        
                        // Default general text match
                        return text.includes(term); 
                    });
                    
                    if (matches) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
`;

html = html.replace(/function toggleFilter\(\) {/, applyFiltersJS + '\n            function toggleFilter() {');

fs.writeFileSync('index.html', html, 'utf8');

