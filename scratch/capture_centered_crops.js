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
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\chrome_test_profile_hp2',
    'about:blank'
  ]);

  await new Promise((r) => setTimeout(r, 1500));
  const targetRes = await fetch('http://localhost:9231/json/new?about:blank', { method: 'PUT' });
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
    console.log(`\n=== Testing ${vp.name} (${vp.width}x${vp.height}) ===`);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.deviceScaleFactor,
      mobile: vp.isMobile
    });

    await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/` });
    await new Promise((r) => setTimeout(r, 2000));

    // Scroll to center the jury grid
    await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
        const section = h2.closest('section');
        const grid = section.querySelector('.grid');
        grid.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()`
    });

    // Wait until all images in jury section are fully loaded
    let allLoaded = false;
    for (let i = 0; i < 20; i++) {
      const checkRes = await cdp.send('Runtime.evaluate', {
        expression: `(() => {
          const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
          const section = h2.closest('section');
          const imgs = Array.from(section.querySelectorAll('img'));
          return {
            count: imgs.length,
            loaded: imgs.every(img => img.complete && img.naturalWidth > 0),
            details: imgs.map(img => ({ alt: img.alt, complete: img.complete, nw: img.naturalWidth, nh: img.naturalHeight }))
          };
        })()`,
        returnByValue: true
      });
      if (checkRes.result.value.loaded && checkRes.result.value.count === 4) {
        allLoaded = true;
        console.log('All 4 images loaded perfectly!', checkRes.result.value.details);
        break;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    if (!allLoaded) console.warn('Warning: not all images reported loaded!');

    // Capture screenshot centered on jury cards
    await new Promise((r) => setTimeout(r, 600));
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const filename = `homepage_jury_${vp.name}.png`;
    fs.writeFileSync(path.join(SCREENSHOT_DIR, filename), Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot -> ${filename}`);
  }

  cdp.close();
  chrome.kill();
}

run().catch(console.error);
