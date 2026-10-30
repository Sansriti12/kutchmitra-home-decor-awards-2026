const fs = require('fs');
const xml = fs.readFileSync('scratch/docx_unzipped/word/document.xml', 'utf8');
const text = xml
  .replace(/<w:p[ >]/g, '\n')
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/\n\s*\n/g, '\n');

fs.writeFileSync('scratch/client_doc_full.txt', text, 'utf8');
console.log('Saved client_doc_full.txt, total chars:', text.length);
