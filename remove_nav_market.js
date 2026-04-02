const fs = require('fs');
const files = [
    'patch_phase1_lock.js',
    'lock_for_all.js',
    'db-service.js',
    'market.html',
    'patch_phase1_lock_dynamic.js',
    'REMAX_APP.html',
    'Mi_Oficina.html'
];
files.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/[ \t]*document\.getElementById\('nav-market'\),\n/g, '');
        fs.writeFileSync(file, content);
    }
});
console.log('Removed nav-market lock from all scripts.');
