const fs = require('fs');
let html = fs.readFileSync('my-business.html', 'utf8');

// 1) REMOVE EXISTING WEEKLY TRACKER
html = html.replace(/<!-- WEEKLY TRACKER \(Plan vs Reality\) -->[\s\S]*?<!-- ACTIVE DEALS \/ PIPELINE -->/s, `<!-- TABBED PLAN VS REALITY TRACKER -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xs font-black uppercase tracking-widest text-[#003DA5] dark:text-blue-400">
                        <i class="fa-solid fa-bullseye mr-1.5"></i>
                        <span class="lang-en">Plan vs. Reality</span>
                        <span class="lang-es hidden">Plan vs. Realidad</span>
                    </h3>
                    
                    <!-- Tabs -->
                    <div class="flex bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1 gap-1">
                        <button onclick="setTrackerTab('week')" id="tab-week" class="tracker-tab px-3 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white transition">Week</button>
                        <button onclick="setTrackerTab('month')" id="tab-month" class="tracker-tab px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">Month</button>
                        <button onclick="setTrackerTab('year')" id="tab-year" class="tracker-tab px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition">Year</button>
                    </div>
                </div>
                
                <div class="space-y-4" id="trackerDisplayArea">
                    <!-- Tracking rows injected via JS -->
                </div>
            </div>

            <!-- ACTIVE DEALS / PIPELINE -->`);

// 2) REMOVE INLINE ROOKIE CHECKLIST, REPLACE WITH OPEN BUTTON
html = html.replace(/<!-- ROOKIE CHECKLIST -->[\s\S]*?<!-- ACTION CHECKLIST \(Smart tracking for required actions\) -->/s, `<!-- ROOKIE CHECKLIST BUTTON -->
            <button onclick="openRookieModal()" class="w-full bg-[#ED1C24] text-white py-4 rounded-3xl font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/30 hover:-translate-y-1 active:translate-y-0 transition-transform flex items-center justify-center gap-3">
                <i class="fa-solid fa-clipboard-check text-lg"></i>
                <span class="lang-en">Open Rookie Checklist</span>
                <span class="lang-es hidden">Abrir Checklist de Novato</span>
            </button>

            <!-- ACTION CHECKLIST (Smart tracking for required actions) -->`);

// 3) ADD ROOKIE MODAL
html = html.replace(/<!-- CAIDA MODAL \(Fell Through\) -->/, `<!-- ROOKIE CHECKLIST MODAL -->
    <div id="rookieModal" class="fixed inset-0 z-[110] bg-slate-900/80 hidden flex items-center justify-center p-4 backdrop-blur-md">
        <div class="bg-white dark:bg-slate-800 rounded-[32px] p-6 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
            <button onclick="closeRookieModal()" class="absolute top-4 right-4 w-8 h-8 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition z-10">
                <i class="fa-solid fa-times"></i>
            </button>
            <div class="shrink-0 mb-4 pr-10">
                <h3 class="text-lg font-black uppercase tracking-widest text-[#ED1C24]">
                    <i class="fa-solid fa-clipboard-check mr-1.5"></i> <span class="lang-en">Rookie Checklist</span><span class="lang-es hidden">Checklist de Novato</span>
                </h3>
            </div>
            <div class="space-y-3 overflow-y-auto custom-scrollbar pr-2 grow" id="rookieTasks">
                <label class="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition border border-slate-100 dark:border-slate-700/50">
                    <input type="checkbox" onchange="unlockNextRookieTask(1)" class="mt-1 w-5 h-5 rounded text-[#ED1C24] focus:ring-[#ED1C24] bg-white border-slate-300">
                    <div>
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">1. Completar tu Plan de Negocios en Plataforma</p>
                    </div>
                </label>
                <label id="rookieTask2" class="opacity-50 pointer-events-none flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition border border-slate-100 dark:border-slate-700/50">
                    <input type="checkbox" disabled class="mt-1 w-5 h-5 rounded text-[#ED1C24] focus:ring-[#ED1C24] bg-white border-slate-300">
                    <div>
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">2. Preparar tu Base de Datos (100 Contactos)</p>
                        <span class="text-[9px] font-black text-amber-500 uppercase mt-1 inline-block bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded"><i class="fa-solid fa-lock"></i> Locked</span>
                    </div>
                </label>
            </div>
        </div>
    </div>

    <!-- CAIDA MODAL (Fell Through) -->`);


// 4) JS UPDATES FOR TRACKING MATH
let jsToInsert = `
        let currentTrackerTab = 'week';

        function setTrackerTab(tab) {
            currentTrackerTab = tab;
            // Update UI tabs
            ['week', 'month', 'year'].forEach(t => {
                const el = document.getElementById('tab-' + t);
                if(t === tab) {
                    el.className = 'tracker-tab px-3 py-1 text-[10px] font-bold rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white transition';
                } else {
                    el.className = 'tracker-tab px-3 py-1 text-[10px] font-bold rounded-md text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition';
                }
            });
            updateDashboardCharts();
        }

        // Deal logic enhancement: auto-fill OKR on Sold
        function handleDealStatusChange(selectEl, dealId) {
            if(selectEl.value === 'sold') {
                triggerConfetti();
                selectEl.className = "bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded outline-none";
                
                // --- NEW: Auto-prefill OKR transacciones ---
                document.getElementById('okrTransacciones').value = 1;
                openOkrModal();
                alert(currentLang === 'en' ? 'Deal Sold! Please enter your generated commission to log the OKR.' : '¡Cierre Realizado! Por favor ingresa tu comisión generada para registrar tu OKR.');
                
                setTimeout(() => { selectEl.parentElement.parentElement.remove(); }, 2000);
            } else if(selectEl.value === 'caida') {
                if(generatedPlan) {
                    document.getElementById('caidaVisionTarget').innerText = generatedPlan.visionText;
                }
                document.getElementById('caidaModal').classList.remove('hidden');
                selectEl.className = "bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded outline-none";
                setTimeout(() => { selectEl.parentElement.parentElement.remove(); }, 3000);
            }
        }

        function openRookieModal() {
            document.getElementById('rookieModal').classList.remove('hidden');
        }
        function closeRookieModal() {
            document.getElementById('rookieModal').classList.add('hidden');
        }
`;

html = html.replace(/function setDateDisplay\(\) \{/, jsToInsert + '\n        function setDateDisplay() {');

// 5) UPDATE MATH FUNCTION
html = html.replace(/function generatePlan\(\) \{[\s\S]*?function loadDashboardUI\(\) \{/, `function generatePlan() {
            const vision = document.getElementById('myVisionText').value || 'To be free and happy';
            const g1 = document.getElementById('goal1').value || '';
            const g2 = document.getElementById('goal2').value || '';
            const g3 = document.getElementById('goal3').value || '';

            const expPersonal = parseFloat(document.getElementById('expPersonal').value) || 0;
            const expBusiness = parseFloat(document.getElementById('expBusiness').value) || 0;
            const split = parseFloat(document.getElementById('splitPercent').value);
            const avgCommRate = parseFloat(document.getElementById('avgCommission').value);
            const avgTicket = parseFloat(document.getElementById('avgPrice').value);

            if(expPersonal === 0 && expBusiness === 0) {
                alert(currentLang === 'en' ? "Please input your baseline expenses." : "Por favor, ingresa tus gastos base.");
                return;
            }

            const totalMonthlyNeed = expPersonal + expBusiness;
            const yearlyIncomeTarget = totalMonthlyNeed * 12;

            const comisionBruta = avgTicket * avgCommRate; 
            const comisionBolsillo = comisionBruta * split; 

            const yearlySalesNeeded = Math.ceil(yearlyIncomeTarget / comisionBolsillo);
            
            if (yearlySalesNeeded === 0 || isNaN(yearlySalesNeeded) || yearlySalesNeeded === Infinity) {
                alert(currentLang === 'en' ? "Calculations resulted in 0. Check your numbers." : "Cálculos resultaron en 0. Revisa tus números.");
                return;
            }

            const yearlyExclusivesNeeded = Math.ceil(yearlySalesNeeded / C_EXCL_TO_SALE); 
            const yearlyACMsNeeded = Math.ceil(yearlyExclusivesNeeded / C_ACM_TO_EXCL);   
            const yearlyPreNeeded = Math.ceil(yearlyACMsNeeded / C_PRE_TO_ACM);           
            const yearlyProspectsNeeded = Math.ceil(yearlyPreNeeded / C_PROSPECT_TO_PRE); 

            const WORK_DAYS_YEAR = 250;
            const WORK_WEEKS_YEAR = 50;
            const WORK_MONTHS_YEAR = 11;
            
            generatedPlan = {
                visionText: vision,
                indicators: [g1, g2, g3],
                targetIncome: yearlyIncomeTarget,
                
                yearCalls: yearlyProspectsNeeded,
                yearPre: yearlyPreNeeded,
                yearAcm: yearlyACMsNeeded,
                yearExcl: yearlyExclusivesNeeded,
                yearSales: yearlySalesNeeded,

                monthCalls: Math.ceil(yearlyProspectsNeeded / WORK_MONTHS_YEAR),
                monthPre: Math.ceil(yearlyPreNeeded / WORK_MONTHS_YEAR),
                monthAcm: Math.ceil(yearlyACMsNeeded / WORK_MONTHS_YEAR),
                monthExcl: Math.ceil(yearlyExclusivesNeeded / WORK_MONTHS_YEAR),
                monthSales: Math.ceil(yearlySalesNeeded / WORK_MONTHS_YEAR),

                weekCalls: Math.ceil(yearlyProspectsNeeded / WORK_WEEKS_YEAR),
                weekPre: Math.ceil(yearlyPreNeeded / WORK_WEEKS_YEAR), 
                weekAcm: Math.ceil(yearlyACMsNeeded / WORK_WEEKS_YEAR),
                weekExcl: Math.ceil(yearlyExclusivesNeeded / WORK_WEEKS_YEAR),
                weekSales: Math.ceil(yearlySalesNeeded / WORK_WEEKS_YEAR)
            };

            // Init tracking
            generatedPlan.tracked = {
                calls: 0, pre: 0, acm: 0, excl: 0, sales: 0,
                currentVol: 0
            };

            localStorage.setItem('nexus_business_plan', JSON.stringify(generatedPlan));
            loadDashboardUI();
        }

        function loadDashboardUI() {`);

// 6) UPDATE DASHBOARD CHART FUNCTION
html = html.replace(/function updateDashboardCharts\(\) \{[\s\S]*?function resetPlan\(\) \{/, `function updateDashboardCharts() {
            if(!generatedPlan) return;
            const t = generatedPlan.tracked;
            // Backwards compatibility
            if(t.calls === undefined) {
                 t.calls = t.weekCalls || 0; t.pre = t.weekPre || 0; t.acm = t.weekAcm || 0; t.excl = 0; t.sales = 0;
            }

            // Determine targets based on active tab
            let tgtCalls, tgtPre, tgtAcm, tgtExcl, tgtSales;
            if(currentTrackerTab === 'week') {
                tgtCalls = generatedPlan.weekCalls; tgtPre = generatedPlan.weekPre; tgtAcm = generatedPlan.weekAcm; tgtExcl = generatedPlan.weekExcl; tgtSales = generatedPlan.weekSales;
            } else if (currentTrackerTab === 'month') {
                tgtCalls = generatedPlan.monthCalls; tgtPre = generatedPlan.monthPre; tgtAcm = generatedPlan.monthAcm; tgtExcl = generatedPlan.monthExcl; tgtSales = generatedPlan.monthSales;
            } else {
                tgtCalls = generatedPlan.yearCalls; tgtPre = generatedPlan.yearPre; tgtAcm = generatedPlan.yearAcm; tgtExcl = generatedPlan.yearExcl; tgtSales = generatedPlan.yearSales;
            }

            const clamp = (val, max) => Math.min((val/max)*100, 100) || 0;

            const makeRow = (labelEn, labelEs, current, tgt, colorHex) => \`
                <div>
                    <div class="flex justify-between text-[10px] font-bold mb-1">
                        <span class="text-slate-500 uppercase">\${currentLang === 'en' ? labelEn : labelEs}</span>
                        <span class="text-slate-700 dark:text-slate-300"><span>\${current}</span> / <span>\${tgt}</span></span>
                    </div>
                    <div class="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div class="h-full w-0 progress-bar-fill" style="background-color: \${colorHex}; width: \${clamp(current, tgt)}%"></div>
                    </div>
                </div>
            \`;

            const htmlContent = [
                makeRow('Calls/Prospects', 'Llamados/Prospectos', t.calls, tgtCalls, '#3b82f6'),
                makeRow('Pre-Listings', 'Pre-Listings', t.pre, tgtPre, '#a855f7'),
                makeRow('ACM / CMA', 'ACM / CMA', t.acm, tgtAcm, '#f59e0b'),
                makeRow('Exclusives', 'Exclusivas', t.excl, tgtExcl, '#10b981'),
                makeRow('Closings', 'Cierres', t.sales, tgtSales, '#6366f1')
            ].join('');

            document.getElementById('trackerDisplayArea').innerHTML = htmlContent;

            // Airplane Bar (Yearly Facturacion)
            const airPct = clamp(t.currentVol, generatedPlan.targetIncome);
            document.getElementById('airProgressBar').style.width = airPct + '%';
            document.getElementById('airplaneIcon').style.left = \`calc(\${airPct}% - 12px)\`;
            document.getElementById('totalGrossDisp').innerText = "$" + t.currentVol.toLocaleString();
            
            // Re-save 
            localStorage.setItem('nexus_business_plan', JSON.stringify(generatedPlan));
        }

        function resetPlan() {`);

// 7) UPDATE OKR SUMMIT TO ADD TO NEW TRACKED VALUES
html = html.replace(/generatedPlan\.tracked\.weekCalls \+= calls;[\s\S]*?updateDashboardCharts\(\);/, `generatedPlan.tracked.calls += calls;
                generatedPlan.tracked.pre += pre;
                generatedPlan.tracked.acm += acm;
                generatedPlan.tracked.excl += excli;
                generatedPlan.tracked.sales += dealClosed;
                generatedPlan.tracked.currentVol += addedVol;
                updateDashboardCharts();`);

// Remove old handleDealStatusChange logic to avoid duplication
html = html.substring(0, html.indexOf('function handleDealStatusChange(selectEl, dealId) {')) + 
       html.substring(html.indexOf('function closeCaidaModal() {'));

fs.writeFileSync('my-business.html', html, 'utf8');
