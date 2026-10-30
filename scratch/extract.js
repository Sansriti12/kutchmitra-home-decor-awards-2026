const fs = require('fs');
const path = require('path');
const docxPath = 'C:/Users/NISHANT/.gemini/antigravity/brain/38aaec6e-ccac-4a66-91a1-80f7ed034a5e/.user_uploaded/media_1793350617490_f671d096.docx';

// docx is a zip file containing word/document.xml
const AdmZip = require('adm-zip');
try {
  const zip = new AdmZip(docxPath);
  const text = zip.readAsText('word/document.xml');
  // strip xml tags
  const clean = text.replace(/<[^>]+>/g, ' ');
  fs.writeFileSync(path.join(__dirname, 'extracted_client_doc.txt'), clean);
  console.log('Extracted', clean.length, 'characters.');
} catch (e) {
  console.error(e.message);
}
