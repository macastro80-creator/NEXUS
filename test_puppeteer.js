const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file://' + __dirname + '/app.html');
    await page.waitForTimeout(2000);
    const content = await page.evaluate(() => {
        return document.getElementById('supabaseSearches').innerHTML;
    });
    console.log("App.html content length:", content.length);
    await browser.close();
})();
