import { createServer } from 'vite';
import puppeteer from 'puppeteer';

async function run() {
  console.log('Starting Vite server...');
  const server = await createServer({
    server: { port: 5173 }
  });
  await server.listen();
  console.log('Vite server listening on http://localhost:5173');

  let browser;
  try {
    console.log('Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set desktop viewport
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    
    // Wait for the page/app to load and loading screen to disappear
    console.log('Waiting for loader animation...');
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    console.log('Checking elements #radar and #research...');
    const radar = await page.$('#radar');
    const research = await page.$('#research');
    if (!radar || !research) {
      throw new Error('#radar or #research elements not found!');
    }
    console.log('[PASS] #radar and #research elements found in DOM.');

    // Let's verify pinning on Desktop
    console.log('Testing DESKTOP Sticky Scroll Pinning...');
    
    // Scroll to #radar top
    const radarOffsetTop = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    });
    console.log(`Radar offsetTop: ${radarOffsetTop}px`);

    // Scroll to radar offsetTop
    await page.evaluate((top) => window.scrollTo(0, top), radarOffsetTop);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get position of #radar
    let radarRect = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, height: rect.height };
    });
    console.log(`Scroll at Radar top. Radar rect:`, radarRect);
    
    // Check if pinned: let's scroll down by 300px
    await page.evaluate((top) => window.scrollTo(0, top + 300), radarOffsetTop);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let radarRectAfterScroll = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    console.log(`Scroll +300px. Radar rect:`, radarRectAfterScroll);
    
    // If pinned, the top of the element should stay close to 0 (the top of the viewport)
    // and not move up by 300px.
    const pinnedTopDifference = Math.abs(radarRectAfterScroll.top);
    console.log(`Pinned top difference (should be ~0 if pinned): ${pinnedTopDifference}px`);
    if (pinnedTopDifference < 50) {
      console.log('[PASS] #radar is pinned (top stays near 0 on scroll).');
    } else {
      console.log('[FAIL] #radar is not pinned (top moved with scroll).');
    }

    // Check if pinSpacing: false is working
    // If pinSpacing is false, then scrolling by 300px should move #research up by 300px relative to the viewport
    // (i.e. it scrolls over the pinned element).
    // Let's check #research position before and after scrolling.
    const researchOffsetTopBefore = await page.evaluate(() => {
      return document.getElementById('research').getBoundingClientRect().top;
    });
    console.log(`Research top before 300px scroll: ${researchOffsetTopBefore}px`);
    // After 300px scroll, research top should be researchOffsetTopBefore - 300
    const researchOffsetTopAfter = await page.evaluate(() => {
      return document.getElementById('research').getBoundingClientRect().top;
    });
    console.log(`Research top after 300px scroll: ${researchOffsetTopAfter}px`);
    const researchMoved = researchOffsetTopBefore - researchOffsetTopAfter;
    console.log(`Research moved by: ${researchMoved}px (should be ~300px)`);
    if (Math.abs(researchMoved - 300) < 50) {
      console.log('[PASS] pinSpacing is false (#research scrolls up over pinned #radar).');
    } else {
      console.log('[FAIL] pinSpacing is not false (pinSpacing: true would keep #research pushed down).');
    }

    // Test MOBILE viewport fallback
    console.log('Testing MOBILE viewport fallback...');
    // Set mobile viewport (width < 1024px or height < 750px)
    await page.setViewport({ width: 375, height: 667 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Scroll to #radar top on mobile
    const radarOffsetTopMobile = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    });
    console.log(`Mobile - Radar offsetTop: ${radarOffsetTopMobile}px`);
    
    await page.evaluate((top) => window.scrollTo(0, top), radarOffsetTopMobile);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let radarRectMobile = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    console.log(`Mobile - Scroll at Radar top. Radar rect:`, radarRectMobile);
    
    // Scroll 300px down on mobile
    await page.evaluate((top) => window.scrollTo(0, top + 300), radarOffsetTopMobile);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let radarRectMobileAfterScroll = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    console.log(`Mobile - Scroll +300px. Radar rect:`, radarRectMobileAfterScroll);
    
    // On mobile, there should be NO pinning. So the top of the element should have moved up by ~300px (meaning its rect.top is now ~ -300px)
    const mobileTopDifference = Math.abs(radarRectMobileAfterScroll.top + 300);
    console.log(`Mobile top difference (should be ~0 if NOT pinned and scrolls normally): ${mobileTopDifference}px`);
    if (mobileTopDifference < 50) {
      console.log('[PASS] Mobile fallback triggers correctly: #radar is NOT pinned.');
    } else {
      console.log('[FAIL] Mobile fallback failure: #radar seems to still be pinned.');
    }

    // Test Resize robustness
    console.log('Testing resize transition robustness...');
    // Resize from mobile back to desktop
    await page.setViewport({ width: 1200, height: 800 });
    await new Promise(resolve => setTimeout(resolve, 1500)); // give GSAP matchMedia extra time to recalculate and refresh ScrollTrigger
    
    // Scroll to radar offsetTop on desktop again
    const radarOffsetTopDesktop2 = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return rect.top + window.scrollY;
    });
    await page.evaluate((top) => window.scrollTo(0, top), radarOffsetTopDesktop2);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Scroll 300px down
    await page.evaluate((top) => window.scrollTo(0, top + 300), radarOffsetTopDesktop2);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let radarRectDesktop2AfterScroll = await page.evaluate(() => {
      const el = document.getElementById('radar');
      const rect = el.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    });
    const pinnedTopDifference2 = Math.abs(radarRectDesktop2AfterScroll.top);
    console.log(`Desktop 2 (post-resize) pinned top difference: ${pinnedTopDifference2}px`);
    if (pinnedTopDifference2 < 50) {
      console.log('[PASS] Pinning successfully re-enables and operates robustly after resizing back to desktop.');
    } else {
      console.log('[FAIL] Pinning failed to re-enable after resize.');
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) {
      console.log('Closing browser...');
      await browser.close();
    }
    console.log('Stopping Vite server...');
    await server.close();
  }
}

run();
