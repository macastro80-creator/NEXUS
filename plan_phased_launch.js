const fs = require('fs');

console.log("Analyzing affected navigation files...");
const files = ['index.html', 'my-desk.html', 'market.html', 'profile.html', 'my-business.html', 'office.html', 'resources.html'];

files.forEach(f => {
    if(fs.existsSync(f)) {
        console.log(`Found ${f}`);
    }
});
