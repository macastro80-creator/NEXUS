const fs = require('fs');
let html = fs.readFileSync('my-business.html', 'utf8');

// 1. Fix Plan Vs Reality header layout
html = html.replace(/<div class="flex items-center justify-between mb-4">[\s\S]*?<h3 class="text-xs font-black uppercase tracking-widest text-\\[#003DA5\\] dark:text-blue-400">[\s\S]*?<i class="fa-solid fa-bullseye mr-1\.5"><\/i>[\s\S]*?<span class="lang-en">Plan vs\. Reality<\/span>[\s\S]*?<span class="lang-es hidden">Plan vs\. Realidad<\/span>[\s\S]*?<\/h3>[\s\S]*?<!-- Tabs -->[\s\S]*?<div class="flex items-center gap-2">/, 
`<div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
                    <h3 class="text-xs font-black uppercase tracking-widest text-[#003DA5] dark:text-blue-400">
                        <i class="fa-solid fa-bullseye mr-1.5"></i>
                        <span class="lang-en">Plan vs. Reality</span>
                        <span class="lang-es hidden">Plan vs. Realidad</span>
                    </h3>
                    
                    <!-- Tabs -->
                    
                    <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-1 md:pb-0">`);


// 2. Expand Rookie Checklist to 10 items & make them hidden initially
const rookieItems = [
    { titleEn: "1. Complete your Business Plan", titleEs: "1. Completar tu Plan de Negocios en Plataforma" },
    { titleEn: "2. Prepare your Database (100 Contacts)", titleEs: "2. Preparar tu Base de Datos (100 Contactos)" },
    { titleEn: "3. Announce your new career on Social Media", titleEs: "3. Anunciar tu nueva carrera en Redes Sociales" },
    { titleEn: "4. Complete the 'Quick Start' Training", titleEs: "4. Completar el Entrenamiento 'Quick Start'" },
    { titleEn: "5. Shadow a top producer on a listing appointment", titleEs: "5. Acompañar a un top producer a una captación" },
    { titleEn: "6. Roleplay your listing presentation 3 times", titleEs: "6. Hacer roleplay de tu presentación 3 veces" },
    { titleEn: "7. Send 25 personal letters to your sphere", titleEs: "7. Enviar 25 cartas personales a tu esfera" },
    { titleEn: "8. Do 2 Open Houses with an experienced agent", titleEs: "8. Hacer 2 Open Houses con un agente experimentado" },
    { titleEn: "9. Call 50 For-Sale-By-Owners (FSBO)", titleEs: "9. Llamar a 50 dueños venden (FSBO)" },
    { titleEn: "10. Secure your first Exclusive Listing!", titleEs: "10. ¡Conseguir tu primera Captación Exclusiva!" }
];

let rookieHTML = '';
rookieItems.forEach((item, index) => {
    let num = index + 1;
    let visibilityCls = num === 1 ? '' : 'hidden'; // Make 2-10 completely hidden until previous is checked
    rookieHTML += `
                <label id="rookieTask${num}" class="${visibilityCls} flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl cursor-pointer transition border border-slate-100 dark:border-slate-700/50">
                    <input type="checkbox" onchange="unlockNextRookieTask(${num})" class="mt-1 w-5 h-5 rounded text-[#ED1C24] focus:ring-[#ED1C24] bg-white border-slate-300 transition-colors">
                    <div>
                        <p class="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight line-through-if-checked">
                            <span class="lang-en">${item.titleEn}</span>
                            <span class="lang-es hidden">${item.titleEs}</span>
                        </p>
                    </div>
                </label>`;
});

html = html.replace(/<div class="space-y-3 overflow-y-auto custom-scrollbar pr-2 grow" id="rookieTasks">[\s\S]*?<\/div>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*<!-- SUCCESS MODAL -->/, 
`<div class="space-y-3 overflow-y-auto custom-scrollbar pr-2 grow" id="rookieTasks">
${rookieHTML}
            </div>
        </div>
    </div>

    <!-- SUCCESS MODAL -->`);

// 3. Update the JS logic for the unlocking
html = html.replace(/function unlockNextRookieTask\(currentTaskNum\) \{[\s\S]*?\}\n        \}/, 
`function unlockNextRookieTask(currentTaskNum) {
            const currentTaskLabel = document.getElementById('rookieTask' + currentTaskNum);
            const isChecked = currentTaskLabel.querySelector('input').checked;
            
            // Toggle strike-through on current text
            if(isChecked) {
                currentTaskLabel.querySelector('p').classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
            } else {
                currentTaskLabel.querySelector('p').classList.remove('line-through', 'text-slate-400', 'dark:text-slate-500');
            }

            // Only reveal the NEXT task if checking the box (not unchecking)
            if(isChecked) {
                const nextTask = document.getElementById('rookieTask' + (currentTaskNum + 1));
                if(nextTask) {
                    nextTask.classList.remove('hidden');
                    nextTask.classList.add('animate-fade-in-up'); // nice little pop in
                } else {
                    // if it was the last task (10)
                    triggerConfetti();
                    alert(currentLang === 'en' ? "Congratulations! You've completed the Rookie Checklist!" : "¡Felicidades! ¡Has completado el Checklist de Novato!");
                }
            }
        }`);

fs.writeFileSync('my-business.html', html, 'utf8');
