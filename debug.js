const p = require('puppeteer');

(async () => {
    const browser = await p.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request =>
      console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText || 'Unknown error')
    );

    console.log('Navigating to https://nexus-gray-seven.vercel.app/login');
    await page.goto('https://nexus-gray-seven.vercel.app/login', { waitUntil: 'networkidle0' });
    
    // Check if signUp is defined
    const hasSignUp = await page.evaluate(() => typeof window.signUp !== 'undefined');
    console.log('Is signUp defined in browser?', hasSignUp);

    await browser.close();
})();
