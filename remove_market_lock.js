const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    // We want to find lines containing id="nav-market" and remove premium-only from them
    content = content.replace(/(id="nav-market"[^>]*?)premium-only/g, '$1');
    content = content.replace(/premium-only([^>]*?id="nav-market")/g, '$1');
    fs.writeFileSync(file, content);
});
console.log('Removed premium-only from nav-market in all HTML files.');
