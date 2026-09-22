// Crawl the vite-served module graph like a browser would, verifying every import resolves.
const BASE = 'http://127.0.0.1:3000';
const seen = new Set();
const queue = ['/index.tsx'];
const errors = [];
const cdnRefs = [];
let count = 0;

function extractImports(code) {
  const out = [];
  // static imports/exports: from '...'
  const re = /(?:import|export)[^'"]*?from\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(code))) out.push(m[1]);
  // bare dynamic import('...')
  const dre = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dre.exec(code))) out.push(m[1]);
  return out;
}

(async () => {
  while (queue.length) {
    const spec = queue.shift();
    if (seen.has(spec)) continue;
    seen.add(spec);
    let url;
    if (spec.startsWith('http')) {
      cdnRefs.push(spec);
      continue;
    } else if (spec.startsWith('/')) {
      url = BASE + spec;
    } else if (spec.startsWith('.')) {
      errors.push('UNRESOLVED_RELATIVE: ' + spec);
      continue;
    } else {
      errors.push('UNRESOLVED_BARE: ' + spec);
      continue;
    }
    let res;
    try {
      res = await fetch(url);
    } catch (e) {
      errors.push('FETCH_FAIL: ' + url + ' :: ' + e.message);
      continue;
    }
    if (res.status !== 200) {
      errors.push('HTTP_' + res.status + ': ' + url);
      continue;
    }
    const ct = res.headers.get('content-type') || '';
    if (!/javascript|css/.test(ct)) {
      errors.push('BAD_CONTENT_TYPE(' + ct + '): ' + url);
    }
    count++;
    const body = await res.text();
    if (count % 50 === 0) console.log('  ...checked', count, 'modules');
    for (const imp of extractImports(body)) {
      if (!seen.has(imp)) queue.push(imp);
    }
  }
  console.log('Modules checked:', count);
  console.log('External CDN refs found in module graph:', cdnRefs.length ? cdnRefs : 'NONE');
  if (errors.length) {
    console.log('ERRORS (' + errors.length + '):');
    for (const e of [...new Set(errors)].slice(0, 40)) console.log('  -', e);
    process.exit(1);
  }
  console.log('ALL MODULES OK — no bare/CDN/unresolved imports');
})();
