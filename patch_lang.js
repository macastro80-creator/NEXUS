const fs = require('fs');
const path = require('path');

const languageLogic = `
// --- LANGUAGE MANAGEMENT ---
window.setLanguage = function(lang) {
    if(!lang) lang = 'en';
    localStorage.setItem('language', lang);
    
    // Update active button states
    const btnEn = document.getElementById('btn-en');
    const btnEs = document.getElementById('btn-es');
    if (btnEn) btnEn.className = lang === 'en' ? 'px-2 py-1 rounded-full bg-[#003DA5] text-white transition-colors' : 'px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 transition-colors';
    if (btnEs) btnEs.className = lang === 'es' ? 'px-2 py-1 rounded-full bg-[#003DA5] text-white transition-colors' : 'px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 transition-colors';
    
    // Toggle content visibility
    document.querySelectorAll('.lang-en').forEach(el => {
        if (lang === 'en') el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
    document.querySelectorAll('.lang-es').forEach(el => {
        if (lang === 'es') el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    if(window.setLanguage) window.setLanguage(savedLang);
});
`;

fs.appendFileSync(path.join(__dirname, 'global-theme.js'), '\n' + languageLogic + '\n');

// Now remove inline setLanguage functions from HTML files
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    let original = content;
    // Remove variations of currentLang and setLanguage declarations
    content = content.replace(/let\s+currentLang\s*=\s*'en';\s*/g, '');
    content = content.replace(/var\s+currentLang\s*=\s*'en';\s*/g, '');
    
    // Regex explanation: Match 'function setLanguage', maybe parameters, '{', then anything until '}' followed by a blank line or </script>
    // Since JavaScript parsing with regex is hard, let's catch the exact setLanguage blocks we've seen:
    // They usually span anywhere from 5 to 20 lines.
    content = content.replace(/function\s+setLanguage\s*\([^)]*\)\s*\{[\s\S]*?(?=\n\s*(?:function|\/\/|<\/script>))/g, '');
    
    if (original !== content) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
console.log('Language patch applied.');
