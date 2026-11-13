import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const sw = readFileSync(resolve(root, 'service-worker.js'), 'utf8');
const main = readFileSync(resolve(root, 'src/main.js'), 'utf8');

describe('iPhone Add to Home Screen and landscape PWA configuration', () => {
  it('declares a standalone landscape-first web app', () => {
    assert.equal(manifest.display, 'standalone');
    assert.equal(manifest.orientation, 'landscape');
    assert.equal(manifest.start_url, './');
    assert.equal(manifest.scope, './');
  });

  it('provides valid manifest icons and an iOS touch icon', () => {
    const expected = new Set(['192x192', '512x512']);
    assert.deepEqual(new Set(manifest.icons.map((icon) => icon.sizes)), expected);
    for (const icon of manifest.icons) {
      assert.equal(icon.type, 'image/png');
      assert.ok(existsSync(resolve(root, icon.src.replace(/^\.\//, ''))), `missing ${icon.src}`);
    }
    assert.match(html, /rel="apple-touch-icon"[^>]*href="\.\/assets\/icons\/apple-touch-icon\.png"/);
    assert.ok(existsSync(resolve(root, 'assets/icons/apple-touch-icon.png')));
  });

  it('declares iOS standalone mode and viewport safe-area support', () => {
    assert.match(html, /name="apple-mobile-web-app-capable" content="yes"/);
    assert.match(html, /name="apple-mobile-web-app-status-bar-style" content="black-translucent"/);
    assert.match(html, /name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/);
    assert.match(html, /env\(safe-area-inset-left\)/);
    assert.match(html, /100dvh/);
  });

  it('includes a portrait rotation notice and aligns touch controls to the game canvas', () => {
    assert.match(html, /orientation-notice/);
    assert.match(main, /Putar perangkat ke posisi horizontal/);
    assert.match(main, /typeof touch\.setBounds === 'function'/);
    assert.match(main, /touch\.setBounds\(canvas\.getBoundingClientRect\(\)\)/);
    assert.match(main, /matchMedia\?\.\('\(orientation: portrait\)'\)/);
  });

  it('bumps the shell cache and precaches all app icons', () => {
    assert.match(sw, /jrpg-shell-v13/);
    for (const name of ['apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
      assert.ok(sw.includes(name), `service worker does not precache ${name}`);
    }
  });
});
