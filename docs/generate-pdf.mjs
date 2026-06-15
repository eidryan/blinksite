// Gera o PDF do guia do time a partir do HTML.
// Uso: node docs/generate-pdf.mjs
import puppeteer from 'puppeteer';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = join(__dirname, 'blinksite-overview.html');
const pdfPath = join(__dirname, 'blinksite-guia-do-time.pdf');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();

// waitUntil networkidle0 garante que as fontes do Google e o layout terminem de carregar.
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');

await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,           // mantém o gradiente e os fundos escuros
  preferCSSPageSize: true,         // respeita o @page do CSS
  margin: { top: '16mm', bottom: '16mm', left: '0', right: '0' },
});

await browser.close();
console.log('PDF gerado em:', pdfPath);
