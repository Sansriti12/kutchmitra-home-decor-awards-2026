const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = 'C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\screenshots';
const PORT = 3005;

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
  console.log('1. Connecting to Chrome...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9225',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\chrome_test_profile_jury2',
    'about:blank'
  ]);

  await new Promise((r) => setTimeout(r, 2000));
  const targetRes = await fetch('http://localhost:9225/json/new?about:blank', { method: 'PUT' });
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

  // 1. Homepage Jury Preview Section
  console.log('\n--- HOMEPAGE JURY PREVIEW SECTION ---');
  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.deviceScaleFactor,
      mobile: vp.isMobile
    });

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    // wait for load and hydration
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll jury section into view and measure
    const sectionMetrics = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const allH2 = Array.from(document.querySelectorAll('h2'));
        const targetH2 = allH2.find(h => h.textContent.includes('Meet the Esteemed Jury'));
        if (!targetH2) {
          return { error: 'h2 not found', h2s: allH2.map(h => h.textContent.trim()) };
        }
        const section = targetH2.closest('section');
        if (!section) return { error: 'section not found' };

        section.scrollIntoView({ behavior: 'instant', block: 'start' });
        const rect = section.getBoundingClientRect();
        const articles = section.querySelectorAll('article');
        const cardMetrics = Array.from(articles).map(a => {
          const r = a.getBoundingClientRect();
          const img = a.querySelector('img');
          const ir = img ? img.getBoundingClientRect() : null;
          return {
            cardHeight: Math.round(r.height),
            cardWidth: Math.round(r.width),
            imgHeight: ir ? Math.round(ir.height) : null,
            imgWidth: ir ? Math.round(ir.width) : null
          };
        });

        const cta = section.querySelector('a[href="/jury"]');

        return {
          sectionHeight: Math.round(rect.height),
          cardCount: articles.length,
          cardMetrics,
          ctaText: cta ? cta.textContent.trim() : null,
          ctaHref: cta ? cta.getAttribute('href') : null
        };
      })()`,
      returnByValue: true
    });

    console.log(`[${vp.name}] Homepage Jury Section Metrics:`, sectionMetrics.result.value);

    // Give 500ms after scrolling to capture screenshot
    await new Promise((r) => setTimeout(r, 500));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filename = `homepage_jury_${vp.name}.png`;
    fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot -> ${filename}`);
  }

  // 2. /jury Public Page
  console.log('\n--- /jury PUBLIC JURY PAGE ---');
  for (const vp of viewports) {
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.deviceScaleFactor,
      mobile: vp.isMobile
    });

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/jury` });
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll to panel grid
    const pageMetrics = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const allArticles = Array.from(document.querySelectorAll('article'));
        if (allArticles.length > 0) {
          allArticles[0].scrollIntoView({ behavior: 'instant', block: 'center' });
        }
        const section = allArticles[0] ? allArticles[0].closest('section') : null;
        const sRect = section ? section.getBoundingClientRect() : null;

        const cardMetrics = allArticles.map(a => {
          const r = a.getBoundingClientRect();
          const img = a.querySelector('img');
          const ir = img ? img.getBoundingClientRect() : null;
          return {
            cardHeight: Math.round(r.height),
            cardWidth: Math.round(r.width),
            imgHeight: ir ? Math.round(ir.height) : null,
            imgWidth: ir ? Math.round(ir.width) : null
          };
        });

        return {
          sectionHeight: sRect ? Math.round(sRect.height) : null,
          cardCount: allArticles.length,
          cardMetrics,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      })()`,
      returnByValue: true
    });

    console.log(`[${vp.name}] /jury Page Metrics:`, pageMetrics.result.value);

    await new Promise((r) => setTimeout(r, 500));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filename = `public_jury_${vp.name}.png`;
    fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot -> ${filename}`);
  }

  cdp.close();
  chrome.kill();
  console.log('\nAll captures & measurements complete successfully!');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
