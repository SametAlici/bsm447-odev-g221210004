import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Uygulamanın kendi API modülünü çalıştır; test için kopyasını kullanma.
const source = await readFile(new URL('../src/api.js', import.meta.url), 'utf8');
const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

function clock(t) {
  const timers = new Map();
  let sequence = 0;
  t.mock.method(globalThis, 'setTimeout', (callback, milliseconds) => {
    assert.equal(milliseconds, 15000);
    const id = ++sequence;
    timers.set(id, callback);
    return id;
  });
  t.mock.method(globalThis, 'clearTimeout', (id) => timers.delete(id));
  return {
    count: () => timers.size,
    expire: () => [...timers.values()].forEach((callback) => callback()),
  };
}

test('liste gerçek API biçiminden name/url alanlarını alır ve timer temizlenir', async (t) => {
  const timer = clock(t);
  t.mock.method(globalThis, 'fetch', async (url, { signal }) => {
    assert.equal(url, api.TYPE_URL);
    assert.equal(signal.aborted, false);
    return {
      ok: true,
      json: async () => ({ pokemon: [{ slot: 1, pokemon: { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' } }] }),
    };
  });
  assert.deepEqual(await api.getWaterPokemon(), [{ name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' }]);
  assert.equal(timer.count(), 0);
});

test('yanıt başlıklarından sonra JSON gövdesi beklerken de timeout işler', async (t) => {
  const timer = clock(t);
  let signal;
  let readingBody = false;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    signal = options.signal;
    return {
      ok: true,
      json: () => {
        readingBody = true;
        // İptali desteklemeyen bir gövde okumasını da süresiz beklememeli.
        return new Promise(() => {});
      },
    };
  });
  const request = api.getPokemonDetail('squirtle');
  await Promise.resolve();
  assert.equal(readingBody, true);
  assert.equal(timer.count(), 1);
  timer.expire();
  await assert.rejects(request, /zaman aşımına/);
  assert.equal(signal.aborted, true);
  assert.equal(timer.count(), 0);
});

test('bağlantı hiç yanıt vermediğinde timeout isteği bitirir', async (t) => {
  const timer = clock(t);
  let signal;
  t.mock.method(globalThis, 'fetch', (_url, options) => {
    signal = options.signal;
    return new Promise(() => {});
  });
  const request = api.getWaterPokemon();
  timer.expire();
  await assert.rejects(request, /zaman aşımına/);
  assert.equal(signal.aborted, true);
  assert.equal(timer.count(), 0);
});

test('HTTP hatası durum kodunu korur ve JSON okumaz', async (t) => {
  const timer = clock(t);
  t.mock.method(globalThis, 'fetch', async () => ({
    ok: false,
    status: 503,
    json: () => assert.fail('Hatalı HTTP yanıtı JSON olarak okunmamalı'),
  }));
  await assert.rejects(api.getWaterPokemon(), /Sunucu hatası: 503/);
  assert.equal(timer.count(), 0);
});

test('bozuk JSON hatası yakalanabilir kalır ve timer temizlenir', async (t) => {
  const timer = clock(t);
  const error = new SyntaxError('Geçersiz JSON');
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => { throw error; } }));
  await assert.rejects(api.getPokemonDetail('squirtle'), (received) => received === error);
  assert.equal(timer.count(), 0);
});

test('ağ hatası yakalanabilir kalır ve timer temizlenir', async (t) => {
  const timer = clock(t);
  const error = new TypeError('Bağlantı yok');
  t.mock.method(globalThis, 'fetch', async () => { throw error; });
  await assert.rejects(api.getWaterPokemon(), (received) => received === error);
  assert.equal(timer.count(), 0);
});
