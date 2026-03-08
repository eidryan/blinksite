import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch({
        defaultViewport: { width: 1440, height: 900 }
    });
    const page = await browser.newPage();

    try {
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });

        // Scroll down to Sobre section to trigger animations
        await page.evaluate(() => {
            window.scrollTo(0, window.innerHeight * 0.8);
        });
        // Wait for animations
        await new Promise(r => setTimeout(r, 2000));

        // Take a screenshot
        await page.screenshot({ path: 'local_debug.png', fullPage: true });

        // Save the computed styles of interesting elements
        const diagnostics = await page.evaluate(() => {
            const sobre = document.getElementById('sobre');
            const hero = document.getElementById('hero');

            return {
                heroHeight: hero ? hero.clientHeight : null,
                heroOverflow: hero ? getComputedStyle(hero).overflow : null,
                sobreBg: sobre ? getComputedStyle(sobre).backgroundColor : null,
                sobreColor: sobre ? getComputedStyle(sobre).color : null,
                sobreText: sobre.innerText,
                bodyBg: getComputedStyle(document.body).backgroundColor,
                comoAtuamosDisplay: document.getElementById('como-atuamos') ? getComputedStyle(document.getElementById('como-atuamos')).display : null
            };
        });
        console.log(JSON.stringify(diagnostics, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
    }
})();
