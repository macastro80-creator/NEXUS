const fs = require('fs');

// First fix app.html filters 
// We already replaced the buttons, now check applyFilters
let indexHtml = fs.readFileSync('app.html', 'utf8');
if (!indexHtml.includes('function applyFilters() {')) {
    // If it didn't apply properly, let's inject it forcefully
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
                        if (term === 'house' || term === 'casa') return text.includes('house') || text.includes('casa');
                        if (term === 'condo' || term === 'condominio') return text.includes('condo') || text.includes('apartment') || text.includes('condominio');
                        if (term === 'finca' || term === 'farm') return text.includes('finca') || text.includes('farm');
                        if (term === 'land/lot' || term === 'lote') return text.includes('lot') || text.includes('lote') || text.includes('land');
                        if (term === 'commercial' || term === 'comercial') return text.includes('commercial') || text.includes('comercial');
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
    indexHtml = indexHtml.replace(/function toggleFilter\(\) {/, applyFiltersJS + '\n            function toggleFilter() {');
    fs.writeFileSync('app.html', indexHtml, 'utf8');
}


// Now modify add-search.html
let html = fs.readFileSync('add-search.html', 'utf8');

// 1. Add "Buy or Rent" toggle below Financials header
html = html.replace(/<h3 class="text-\[10px\] font-black text-slate-400 uppercase tracking-widest lang-en"><i class="fa-solid fa-sack-dollar text-\[#003DA5\] mr-1"><\/i> Financials<\/h3>/,
`<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest lang-en"><i class="fa-solid fa-sack-dollar text-[#003DA5] mr-1"></i> Transaction Type & Budget</h3>
            <div class="flex gap-2 mb-4">
                <button type="button" onclick="this.classList.add('bg-[#003DA5]', 'text-white'); this.classList.remove('bg-slate-100', 'text-slate-500', 'dark:bg-slate-700'); this.nextElementSibling.classList.remove('bg-[#003DA5]', 'text-white'); this.nextElementSibling.classList.add('bg-slate-100', 'text-slate-500', 'dark:bg-slate-700')" class="flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-colors bg-[#003DA5] text-white">Buy</button>
                <button type="button" onclick="this.classList.add('bg-[#003DA5]', 'text-white'); this.classList.remove('bg-slate-100', 'text-slate-500', 'dark:bg-slate-700'); this.previousElementSibling.classList.remove('bg-[#003DA5]', 'text-white'); this.previousElementSibling.classList.add('bg-slate-100', 'text-slate-500', 'dark:bg-slate-700')" class="flex-1 py-3 rounded-2xl font-black text-[10px] uppercase transition-colors bg-slate-100 text-slate-500 dark:bg-slate-700">Rent</button>
            </div>`);

html = html.replace(/<h3 class="text-\[10px\] font-black text-slate-400 uppercase tracking-widest lang-es hidden"><i class="fa-solid fa-sack-dollar text-\[#003DA5\] mr-1"><\/i> Finanzas<\/h3>/,
`<h3 class="text-[10px] font-black text-slate-400 uppercase tracking-widest lang-es hidden"><i class="fa-solid fa-sack-dollar text-[#003DA5] mr-1"></i> Tipo de Transacción y Presupuesto</h3>`);


// 2. Allow multiple locations
html = html.replace(/<div id="suggestionsBox"[^>]*><\/div>\s*<\/div>\s*<\/section>/,
`<div id="suggestionsBox" class="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 mt-2 max-h-56 overflow-y-auto rounded-xl shadow-lg hidden hidden-scrollbar text-[12px] font-bold text-slate-700 dark:text-slate-300"></div>
            </div>
            
            <div id="selectedLocationsContainer" class="flex flex-wrap gap-2 pt-3 empty:hidden"></div>
        </section>`);


// 3. Add Must-Haves
html = html.replace(/<div class="pt-4">\s*<label class="block text-\[9px\] font-black text-slate-400 uppercase mb-2 ml-2 lang-en">Additional Remarks \/ Must-Haves<\/label>/,
`<div class="pt-4">
                <label class="block text-[9px] font-black text-slate-400 uppercase mb-3 ml-2 lang-en">Must-Haves (Select all that apply)</label>
                <label class="block text-[9px] font-black text-slate-400 uppercase mb-3 ml-2 lang-es hidden">Obligatorios (Selecciona los necesarios)</label>
                <div class="flex flex-wrap gap-2 mb-4">
                    <button type="button" onclick="this.classList.toggle('bg-amber-100'); this.classList.toggle('text-amber-700'); this.classList.toggle('border-amber-300')" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 transition-colors">Ocean View / Vista al Mar</button>
                    <button type="button" onclick="this.classList.toggle('bg-blue-100'); this.classList.toggle('text-blue-700'); this.classList.toggle('border-blue-300')" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 transition-colors">Pool / Piscina</button>
                    <button type="button" onclick="this.classList.toggle('bg-green-100'); this.classList.toggle('text-green-700'); this.classList.toggle('border-green-300')" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 transition-colors">Gated Community / Condominio Sec.</button>
                    <button type="button" onclick="this.classList.toggle('bg-purple-100'); this.classList.toggle('text-purple-700'); this.classList.toggle('border-purple-300')" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 transition-colors">Pet Friendly / Acepta Mascotas</button>
                    <button type="button" onclick="this.classList.toggle('bg-rose-100'); this.classList.toggle('text-rose-700'); this.classList.toggle('border-rose-300')" class="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase text-slate-600 dark:text-slate-400 transition-colors">Furnished / Amueblado</button>
                </div>

                <label class="block text-[9px] font-black text-slate-400 uppercase mb-2 ml-2 lang-en">Additional Remarks</label>`);


// 4. Update the location JS to allow piling up chips instead of just setting the input value
const locationJs = `
        let selectedLocations = [];
        
        function renderLocations() {
            const container = document.getElementById('selectedLocationsContainer');
            container.innerHTML = '';
            selectedLocations.forEach((loc, index) => {
                container.innerHTML += \`<div class="bg-blue-50 dark:bg-blue-900/30 text-[#003DA5] dark:text-blue-400 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center justify-between gap-2 border border-blue-100 dark:border-blue-800 shadow-sm">\${loc} <i class="fa-solid fa-xmark cursor-pointer hover:text-red-500" onclick="selectedLocations.splice(\${index}, 1); renderLocations();"></i></div>\`;
            });
        }
        
        function showSuggestions(val) {
            const sugBox = document.getElementById('suggestionsBox');
            sugBox.innerHTML = '';
            if (!val || typeof LOCATION_DB === 'undefined') {
                sugBox.classList.add('hidden');
                return;
            }
            
            const normalize = (str) => String(str).normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
            const normVal = normalize(val);
            const matches = LOCATION_DB.filter(loc => normalize(loc).includes(normVal)).slice(0, 15);
            
            if (matches.length === 0) {
                sugBox.classList.add('hidden');
                return;
            }

            matches.forEach(match => {
                const div = document.createElement('div');
                div.className = "p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 text-sm";
                
                const regex = new RegExp(\`(\${val})\`, 'gi');
                div.innerHTML = match.replace(regex, '<span class="text-[#003DA5] dark:text-blue-400 font-black">$1</span>');
                
                div.onpointerdown = function(e) {
                    e.preventDefault();
                    if (!selectedLocations.includes(match)) {
                        selectedLocations.push(match);
                        renderLocations();
                    }
                    document.getElementById('locationSearch').value = '';
                    sugBox.classList.add('hidden');
                };
                sugBox.appendChild(div);
            });
            sugBox.classList.remove('hidden');
        }`;

html = html.replace(/function showSuggestions\(val\) {[\s\S]*?sugBox\.classList\.remove\('hidden'\);\s*}/, locationJs);

fs.writeFileSync('add-search.html', html, 'utf8');

