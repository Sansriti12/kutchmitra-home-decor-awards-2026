const { spawn } = require('child_process');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9228',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://localhost:9228/json/new?about:blank', { method: 'PUT' });
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
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3006/' });
  await new Promise(r => setTimeout(r, 3000));

  const info = await send('Runtime.evaluate', {
    expression: `(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
      const section = h2.closest('section');
      section.scrollIntoView();
      return Array.from(section.querySelectorAll('img')).map(img => {
        const r = img.getBoundingClientRect();
        const p = img.parentElement.getBoundingClientRect();
        return {
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          imgHeight: r.height,
          imgWidth: r.width,
          parentHeight: p.height,
          parentWidth: p.width,
          objectPosition: window.getComputedStyle(img).objectPosition,
          objectFit: window.getComputedStyle(img).objectFit,
          classes: img.className
        };
      });
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(info.result.value, null, 2));
  ws.close();
  chrome.kill();
})();
