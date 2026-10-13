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

fs.writeFileSync(path.join(dist, 'app.html'), shell);
fs.writeFileSync(path.join(dist, 'index.html'), shell.replace(marker, `<div id="root">${html}</div>`));
fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(`prerender: home page ${Math.round(html.length / 1024)} KB of HTML`);
