import { chromium } from 'playwright';
const dir='/tmp/claude-0/-home-user-PADEL/37194ec9-b781-5373-a822-b9aeac6e533a/scratchpad';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const p = await ctx.newPage();
await p.goto('http://localhost:4187/', { waitUntil: 'load' });
await p.waitForTimeout(2000);
await p.screenshot({ path: dir+'/final_hero.png' });
await b.close();
