const { validateImageBuffer, extractImageDimensions } = require('../src/lib/nominations/image-validator');

// Create test image buffers
function makePng(w, h) {
  const buf = Buffer.alloc(24);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
  buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a;
  // IHDR width at offset 16, height at offset 20
  buf.writeUInt32BE(w, 16);
  buf.writeUInt32BE(h, 20);
  return buf;
}

function makeJpeg(w, h) {
  // SOI: FF D8, SOF0: FF C0, length: 00 11 (17 bytes), precision: 08, height: 2 bytes, width: 2 bytes
  const buf = Buffer.alloc(30);
  buf[0] = 0xff; buf[1] = 0xd8; // SOI
  buf[2] = 0xff; buf[3] = 0xc0; // SOF0
  buf.writeUInt16BE(17, 4);     // length
  buf[6] = 0x08;                // precision
  buf.writeUInt16BE(h, 7);      // height
  buf.writeUInt16BE(w, 9);      // width
  return buf;
}

console.log('Testing Image Validator:');

// Test 1: JPEG 500x500
const t1 = validateImageBuffer(makeJpeg(500, 500), 'photo.jpg');
console.log('1. JPEG 500x500:', t1.valid ? 'PASS' : 'FAIL', t1);

// Test 2: PNG 1000x1000
const t2 = validateImageBuffer(makePng(1000, 1000), 'render.png');
console.log('2. PNG 1000x1000:', t2.valid ? 'PASS' : 'FAIL', t2);

// Test 3: JPEG 400x400
const t3 = validateImageBuffer(makeJpeg(400, 400), 'lowres.jpg');
console.log('3. JPEG 400x400 rejected:', !t3.valid ? 'PASS' : 'FAIL', t3.error);

// Test 4: PNG 300x600
const t4 = validateImageBuffer(makePng(300, 600), 'narrow.png');
console.log('4. PNG 300x600 rejected:', !t4.valid ? 'PASS' : 'FAIL', t4.error);

// Test 5: JPEG over 10MB
const bigBuf = Buffer.alloc(11 * 1024 * 1024);
bigBuf[0] = 0xff; bigBuf[1] = 0xd8;
const t5 = validateImageBuffer(bigBuf, 'huge.jpg');
console.log('5. JPEG >10MB rejected:', !t5.valid ? 'PASS' : 'FAIL', t5.error);

// Test 6: WebP
const t6 = validateImageBuffer(makeJpeg(800, 800), 'test.webp');
console.log('6. WebP rejected:', !t6.valid ? 'PASS' : 'FAIL', t6.error);

// Test 7: JPEG 600x800 (non-square >= 500x500)
const t7 = validateImageBuffer(makeJpeg(600, 800), 'portrait.jpeg');
console.log('7. JPEG 600x800 accepted:', t7.valid ? 'PASS' : 'FAIL', t7);

// Test 8: Invalid fake file named .jpg
const fakeBuf = Buffer.from('This is not an image');
const t8 = validateImageBuffer(fakeBuf, 'fake.jpg');
console.log('8. Fake renamed file rejected:', !t8.valid ? 'PASS' : 'FAIL', t8.error);
