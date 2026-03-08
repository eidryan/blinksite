import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 3000));

        await page.screenshot({ path: 'local_debug_final2.png', fullPage: true });
        console.log('Screenshot saved to local_debug_final2.png');
    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        await browser.close();
    }
})();
