// global-theme.js

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}


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

