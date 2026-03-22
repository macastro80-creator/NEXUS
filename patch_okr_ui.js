const fs = require('fs');
let html = fs.readFileSync('my-business.html', 'utf8');

// 1. Add custom + / - buttons to OKR inputs
const fields = [
    { id: 'okrLlamados', labelEn: 'Llamados (Prospects)', labelEs: 'Llamados (Prospectos)', color: 'slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'okrConsultas', labelEn: 'Consultas (Inquiries)', labelEs: 'Consultas (Inquiries)', color: 'slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'okrPL', labelEn: 'Pre-Listings (PL)', labelEs: 'Pre-Listings (PL)', color: 'purple-500', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'okrACM', labelEn: 'ACM / CMA', labelEs: 'ACM / CMA', color: 'amber-500', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'okrMuestras', labelEn: 'Muestras (Showings)', labelEs: 'Muestras (Showings)', color: 'slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
    { id: 'okrExclusivas', labelEn: 'Captaciones Exclusivas', labelEs: 'Captaciones Exclusivas', color: 'green-600', bg: 'bg-white dark:bg-slate-800 border border-green-100 dark:border-green-700' },
    { id: 'okrContratos', labelEn: 'Contratos (Buyers)', labelEs: 'Contratos (Compradores)', color: 'green-600', bg: 'bg-white dark:bg-slate-800 border border-green-100 dark:border-green-700' },
    { id: 'okrReservas', labelEn: 'Reservas', labelEs: 'Reservas', color: 'blue-600', bg: 'bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-700' }
];

let okrGridReplacement = '';
fields.forEach(f => {
    let wrapClass = f.color === 'green-600' ? 'bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800' : 
                    f.color === 'blue-600' ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800' : 
                    'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700';
    
    okrGridReplacement += `
                    <div class="${wrapClass} p-3 rounded-xl flex flex-col justify-center items-center text-center">
                        <p class="text-[9px] font-black text-${f.color} uppercase tracking-widest mb-1 leading-tight h-6"><span class="lang-en">${f.labelEn}</span><span class="lang-es hidden">${f.labelEs}</span></p>
                        <div class="flex items-center justify-between w-full ${f.bg} rounded-lg overflow-hidden">
                            <button onclick="decrementOkr('${f.id}')" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-black/5 active:bg-black/10 transition"><i class="fa-solid fa-minus text-xs"></i></button>
                            <input type="number" id="${f.id}" value="0" min="0" class="w-full bg-transparent text-center font-black text-lg py-1 text-slate-900 dark:text-white outline-none appearance-none m-0 p-0">
                            <button onclick="incrementOkr('${f.id}')" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-black/5 active:bg-black/10 transition"><i class="fa-solid fa-plus text-xs"></i></button>
                        </div>
                    </div>`;
});

html = html.replace(/<!-- Grid Form -->[\s\S]*?<!-- Bottom Full Width -->/, `<!-- Grid Form -->
                <div class="grid grid-cols-2 gap-3">
${okrGridReplacement}
                </div>
                <!-- Bottom Full Width -->`);

// 2. Fix transacciones to also have buttons
html = html.replace(/<input type="number" id="okrTransacciones"[\s\S]*?>/, `<div class="flex items-center bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-indigo-100 dark:border-indigo-700">
                        <button onclick="decrementOkr('okrTransacciones')" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-black/5 active:bg-black/10 transition"><i class="fa-solid fa-minus text-xs"></i></button>
                        <input type="number" id="okrTransacciones" value="0" min="0" class="w-12 bg-transparent text-center font-black text-lg py-1 text-slate-900 dark:text-white outline-none m-0 p-0">
                        <button onclick="incrementOkr('okrTransacciones')" class="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-black/5 active:bg-black/10 transition"><i class="fa-solid fa-plus text-xs"></i></button>
                    </div>`);

// 3. Add success modal HTML and Navigation Arrows to Tracker
html = html.replace(/<!-- CAIDA MODAL \(Fell Through\) -->/, `
    <!-- SUCCESS MODAL -->
    <div id="successModal" class="fixed inset-0 z-[120] bg-slate-900/80 hidden flex items-center justify-center p-6 backdrop-blur-md">
        <div class="bg-white dark:bg-slate-800 rounded-[32px] p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden transform scale-95 transition-transform duration-300" id="successModalInner">
            <div class="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex flex-col items-center justify-center mx-auto mb-4 text-green-500 shadow-inner">
                <i class="fa-solid fa-check text-4xl"></i>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 italic uppercase tracking-widest" id="successModalTitle">Great Job!</h3>
            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mb-6" id="successModalBody">Your OKR has been saved successfully.</p>
            <button onclick="closeSuccessModal()" class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-500/30">
                <span class="lang-en">Continue</span><span class="lang-es hidden">Continuar</span>
            </button>
        </div>
    </div>
    <!-- CAIDA MODAL (Fell Through) -->`);


// Add Arrows to Tracker header
html = html.replace(/<span class="lang-en">Plan vs. Reality<\/span>/, `<span class="lang-en">Plan vs. Reality</span>`);
html = html.replace(/<div class="flex bg-slate-100 dark:bg-slate-700\/50 rounded-lg p-1 gap-1">/, `
                    <div class="flex items-center gap-2">
                        <div class="flex items-center text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded-lg px-2 py-1 cursor-not-allowed opacity-50" title="Historical data coming soon">
                            <i class="fa-solid fa-chevron-left text-[10px]"></i>
                            <span class="text-[9px] font-bold uppercase tracking-widest mx-2" id="timePeriodLabel">Current</span>
                            <i class="fa-solid fa-chevron-right text-[10px]"></i>
                        </div>
                    <div class="flex bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 gap-1">`);


// 5. Inject JS logic
let jsLogic = `
        function incrementOkr(id) {
            const el = document.getElementById(id);
            if(el) el.value = parseInt(el.value || 0) + 1;
        }
        function decrementOkr(id) {
            const el = document.getElementById(id);
            if(el && parseInt(el.value || 0) > 0) el.value = parseInt(el.value || 0) - 1;
        }

        function showSuccessModal(titleEn, titleEs, bodyEn, bodyEs) {
            document.getElementById('successModalTitle').innerText = currentLang === 'en' ? titleEn : titleEs;
            document.getElementById('successModalBody').innerText = currentLang === 'en' ? bodyEn : bodyEs;
            const modal = document.getElementById('successModal');
            modal.classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('successModalInner').classList.remove('scale-95');
                document.getElementById('successModalInner').classList.add('scale-100');
            }, 10);
            triggerConfetti();
        }

        function closeSuccessModal() {
            const modal = document.getElementById('successModal');
            document.getElementById('successModalInner').classList.remove('scale-100');
            document.getElementById('successModalInner').classList.add('scale-95');
            setTimeout(() => modal.classList.add('hidden'), 200);
        }
`;

html = html.replace(/function submitFullOkr\(\) \{/, jsLogic + 'function submitFullOkr() {');

// Update alert to success modal in submitFullOkr
html = html.replace(/alert\(currentLang === 'en' \? "OKR Saved. Great job!" : "OKR Guardado. ¡Buen trabajo!"\);/, `showSuccessModal('OKR Saved', 'OKR Guardado', 'Your daily numbers have been recorded.', 'Tus números diarios han sido registrados.');`);

// Update logic to style Tracker label
html = html.replace(/currentTrackerTab === 'week'[\s\S]*?else/g, match => match); // ensure we don't break anything, just a pass 
html = html.replace(/function setTrackerTab\(tab\) \{[\s\S]*?updateDashboardCharts\(\);[\s\n]*\}/, `function setTrackerTab(tab) {
            currentTrackerTab = tab;
            ['week', 'month', 'year'].forEach(t => {
                const el = document.getElementById('tab-' + t);
                if(t === tab) {
                    el.className = 'tracker-tab px-3 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white transition';
                } else {
                    el.className = 'tracker-tab px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition';
                }
            });
            const lbl = document.getElementById('timePeriodLabel');
            if(lbl) {
                lbl.innerText = tab === 'week' ? (currentLang==='en'?'This Week':'Esta Sem') : tab === 'month' ? (currentLang==='en'?'This Month':'Este Mes') : (currentLang==='en'?'YTD':'Año');
            }
            updateDashboardCharts();
        }`);

fs.writeFileSync('my-business.html', html, 'utf8');
