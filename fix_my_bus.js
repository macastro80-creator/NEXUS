const fs = require('fs');
let html = fs.readFileSync('my-business.html', 'utf8');

// The file currently has a massively truncated script tag because of a bad regex. 
// We will replace the entire script section from <script> to </script> with a clean working version
const newScript = `
        let currentLang = 'en';
        let generatedPlan = null;
        let pendingTodos = []; 
        let currentGrossVol = 0;

        const C_PROSPECT_TO_PRE = 0.20; 
        const C_PRE_TO_ACM = 0.70;      
        const C_ACM_TO_EXCL = 0.50;     
        const C_EXCL_TO_SALE = 0.10;    

        function toggleLanguage() {
            currentLang = currentLang === 'en' ? 'es' : 'en';
            applyLanguage();
            renderTodos();
        }

        function applyLanguage() {
            document.getElementById('langToggleBtn').innerText = currentLang.toUpperCase();
            const enEls = document.querySelectorAll('.lang-en');
            const esEls = document.querySelectorAll('.lang-es');
            enEls.forEach(el => currentLang === 'en' ? el.classList.remove('hidden') : el.classList.add('hidden'));
            esEls.forEach(el => currentLang === 'es' ? el.classList.remove('hidden') : el.classList.add('hidden'));
            setDateDisplay();
        }

        function setDateDisplay() {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            const dateStr = new Date().toLocaleDateString(currentLang === 'en' ? 'en-US':'es-ES', options);
            if(document.getElementById('currentDateDisp2')) document.getElementById('currentDateDisp2').innerText = dateStr;
        }

        function checkTimeForRedBtn() {
            const now = new Date();
            const btn = document.getElementById('mainOKRBtn');
            if(!btn) return;
            if(now.getHours() >= 17) {
                btn.classList.remove('bg-blue-500', 'shadow-blue-500/30');
                btn.classList.add('bg-[#ED1C24]', 'shadow-red-500/40', 'animate-pulse');
            }
        }

        let currentTrackerTab = 'week';

        function setTrackerTab(tab) {
            currentTrackerTab = tab;
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

        function generatePlan() {
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

            const WORK_WEEKS_YEAR = 50;
            const WORK_MONTHS_YEAR = 11;
            
            generatedPlan = {
                visionText: vision,
                indicators: [g1, g2, g3],
                targetIncome: yearlyIncomeTarget,
                
                yearCalls: yearlyProspectsNeeded, yearPre: yearlyPreNeeded, yearAcm: yearlyACMsNeeded, yearExcl: yearlyExclusivesNeeded, yearSales: yearlySalesNeeded,
                monthCalls: Math.ceil(yearlyProspectsNeeded / WORK_MONTHS_YEAR), monthPre: Math.ceil(yearlyPreNeeded / WORK_MONTHS_YEAR), monthAcm: Math.ceil(yearlyACMsNeeded / WORK_MONTHS_YEAR), monthExcl: Math.ceil(yearlyExclusivesNeeded / WORK_MONTHS_YEAR), monthSales: Math.ceil(yearlySalesNeeded / WORK_MONTHS_YEAR),
                weekCalls: Math.ceil(yearlyProspectsNeeded / WORK_WEEKS_YEAR), weekPre: Math.ceil(yearlyPreNeeded / WORK_WEEKS_YEAR), weekAcm: Math.ceil(yearlyACMsNeeded / WORK_WEEKS_YEAR), weekExcl: Math.ceil(yearlyExclusivesNeeded / WORK_WEEKS_YEAR), weekSales: Math.ceil(yearlySalesNeeded / WORK_WEEKS_YEAR)
            };

            generatedPlan.tracked = {
                calls: 0, pre: 0, acm: 0, excl: 0, sales: 0, currentVol: 0
            };

            localStorage.setItem('nexus_business_plan', JSON.stringify(generatedPlan));
            loadDashboardUI();
        }

        function loadDashboardUI() {
            const savedPlan = localStorage.getItem('nexus_business_plan');
            if(savedPlan) {
                generatedPlan = JSON.parse(savedPlan);
                if(!generatedPlan.tracked) generatedPlan.tracked = { calls:0, pre:0, acm:0, excl:0, sales:0, currentVol:0 };
                
                document.getElementById('setupWizard').classList.add('hidden');
                document.getElementById('mainDashboard').classList.remove('hidden');

                document.getElementById('dispYearlyTarget').innerText = "$" + Math.round(generatedPlan.targetIncome).toLocaleString();
                document.getElementById('dispVisionText').innerText = \`"\${generatedPlan.visionText}"\`;
                document.getElementById('dispGoal1').innerText = generatedPlan.indicators[0];
                document.getElementById('dispGoal2').innerText = generatedPlan.indicators[1];
                document.getElementById('dispGoal3').innerText = generatedPlan.indicators[2];

                updateDashboardCharts();
            } else {
                document.getElementById('setupWizard').classList.remove('hidden');
                document.getElementById('mainDashboard').classList.add('hidden');
            }
        }

        function updateDashboardCharts() {
            if(!generatedPlan) return;
            const t = generatedPlan.tracked;
            // Backwards compat
            if(t.calls === undefined) {
                 t.calls = t.weekCalls || 0; t.pre = t.weekPre || 0; t.acm = t.weekAcm || 0; t.excl = 0; t.sales = 0;
            }

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

            if(document.getElementById('trackerDisplayArea')) document.getElementById('trackerDisplayArea').innerHTML = htmlContent;

            const airPct = clamp(t.currentVol, generatedPlan.targetIncome);
            if(document.getElementById('airProgressBar')) document.getElementById('airProgressBar').style.width = airPct + '%';
            if(document.getElementById('airplaneIcon')) document.getElementById('airplaneIcon').style.left = \`calc(\${airPct}% - 12px)\`;
            if(document.getElementById('totalGrossDisp')) document.getElementById('totalGrossDisp').innerText = "$" + t.currentVol.toLocaleString();
            
            localStorage.setItem('nexus_business_plan', JSON.stringify(generatedPlan));
        }

        function resetPlan() {
            if(confirm(currentLang === 'en' ? "Erase plan and start over?" : "¿Borrar plan y empezar de nuevo?")) {
                localStorage.removeItem('nexus_business_plan');
                loadDashboardUI();
            }
        }

        function openOkrModal() { document.getElementById('fullOkrModal').classList.remove('hidden'); }
        function closeOkrModal() { document.getElementById('fullOkrModal').classList.add('hidden'); }

        function submitFullOkr() {
            const calls = parseInt(document.getElementById('okrLlamados').value) || 0;
            const pre = parseInt(document.getElementById('okrPL').value) || 0;
            const acm = parseInt(document.getElementById('okrACM').value) || 0;
            const excli = parseInt(document.getElementById('okrExclusivas').value) || 0;
            const dealClosed = parseInt(document.getElementById('okrTransacciones').value) || 0;
            const addedVol = parseInt(document.getElementById('okrVolume').value) || 0;

            if(generatedPlan) {
                generatedPlan.tracked.calls += calls;
                generatedPlan.tracked.pre += pre;
                generatedPlan.tracked.acm += acm;
                generatedPlan.tracked.excl += excli;
                generatedPlan.tracked.sales += dealClosed;
                generatedPlan.tracked.currentVol += addedVol;
                updateDashboardCharts();
            }

            if (excli > 0) {
                for (let i = 0; i < excli; i++) {
                    pendingTodos.push({ id: Date.now() + i, type: 'listing', title_en: 'Upload New Exclusive', title_es: 'Subir Nueva Exclusiva', link: 'https://docs.google.com/forms/d/e/1FAIpQLSd788bL1fT5r6FHzn89eR2B84D3W21g_m0N5P7A41tE2w56Q/viewform' });
                }
            }
            if (dealClosed > 0) {
                for (let i = 0; i < dealClosed; i++) {
                    pendingTodos.push({ id: Date.now() + 1000 + i, type: 'reserva', title_en: 'Report Closed Deal', title_es: 'Reportar Cierre', link: 'https://docs.google.com/forms/d/e/1FAIpQLSdpw3j1ZgIrmzBofK84pQ4s1L1kYyZJ9q8h50M8v9O8C1A8Nw/viewform' });
                }
            }
            if(pendingTodos.length > 0) {
                localStorage.setItem('nexus_pending_todos', JSON.stringify(pendingTodos));
                renderTodos();
            }

            document.querySelectorAll('#fullOkrModal input[type="number"]').forEach(inp => inp.value = 0);
            closeOkrModal();
            alert(currentLang === 'en' ? "OKR Saved. Great job!" : "OKR Guardado. ¡Buen trabajo!");
        }

        function renderTodos() {
            const container = document.getElementById('pendingActionsContainer');
            if(!container) return; 
            
            const emptyState = document.getElementById('emptyActionsState');
            const badge = document.getElementById('pendingCountBadge');

            const savedTodos = localStorage.getItem('nexus_pending_todos');
            if (savedTodos) pendingTodos = JSON.parse(savedTodos);

            Array.from(container.children).forEach(child => { if (child.id !== 'emptyActionsState') child.remove(); });

            if (pendingTodos.length === 0) {
                emptyState.classList.remove('hidden'); badge.classList.add('hidden'); document.getElementById('actionChecklist').classList.add('hidden');
            } else {
                document.getElementById('actionChecklist').classList.remove('hidden'); emptyState.classList.add('hidden'); badge.innerText = pendingTodos.length; badge.classList.remove('hidden');
                pendingTodos.forEach(todo => {
                    const icon = todo.type === 'listing' ? 'fa-house-flag' : 'fa-handshake';
                    const color = todo.type === 'listing' ? 'text-blue-600' : 'text-purple-600';
                    const bg = todo.type === 'listing' ? 'bg-blue-50 dark:bg-slate-700' : 'bg-purple-50 dark:bg-slate-700';
                    const title = currentLang === 'en' ? todo.title_en : todo.title_es;
                    const h = \`
                        <div class="\${bg} p-4 rounded-xl flex items-center justify-between border border-slate-200 shadow-sm transition">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm"><i class="fa-solid \${icon} \${color} text-xs"></i></div>
                                <p class="text-[10px] font-black uppercase tracking-widest">\${title}</p>
                            </div>
                            <button onclick="resolveTodo(\${todo.id}, '\${todo.link}')" class="bg-[#ED1C24] text-white text-[9px] font-black uppercase px-4 py-2 rounded-lg">\${currentLang === 'en'?'Complete':'Completar'}</button>
                        </div>\`;
                    container.insertAdjacentHTML('beforeend', h);
                });
            }
        }

        function resolveTodo(id, link) {
            window.open(link, '_blank'); pendingTodos = pendingTodos.filter(t => t.id !== id); localStorage.setItem('nexus_pending_todos', JSON.stringify(pendingTodos)); renderTodos();
        }

        function triggerConfetti() {
            if (typeof confetti === 'function') {
                var duration = 2000; var end = Date.now() + duration;
                (function frame() {
                    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ED1C24', '#003DA5', '#fcd34d'] });
                    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ED1C24', '#003DA5', '#fcd34d'] });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            }
        }

        function handleDealStatusChange(selectEl, dealId) {
            if(selectEl.value === 'sold') {
                triggerConfetti();
                selectEl.className = "bg-green-100 text-green-700 text-[9px] font-black px-2 py-1 rounded outline-none";
                document.getElementById('okrTransacciones').value = 1;
                openOkrModal();
                alert(currentLang === 'en' ? 'Deal Sold! Please enter your generated commission to log the OKR.' : '¡Cierre Realizado! Por favor ingresa tu comisión generada para registrar tu OKR.');
                setTimeout(() => { selectEl.parentElement.parentElement.remove(); }, 2000);
            } else if(selectEl.value === 'caida') {
                if(generatedPlan) document.getElementById('caidaVisionTarget').innerText = generatedPlan.visionText;
                document.getElementById('caidaModal').classList.remove('hidden');
                selectEl.className = "bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded outline-none";
                setTimeout(() => { selectEl.parentElement.parentElement.remove(); }, 3000);
            }
        }

        function closeCaidaModal() { document.getElementById('caidaModal').classList.add('hidden'); }

        function openRookieModal() { document.getElementById('rookieModal').classList.remove('hidden'); }
        function closeRookieModal() { document.getElementById('rookieModal').classList.add('hidden'); }
        
        function unlockNextRookieTask(currentTaskNum) {
            const nextTask = document.getElementById('rookieTask' + (currentTaskNum + 1));
            if(nextTask) {
                nextTask.classList.remove('opacity-50', 'pointer-events-none');
                nextTask.querySelector('input').disabled = false;
                nextTask.querySelector('span').remove(); 
            }
        }

        window.onload = function() {
            if (currentLang === 'es') applyLanguage(); else setDateDisplay();
            checkTimeForRedBtn();
            loadDashboardUI();
            renderTodos();

            const isPremium = localStorage.getItem('isPremium') === 'true';
            if (!isPremium) {
                document.querySelectorAll('.premium-only').forEach(el => {
                    if (el && el.tagName === 'A') {
                        el.classList.add('grayscale', 'opacity-60', 'relative');
                        el.insertAdjacentHTML('beforeend', '<div class="absolute top-1 right-1 lg:top-2 lg:right-2 bg-slate-900 border border-slate-700 rounded-full w-4 h-4 flex items-center justify-center shadow-lg z-20"><i class="fa-solid fa-lock text-[8px] text-slate-400"></i></div>');
                        el.addEventListener('click', (e) => {
                            e.preventDefault();
                            
                        });
                    }
                });
            }
            setInterval(checkTimeForRedBtn, 600000); 
        }
`;

const startIndex = html.indexOf('<script>');
const endIndex = html.indexOf('</script>');
if(startIndex !== -1 && endIndex !== -1) {
    html = html.substring(0, startIndex + 8) + '\n' + newScript + '\n' + html.substring(endIndex);
    fs.writeFileSync('my-business.html', html, 'utf8');
}
