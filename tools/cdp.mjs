// Tiny Chrome DevTools Protocol driver for screenshots and in-page checks (no dependencies; Node 22+).
// usage: node tools/cdp.mjs <url> <width> <height> <out.png|-> [--mobile] [--motion] [--eval "js"] [--scroll N] [--full] [--wait ms]
// Reduced motion is on unless --motion is passed, so the logo intro is skipped for layout screenshots.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = process.argv.slice(2);
const [url, w, h, out] = args;
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.indexOf(n) > -1 ? args[args.indexOf(n) + 1] : d);
const mobile = flag('--mobile');
const motion = flag('--motion');
const port = 9333 + Math.floor(Math.random() * 500);

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'cdp-'))}`, '--no-first-run', 'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  try { target = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page'); } catch {}
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: +w, height: +h, deviceScaleFactor: mobile ? 2 : 1, mobile });
if (mobile) await send('Emulation.setTouchEmulationEnabled', { enabled: true });
if (mobile) await send('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36' });
if (!motion) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url });
await sleep(+opt('--wait', 3500));

// Walk down the page so lazy images load, then return to the top.
if (flag('--full')) {
  await send('Runtime.evaluate', { expression: `(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); await new Promise(r => setTimeout(r, 900)); })()`, awaitPromise: true });
}
const scroll = opt('--scroll');
if (scroll) { await send('Runtime.evaluate', { expression: `window.scrollTo(0, ${scroll})` }); await sleep(900); }

const expr = opt('--eval');
if (expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  console.log(JSON.stringify(r.result?.result?.value ?? r.result, null, 1));
}
if (out && out !== '-') {
  const params = { format: 'png' };
  if (flag('--full')) {
    const m = await send('Page.getLayoutMetrics');
    const ch = Math.ceil(m.result.cssContentSize.height);
    params.clip = { x: 0, y: 0, width: +w, height: Math.min(ch, 16000), scale: 1 };
    params.captureBeyondViewport = true;
  }
  const s = await send('Page.captureScreenshot', params);
  writeFileSync(out, Buffer.from(s.result.data, 'base64'));
  console.log('saved', out);
}
ws.close(); chrome.kill();
process.exit(0);
