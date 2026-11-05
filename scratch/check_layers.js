const { spawn } = require('child_process');

(async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9229',
    '--disable-gpu',
    '--no-sandbox',
    'about:blank'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://localhost:9229/json/new?about:blank', { method: 'PUT' });
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

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: 'http://localhost:3006/' });
  await new Promise(r => setTimeout(r, 4000));

  const layers = await send('Runtime.evaluate', {
    expression: `(() => {
      const h2 = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Meet the Esteemed Jury'));
      const section = h2.closest('section');
      section.scrollIntoView();
      const lastCard = section.querySelectorAll('.grid > div')[3];
      const imgContainer = lastCard.querySelector('div');
      return Array.from(imgContainer.children).map(c => ({
        tag: c.tagName,
        className: c.className,
        rect: { top: c.getBoundingClientRect().top, height: c.getBoundingClientRect().height, width: c.getBoundingClientRect().width },
        bg: window.getComputedStyle(c).backgroundImage || window.getComputedStyle(c).backgroundColor
      }));
    })()`,
    returnByValue: true
  });

  console.log(JSON.stringify(layers.result.value, null, 2));
  ws.close();
  chrome.kill();
})();
