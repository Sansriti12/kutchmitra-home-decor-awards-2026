const fs = require('fs');

const imgHasmukh = fs.readFileSync('public/assets/jury/hasmukh-shah.jpg').toString('base64');
const imgParul = fs.readFileSync('public/assets/jury/parul-zaveri.jpg').toString('base64');
const imgHiren = fs.readFileSync('public/assets/jury/hiren-patel.jpg').toString('base64');
const imgSarosh = fs.readFileSync('public/assets/jury/sarosh-wadia.jpg').toString('base64');

const srcHasmukh = 'data:image/jpeg;base64,' + imgHasmukh;
const srcParul = 'data:image/jpeg;base64,' + imgParul;
const srcHiren = 'data:image/jpeg;base64,' + imgHiren;
const srcSarosh = 'data:image/jpeg;base64,' + imgSarosh;

const ratios = [
  { label: 'Aspect 4/5 (0.80 Portrait) - Center', ratio: '4/5', pos: { hasmukh: 'center 10%', parul: 'center top', hiren: 'center 15%', sarosh: 'center top' } },
  { label: 'Aspect 3/3.6 (0.83 Portrait) - Focused', ratio: '3/3.6', pos: { hasmukh: 'center 15%', parul: 'center 10%', hiren: 'center 20%', sarosh: 'center 12%' } },
  { label: 'Aspect 4/4.5 (0.88 Portrait) - Balanced', ratio: '4/4.5', pos: { hasmukh: 'center 15%', parul: 'center 8%', hiren: 'center 18%', sarosh: 'center 10%' } },
  { label: 'Aspect 1/1 (Square)', ratio: '1/1', pos: { hasmukh: 'center 20%', parul: 'center 15%', hiren: 'center 20%', sarosh: 'center 15%' } },
];

let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Crop Comparison</title>
  <style>
    body { background: #0A192F; color: white; font-family: sans-serif; padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1200px; margin: 0 auto 32px; }
    .card { background: #112240; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; }
    .img-wrap { width: 100%; position: relative; overflow: hidden; background: #050d1a; }
    .img-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    h2 { max-width: 1200px; margin: 20px auto 10px; font-size: 16px; color: #C5A059; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; }
    h3 { margin: 8px; font-size: 12px; text-align: center; color: #cbd5e1; }
  </style>
</head>
<body>
`;

for (const r of ratios) {
  html += `<h2>${r.label}</h2>
  <div class="grid">
    <div class="card">
      <div class="img-wrap" style="aspect-ratio: ${r.ratio};">
        <img src="${srcHasmukh}" style="object-position: ${r.pos.hasmukh};">
      </div>
      <h3>ID. Hasmukh Shah</h3>
    </div>
    <div class="card">
      <div class="img-wrap" style="aspect-ratio: ${r.ratio};">
        <img src="${srcParul}" style="object-position: ${r.pos.parul};">
      </div>
      <h3>Ar. Parul Zaveri</h3>
    </div>
    <div class="card">
      <div class="img-wrap" style="aspect-ratio: ${r.ratio};">
        <img src="${srcHiren}" style="object-position: ${r.pos.hiren};">
      </div>
      <h3>Ar. Hiren Patel</h3>
    </div>
    <div class="card">
      <div class="img-wrap" style="aspect-ratio: ${r.ratio};">
        <img src="${srcSarosh}" style="object-position: ${r.pos.sarosh};">
      </div>
      <h3>Ar. Sarosh Wadia</h3>
    </div>
  </div>`;
}

html += `</body></html>`;
fs.writeFileSync('scratch/crop_test.html', html);
console.log('Written scratch/crop_test.html with base64 images.');
