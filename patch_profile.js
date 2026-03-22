const fs = require('fs');
let html = fs.readFileSync('profile.html', 'utf8');

// The user requested to change "Year Started" to "Month & Year Started"
html = html.replace(/<label class="block text-\[8px\] font-black text-slate-400 uppercase mb-1 ml-2 lang-en">Year Started<\/label>/,
`<label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2 lang-en">Month & Year Started</label>`);

html = html.replace(/<label class="block text-\[8px\] font-black text-slate-400 uppercase mb-1 ml-2 lang-es hidden">Año de Inicio<\/label>/,
`<label class="block text-[8px] font-black text-slate-400 uppercase mb-1 ml-2 lang-es hidden">Mes y Año de Inicio</label>`);

html = html.replace(/<input type="number" placeholder="2018" class="w-full p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-xs">/,
`<input type="month" value="2018-01" class="w-full p-4 border border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900 font-bold outline-none text-xs text-slate-600 dark:text-slate-300">`);

fs.writeFileSync('profile.html', html, 'utf8');
