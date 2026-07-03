const HTMLtoDOCX = require('html-to-docx');
const fs = require('fs');

const HTML_PATH = 'C:\\Users\\Admin\\Downloads\\Gurumoorthy_Resume_ATS_Optimized.html';
const DOCX_OUT  = 'C:\\Users\\Admin\\Downloads\\Gurumoorthy_Resume_ATS_Optimized.docx';

async function run() {
  const html = fs.readFileSync(HTML_PATH, 'utf8');

  const docxBuffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
    font: 'Calibri',
    fontSize: 20,
    margins: {
      top: 720,
      right: 1080,
      bottom: 720,
      left: 1080,
    }
  });

  fs.writeFileSync(DOCX_OUT, docxBuffer);
  console.log('DOCX saved: ' + DOCX_OUT);
}

run().catch(e => console.error('Error:', e.message));
