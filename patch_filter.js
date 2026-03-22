const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace the two filters with a grid of 5 filters
html = html.replace(/<div class="grid grid-cols-2 gap-2">\s*<button class="p-2 border rounded-xl text-\[9px\] font-black uppercase lang-en">House<\/button>\s*<button class="p-2 border rounded-xl text-\[9px\] font-black uppercase lang-es hidden">Casa<\/button>\s*<button class="p-2 border rounded-xl text-\[9px\] font-black uppercase lang-en">Finca<\/button>\s*<button class="p-2 border rounded-xl text-\[9px\] font-black uppercase lang-es hidden">Finca<\/button>\s*<\/div>/,
`<div class="grid grid-cols-2 gap-2">
                    <button onclick="addFilterAreaValue('All Types')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-en transition-colors">All Types</button>
                    <button onclick="addFilterAreaValue('Todos los Tipos')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-es hidden transition-colors">Todos los Tipos</button>
                    
                    <button onclick="addFilterAreaValue('House')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-en transition-colors">House</button>
                    <button onclick="addFilterAreaValue('Casa')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-es hidden transition-colors">Casa</button>
                    
                    <button onclick="addFilterAreaValue('Condo')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-en transition-colors">Condo</button>
                    <button onclick="addFilterAreaValue('Condominio')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-es hidden transition-colors">Condominio</button>

                    <button onclick="addFilterAreaValue('Land/Lot')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-en transition-colors">Land/Lot</button>
                    <button onclick="addFilterAreaValue('Lote')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-es hidden transition-colors">Lote</button>
                    
                    <button onclick="addFilterAreaValue('Commercial')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-en transition-colors col-span-2">Commercial</button>
                    <button onclick="addFilterAreaValue('Comercial')" class="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[9px] font-black uppercase lang-es hidden transition-colors col-span-2">Comercial</button>
                </div>`);

fs.writeFileSync('index.html', html, 'utf8');

