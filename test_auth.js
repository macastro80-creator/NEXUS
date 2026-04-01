const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('LOG:', msg.text()));
        page.on('pageerror', error => console.log('ERROR:', error.message));
        
        await page.goto('http://localhost:3000/broker-dashboard.html', { waitUntil: 'networkidle0' });
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
