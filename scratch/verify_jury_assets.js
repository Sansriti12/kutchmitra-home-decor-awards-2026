const fs = require('fs');
const path = require('path');

const profiles = [
  { name: 'ID. Hasmukh Shah', img: '/assets/jury/hasmukh-shah.jpg' },
  { name: 'Ar. Parul Zaveri', img: '/assets/jury/parul-zaveri.jpg' },
  { name: 'Ar. Hiren Patel', img: '/assets/jury/hiren-patel.jpg' },
  { name: 'Ar. Sarosh Wadia', img: '/assets/jury/sarosh-wadia.jpg' },
];

console.log('--- JURY PROFILE IMAGES ON DISK ---');
profiles.forEach((p, idx) => {
  const diskPath = path.join(process.cwd(), 'public', p.img);
  const exists = fs.existsSync(diskPath);
  const size = exists ? fs.statSync(diskPath).size : 0;
  console.log(`${idx + 1}. ${p.name} -> ${p.img} [Exists: ${exists}, ${size} bytes]`);
});
