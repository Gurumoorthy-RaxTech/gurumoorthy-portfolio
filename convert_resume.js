const puppeteer = require('puppeteer-core');
const fs = require('fs');

const HTML_PATH   = 'C:\\Users\\Admin\\Downloads\\Gurumoorthy_Resume_ATS_Optimized.html';
const PDF_OUT     = 'C:\\Users\\Admin\\Downloads\\Gurumoorthy_Resume_ATS_Optimized.pdf';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const HEADER = `<div style="font-size:1px;">&nbsp;</div>`;

const FOOTER = `
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  .ftr {
    width:100%; font-family:Calibri,Arial,sans-serif;
    text-align:center; padding:4px 0;
    font-size:9px; font-weight:700; color:#1B4F8A;
  }
</style>
<div class="ftr">
  Page <span class="pageNumber"></span> of <span class="totalPages"></span>
</div>`;

async function generatePDF() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + HTML_PATH.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: PDF_OUT,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: HEADER,
    footerTemplate: FOOTER,
    margin: {
      top:    '18px',
      bottom: '30px',
      left:   '0px',
      right:  '0px'
    }
  });

  await browser.close();
  console.log('PDF saved: ' + PDF_OUT);
}

generatePDF().catch(e => console.error('PDF error:', e.message));
