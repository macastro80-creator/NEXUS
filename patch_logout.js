const fs = require('fs');
const files = ['index.html', 'my-desk.html', 'market.html', 'profile.html', 'add-search.html'];

const logoutHtml = `<a href="login.html" onclick="localStorage.removeItem('userEmail')" class="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-95 transition-all shadow-sm" title="Log Out">
                <i class="fa-solid fa-arrow-right-from-bracket text-sm"></i>
            </a>`;

files.forEach(f => {
    if(!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');

    // Matches the premium-only w-8 h-8 bg-gradient...
    const regex = /<a href="REMAX_APP\.html"[^>]*>[\s\S]*?<\/a>/;
    
    if(regex.test(content)) {
        content = content.replace(regex, logoutHtml);
        fs.writeFileSync(f, content);
        console.log('Replaced in ' + f);
    } else {
        console.log('Not found in ' + f);
    }
});
