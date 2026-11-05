const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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
    '--remote-debugging-port=9226',
    '--disable-gpu',
    '--no-sandbox',
    '--user-data-dir=C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\chrome_crop_profile',
    'about:blank'
  ]);

  await new Promise((r) => setTimeout(r, 2000));
  const targetRes = await fetch('http://localhost:9226/json/new?about:blank', { method: 'PUT' });
  const target = await targetRes.json();
  const cdp = new CDPClient(target.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1800,
    deviceScaleFactor: 1,
    mobile: false
  });

  const filePath = 'file:///' + path.resolve('scratch/crop_test.html').replace(/\\/g, '/');
  await cdp.send('Page.navigate', { url: filePath });
  await new Promise((r) => setTimeout(r, 2000));

  const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\NISHANT\\.gemini\\antigravity\\brain\\38aaec6e-ccac-4a66-91a1-80f7ed034a5e\\screenshots\\crops_comparison.png', Buffer.from(shot.data, 'base64'));
  console.log('Saved crops_comparison.png');

  cdp.close();
  chrome.kill();
}

run().catch(console.error);
