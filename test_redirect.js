const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('LOG:', msg.text()));
        page.on('pageerror', error => console.log('ERROR:', error.message));
        
        await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
        
        // Log in
        await page.evaluate(async () => {
            const elEmail = document.querySelector('input[type="email"]');
            const elPass = document.querySelector('input[type="password"]');
            
            if (elEmail) elEmail.value = 'remax@test.com';
            if (elPass) elPass.value = 'NexusTest2026!';
            
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Sign In') || b.innerText.includes('Ingresar'));
            if (btn) btn.click();
        });
        
        await new Promise(r => setTimeout(r, 3000));
        
        // Check local storage
        const currentUrl = page.url();
        console.log("Current URL after login:", currentUrl);
        
        // Now navigate to broker-dashboard.html
        await page.goto('http://localhost:3000/broker-dashboard.html', { waitUntil: 'networkidle0' });
        console.log("URL after jumping to dashboard:", page.url());
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
