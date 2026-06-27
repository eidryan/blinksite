import { createServer } from 'vite';
import puppeteer from 'puppeteer';

const viewports = [
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'mobile', width: 375, height: 667 },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function wait(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function measureNormalScroll(page, id, delta = 300) {
  const offsetTop = await page.evaluate((sectionId) => {
    const element = document.getElementById(sectionId);
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  }, id);

  await page.evaluate((top) => window.scrollTo(0, top), offsetTop);
  await wait(250);

  const before = await page.evaluate((sectionId) => {
    const rect = document.getElementById(sectionId).getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom };
  }, id);

  await page.evaluate(({ top, amount }) => window.scrollTo(0, top + amount), {
    top: offsetTop,
    amount: delta,
  });
  await wait(450);

  const after = await page.evaluate((sectionId) => {
    const rect = document.getElementById(sectionId).getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom };
  }, id);

  return {
    before,
    after,
    movement: Math.round(before.top - after.top),
  };
}

async function run() {
  const server = await createServer({
    server: { port: 5173 },
  });

  await server.listen();

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#radar');
    await page.waitForSelector('#research');

    const sectionOrder = await page.evaluate(() => (
      ['portfolio', 'radar', 'research', 'fundadores', 'contato'].map((id) => {
        const rect = document.getElementById(id).getBoundingClientRect();
        return { id, top: rect.top + window.scrollY };
      })
    ));

    for (let index = 1; index < sectionOrder.length; index += 1) {
      assert(
        sectionOrder[index - 1].top < sectionOrder[index].top,
        `${sectionOrder[index - 1].id} should appear before ${sectionOrder[index].id}`
      );
    }

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await wait(500);

      const radar = await measureNormalScroll(page, 'radar');
      const research = await measureNormalScroll(page, 'research');

      assert(
        Math.abs(radar.movement - 300) < 60,
        `${viewport.name}: #radar should scroll normally, not stay pinned`
      );
      assert(
        Math.abs(research.movement - 300) < 60,
        `${viewport.name}: #research should scroll normally, not stay pinned`
      );
    }

    console.log('Scroll behavior verification passed: Radar and Research scroll normally across desktop and mobile.');
  } finally {
    if (browser) {
      await browser.close();
    }

    await server.close();
  }
}

run().catch((error) => {
  console.error('Scroll behavior verification failed:');
  console.error(error);
  process.exit(1);
});
