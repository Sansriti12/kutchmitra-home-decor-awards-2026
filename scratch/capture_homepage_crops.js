const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = 'C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\screenshots';
const PORT = 3006;

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (e) => reject(e);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(msg.error);
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('1. Launching Chrome...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9227',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\chrome_test_profile_hp',
    'about:blank'
  ]);

  await new Promise((r) => setTimeout(r, 2000));
  const targetRes = await fetch('http://localhost:9227/json/new?about:blank', { method: 'PUT' });
  const target = await targetRes.json();
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  await cdp.send('Runtime.enable');

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900, isMobile: false, deviceScaleFactor: 1 },
    { name: 'mobile_390', width: 390, height: 844, isMobile: true, deviceScaleFactor: 3 },
  ];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.deviceScaleFactor,
      mobile: vp.isMobile
    });

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll jury section into view and extract metrics
    const metricsRes = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
        if (!h2) return { error: 'H2 not found' };
        const section = h2.closest('section');
        if (!section) return { error: 'Section not found' };

        section.scrollIntoView({ behavior: 'instant', block: 'start' });
        const sRect = section.getBoundingClientRect();

        // Cards inside grid
        const grid = section.querySelector('.grid');
        const cards = grid ? Array.from(grid.children) : [];
        const cardDetails = cards.map(c => {
          const r = c.getBoundingClientRect();
          const imgWrap = c.querySelector('div[class*="aspect-"]');
          const iwRect = imgWrap ? imgWrap.getBoundingClientRect() : null;
          const img = c.querySelector('img');
          const iRect = img ? img.getBoundingClientRect() : null;
          const title = c.querySelector('h3')?.textContent?.trim();
          return {
            title,
            cardWidth: Math.round(r.width),
            cardHeight: Math.round(r.height),
            imgWrapHeight: iwRect ? Math.round(iwRect.height) : null,
            imgWrapWidth: iwRect ? Math.round(iwRect.width) : null,
            objectPosition: img ? window.getComputedStyle(img).objectPosition : null
          };
        });

        const hasOverflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;

        return {
          sectionHeight: Math.round(sRect.height),
          cardCount: cards.length,
          cardDetails,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow
        };
      })()`,
      returnByValue: true
    });

    console.log('Metrics:', metricsRes.result.value);

    // Wait 500ms after scroll and capture screenshot
    await new Promise((r) => setTimeout(r, 600));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filename = `homepage_jury_${vp.name}.png`;
    const outPath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot -> ${filename}`);
  }

  cdp.close();
  chrome.kill();
  console.log('\nAll captures completed successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
