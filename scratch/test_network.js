const { spawn } = require('child_process');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://localhost:9230/json/new?about:blank', { method: 'PUT' });
  const tab = await res.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 0;
  function send(method, params = {}) {
    return new Promise(resolve => {
      const msgId = ++id;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const networkLogs = [];
  ws.addEventListener('message', e => {
    const d = JSON.parse(e.data);
    if (d.method === 'Network.responseReceived') {
      networkLogs.push({ url: d.params.response.url, status: d.params.response.status });
    }
  });

  await send('Page.enable');
  await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3006/' });
  await new Promise(r => setTimeout(r, 2000));

  await send('Runtime.evaluate', {
    expression: `(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
      h2.scrollIntoView({ behavior: 'instant', block: 'center' });
    })()`
  });

  // wait 3 seconds after scrolling
  await new Promise(r => setTimeout(r, 3000));

  console.log('Jury image network requests:', networkLogs.filter(n => n.url.includes('jury') || n.url.includes('image')));

  const imgStatus = await send('Runtime.evaluate', {
    expression: `(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
      const section = h2.closest('section');
      return Array.from(section.querySelectorAll('img')).map(img => ({
        alt: img.alt,
        complete: img.complete,
        currentSrc: img.currentSrc,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }));
    })()`,
    returnByValue: true
  });
  console.log('Image status in DOM:', imgStatus.result.value);

  ws.close();
  chrome.kill();
})();
