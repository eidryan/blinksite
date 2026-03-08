const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('BROWSER ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log('Page loaded successfully');

        // Check if the body has scrollTrigger elements
        const bodyHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 100));
        console.log('Body starts with:', bodyHtml);

        // Check scroll trigger status
        const vars = await page.evaluate(() => {
            return {
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                gsapExists: !!window.gsap,
            }
        });
        console.log('Vars:', vars);
    } catch (err) {
        console.error('Script Error:', err);
    } finally {
        await browser.close();
    }
})();
