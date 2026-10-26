// Pre-renders the home page into dist/index.html so search engines and link
// previews get real content without running JavaScript. Other routes are served
// from dist/app.html (an empty shell) via vercel.json, so they don't flash the
// home page before their own content loads.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.resolve('dist');
const shell = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const marker = '<div id="root"></div>';
if (!shell.includes(marker)) throw new Error('prerender: #root placeholder not found in dist/index.html');

const { render } = await import(pathToFileURL(path.resolve('dist-ssr/entry-server.js')).href);
const html = render();

// The checkout code (PayPage chunk + its own chunks) is fetched up front: the
// home page prefetches it while idle, and app.html (/pay and other routes)
// preloads it alongside the main bundle instead of after it.
const assets = fs.readdirSync(path.join(dist, 'assets'));
const payChunks = assets.filter((f) => /^(PayPage|colors)-.*\.js$/.test(f)).map((f) => `/assets/${f}`);
if (!payChunks.some((f) => f.includes('PayPage'))) throw new Error('prerender: PayPage chunk not found');
const links = (rel) => payChunks.map((f) => `<link rel="${rel}" href="${f}" />`).join('\n    ');

const heroPreload = '<link rel="preload" as="image" href="/hero.webp" fetchpriority="high" />';
if (!shell.includes(heroPreload)) throw new Error('prerender: hero preload not found');
// app.html never shows the hero image; it gets the checkout chunks and an
// immediate "loading" message instead of a blank screen.
const appShell = shell
  .replace(heroPreload, links('modulepreload'))
  .replace(marker, '<div id="root"><div dir="rtl" style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#F6F7F5;color:rgba(13,13,13,.6);font:18px system-ui,sans-serif">טוען…</div></div>');
const homeShell = shell.replace('</head>', `  ${links('prefetch')}\n  </head>`);

fs.writeFileSync(path.join(dist, 'app.html'), appShell);
fs.writeFileSync(path.join(dist, 'index.html'), homeShell.replace(marker, `<div id="root">${html}</div>`));
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(`prerender: home page ${Math.round(html.length / 1024)} KB of HTML`);
