import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Uygulamadaki gerçek modülü yükle; Node için package.json türünü değiştirme.
const source = await readFile(new URL('../src/savedStore.js', import.meta.url), 'utf8');
const { createSavedStore, parseSavedData } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);
const squirtle = { name: 'squirtle', url: 'https://pokeapi.co/api/v2/pokemon/7/' };
const psyduck = { name: 'psyduck', url: 'https://pokeapi.co/api/v2/pokemon/54/' };
const poliwag = { name: 'poliwag', url: 'https://pokeapi.co/api/v2/pokemon/60/' };

function deferred() {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
}

function memoryStorage(initial = null) {
  return {
    value: initial,
    writes: 0,
    async getItem() { return this.value; },
    async setItem(key, value) { this.writes += 1; this.value = value; },
  };
}

test('ilk okuma bitmeden kayıt değişmez; okuma sonrası eski kayıt korunarak eklenir', async () => {
  const read = deferred();
  const storage = memoryStorage(JSON.stringify([squirtle]));
  storage.getItem = () => read.promise;
  const store = createSavedStore(storage);
  const changes = [];
  store.subscribe(() => changes.push(store.getSnapshot()));
  const loading = store.load();
  assert.equal(store.getSnapshot().loading, true);
  assert.equal(await store.addPokemon(psyduck), false);
  assert.equal(await store.removePokemon('squirtle'), false);
  assert.equal(storage.writes, 0);
  read.resolve(storage.value);
  assert.equal(await loading, true);
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot().loading, false);
  assert.equal(await store.addPokemon(psyduck), true);
  assert.deepEqual(store.getSnapshot().saved, [squirtle, psyduck]);
  assert.deepEqual(JSON.parse(storage.value), [squirtle, psyduck]);
  assert.ok(changes.some((state) => state.saving));
  assert.equal(store.getSnapshot().saving, false);
});

test('disk yazısı bitene kadar arayüz kaydedilmiş göstermez', async () => {
  const write = deferred();
  const storage = memoryStorage();
  storage.setItem = async (key, value) => { await write.promise; storage.value = value; };
  const store = createSavedStore(storage);
  await store.load();
  const saving = store.addPokemon(psyduck);
  await Promise.resolve();
  assert.equal(store.getSnapshot().saving, true);
  assert.deepEqual(store.getSnapshot().saved, []);
  assert.equal(storage.value, null);
  write.resolve();
  assert.equal(await saving, true);
  assert.deepEqual(store.getSnapshot().saved, [psyduck]);
  assert.equal(store.getSnapshot().saving, false);
});

test('disk hatası yakalanır; kayıt değişmez ve sonraki deneme çalışır', async () => {
  const storage = memoryStorage(JSON.stringify([squirtle]));
  const store = createSavedStore(storage);
  await store.load();
  storage.setItem = async () => { throw new Error('disk full'); };
  assert.equal(await store.addPokemon(psyduck), false);
  assert.deepEqual(store.getSnapshot().saved, [squirtle]);
  assert.deepEqual(JSON.parse(storage.value), [squirtle]);
  assert.match(store.getSnapshot().error, /kaydedilemedi/);
  assert.equal(store.getSnapshot().saving, false);
  storage.setItem = async (key, value) => { storage.value = value; };
  assert.equal(await store.addPokemon(psyduck), true);
  assert.equal(store.getSnapshot().error, null);
  assert.deepEqual(JSON.parse(storage.value), [squirtle, psyduck]);
});

test('okuma veya bozuk veri hatası dosyayı ezmez; tekrar okuma kurtarır', async () => {
  for (const initial of ['bozuk json', '{}', '[{"name":"squirtle"}]', 'null']) {
    const storage = memoryStorage(initial);
    const store = createSavedStore(storage);
    assert.equal(await store.load(), false);
    assert.equal(store.getSnapshot().ready, false);
    assert.equal(store.getSnapshot().loading, false);
    assert.match(store.getSnapshot().error, /okunamadı/);
    assert.equal(await store.addPokemon(psyduck), false);
    assert.equal(storage.value, initial);
    assert.equal(storage.writes, 0);
    storage.value = JSON.stringify([squirtle]);
    assert.equal(await store.load(), true);
    assert.equal(store.getSnapshot().error, null);
    assert.deepEqual(store.getSnapshot().saved, [squirtle]);
  }
  const storage = memoryStorage();
  storage.getItem = () => { throw new Error('read failed'); };
  const store = createSavedStore(storage);
  assert.equal(await store.load(), false);
  storage.getItem = async () => null;
  assert.equal(await store.load(), true);
});

test('eşzamanlı ekleme ve silme sırayla en güncel listeye uygulanır', async () => {
  const storage = memoryStorage(JSON.stringify([squirtle]));
  let activeWrites = 0;
  let maxWrites = 0;
  storage.setItem = async (key, value) => {
    activeWrites += 1;
    maxWrites = Math.max(maxWrites, activeWrites);
    await new Promise((resolve) => setImmediate(resolve));
    storage.value = value;
    activeWrites -= 1;
  };
  const store = createSavedStore(storage);
  await store.load();
  const outcomes = await Promise.all([
    store.addPokemon(psyduck), store.addPokemon(poliwag),
    store.removePokemon('squirtle'), store.addPokemon(psyduck),
  ]);
  assert.deepEqual(outcomes, [true, true, true, true]);
  assert.equal(maxWrites, 1);
  assert.deepEqual(store.getSnapshot().saved, [psyduck, poliwag]);
  assert.deepEqual(JSON.parse(storage.value), [psyduck, poliwag]);
  assert.equal(store.getSnapshot().saving, false);
  // Uygulama yeniden açıldığında aynı AsyncStorage içeriği geri okunur.
  const reopened = createSavedStore(storage);
  assert.equal(await reopened.load(), true);
  assert.deepEqual(reopened.getSnapshot().saved, [psyduck, poliwag]);
});

test('eski dosyadaki tekrarlar tekilleştirilir, geçersiz yeni kayıt yazılmaz', async () => {
  assert.deepEqual(parseSavedData(JSON.stringify([squirtle, squirtle])), [squirtle]);
  const storage = memoryStorage();
  const store = createSavedStore(storage);
  await store.load();
  assert.equal(await store.addPokemon({ name: 'bad' }), false);
  assert.equal(storage.writes, 0);
});
