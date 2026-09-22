// End-to-end render test: boot the app in jsdom via Vite SSR transform and verify React paints the UI.
import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://127.0.0.1:3000/',
  pretendToBeVisual: true,
});

const w = dom.window;
// --- Global browser shims ---
for (const key of ['window', 'document', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'CustomEvent', 'Event', 'HTMLElement', 'HTMLIFrameElement', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'matchMedia', 'IntersectionObserver', 'ResizeObserver', 'MutationObserver', 'getSelection']) {
  if (w[key] !== undefined) {
    try { globalThis[key] = w[key]; } catch {}
  }
}
globalThis.window = w;
// jsdom lacks these — provide stubs used by libs at import/render time
w.matchMedia = w.matchMedia || ((q) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false }));
globalThis.matchMedia = w.matchMedia;
class RO { observe(){} unobserve(){} disconnect(){} }
class IO { observe(){} unobserve(){} disconnect(){} takeRecords(){ return []; } }
w.ResizeObserver = w.ResizeObserver || RO; globalThis.ResizeObserver = w.ResizeObserver;
w.IntersectionObserver = w.IntersectionObserver || IO; globalThis.IntersectionObserver = w.IntersectionObserver;
w.scrollTo = () => {}; globalThis.scrollTo = w.scrollTo;
// jsdom doesn't implement Element scrolling APIs — real browsers have them
if (w.HTMLElement.prototype.scrollTo === undefined) w.HTMLElement.prototype.scrollTo = () => {};
w.HTMLElement.prototype.scrollBy = w.HTMLElement.prototype.scrollBy || (() => {});
w.HTMLElement.prototype.scrollIntoView = w.HTMLElement.prototype.scrollIntoView || (() => {});
w.HTMLElement.prototype.scroll = w.HTMLElement.prototype.scroll || (() => {});
if (!w.requestAnimationFrame) w.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
globalThis.requestAnimationFrame = w.requestAnimationFrame;

const errors = [];
w.addEventListener('error', (e) => errors.push('window.onerror: ' + (e.error?.stack || e.message)));
w.addEventListener('unhandledrejection', (e) => errors.push('unhandledrejection: ' + (e.reason?.stack || e.reason)));

const vite = await createServer({
  root: '/home/user/toooooool',
  server: { middlewareMode: true },
  appType: 'spa',
  logLevel: 'error',
  resolve: {
    alias: [
      // Node resolves react-router-dom to its CJS build (no named exports) — point SSR at the ESM build instead.
      { find: /^react-router-dom$/, replacement: '/home/user/toooooool/node_modules/react-router-dom/dist/index.mjs' },
    ],
  },
});

try {
  await vite.ssrLoadModule('/index.tsx');
  // give React a few microtasks+frames to commit
  await new Promise((r) => setTimeout(r, 1500));
  const rootHTML = w.document.getElementById('root')?.innerHTML || '';
  const text = (w.document.body.textContent || '').replace(/\s+/g, ' ').trim();
  console.log('--- root has content:', rootHTML.length > 100 ? 'YES (' + rootHTML.length + ' chars)' : 'NO — WHITE PAGE');
  console.log('--- body text sample:', JSON.stringify(text.slice(0, 300)));
  console.log('--- runtime errors:', errors.length ? errors.slice(0, 5) : 'NONE');
  if (rootHTML.length < 100) process.exit(1);
  console.log('RENDER OK ✅');
} finally {
  await vite.close();
}
process.exit(errors.length ? 2 : 0);
