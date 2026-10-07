const fs = require('fs');

const chunkPath = 'C:/Users/NISHANT/.gemini/antigravity/brain/861d9add-a463-4f3f-a32b-982f220e2987/.system_generated/steps/2009/content.md';
if (!fs.existsSync(chunkPath)) {
  console.log('Chunk file does not exist');
  process.exit(1);
}

const c = fs.readFileSync(chunkPath, 'utf8');

const errStr = 'Missing Supabase environment variables';
const hasErr = c.includes(errStr);
console.log('Production chunk contains "Missing Supabase environment variables":', hasErr);

if (hasErr) {
  const idx = c.indexOf(errStr);
  const before = c.substring(Math.max(0, idx - 120), idx);
  console.log('Has "void 0" before error:', before.includes('void 0'));
  console.log('Has "undefined" before error:', before.includes('undefined'));
  console.log('Has "process.env" before error:', before.includes('process.env'));
  
  // Clean snippet replacing any possible strings
  const sanitized = before.replace(/"[^"]+"/g, '"[STRING]"').replace(/'[^']+'/g, "'[STRING]'");
  console.log('Structure before error:', sanitized);
}
