const fs = require('fs');
const glob = require('glob');

// This logic will be added to db-service.js or global-theme.js
const languageLogic = `
window.setLanguage = function(lang) {
    if(!lang) lang = 'en';
    localStorage.setItem('language', lang);
    
    const btnEn = document.getElementById('btn-en');
    const btnEs = document.getElementById('btn-es');
    if (btnEn) btnEn.className = lang === 'en' ? 'px-2 py-1 rounded-full bg-[#003DA5] text-white transition-colors' : 'px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 transition-colors';
    if (btnEs) btnEs.className = lang === 'es' ? 'px-2 py-1 rounded-full bg-[#003DA5] text-white transition-colors' : 'px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 transition-colors';
    
    document.querySelectorAll('.lang-en').forEach(el => {
        lang === 'en' ? el.classList.remove('hidden') : el.classList.add('hidden');
    });
    document.querySelectorAll('.lang-es').forEach(el => {
        lang === 'es' ? el.classList.remove('hidden') : el.classList.add('hidden');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    if(window.setLanguage) window.setLanguage(savedLang);
});
`;

fs.appendFileSync('global-theme.js', '\n' + languageLogic + '\n');

// Now remove inline setLanguage functions from HTML files
const htmlFiles = glob.sync('*.html');
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Remove the function setLanguage block
    // We use a regex that matches function setLanguage(lang) { ... }
    // It's tricky to balance braces, so we can replace it by a regex if we know its content
    // Typically it spans up to 15 lines.
    content = content.replace(/let\s+currentLang\s*=\s*'en';/g, '');
    content = content.replace(/function\s+setLanguage\(lang\)\s*\{[\s\S]*?(?=\n\s*(function|\/\/|<\/script>))/g, '');
    content = content.replace(/function\s+toggleLanguage[^\{]*\{[\s\S]*?(?=\n\s*(function|\/\/|<\/script>))/g, '');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
console.log('Language patch applied.');
