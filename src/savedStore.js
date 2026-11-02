// React'ten bağımsız kayıt işlemleri. AsyncStorage gerçek uygulamada,
// bellek içi bir depolama ise hata senaryolarını test ederken kullanılır.
export const STORAGE_KEY = 'kaydedilenler';

function validPokemon(pokemon) {
  return pokemon && typeof pokemon.name === 'string' && pokemon.name.length > 0 &&
    typeof pokemon.url === 'string' && /^https?:\/\//.test(pokemon.url);
}

export function parseSavedData(json) {
  if (json === null) return [];
  const data = JSON.parse(json);
  if (!Array.isArray(data) || !data.every(validPokemon)) {
    throw new Error('Kayıt dosyası beklenen biçimde değil.');
  }
  // Aynı Pokémon eski bir dosyada tekrarlanmışsa ekranda tek kez göster.
  return [...new Map(data.map(({ name, url }) => [name, { name, url }])).values()];
}

export function createSavedStore(storage) {
  let state = { saved: [], loading: true, ready: false, saving: false, error: null };
  const listeners = new Set();
  let loadPromise = null;
  let writeQueue = Promise.resolve();
  let pendingWrites = 0;

  function publish(change) {
    state = { ...state, ...change };
    listeners.forEach((listener) => listener());
  }

  function load() {
    if (loadPromise) return loadPromise;
    if (pendingWrites > 0) return Promise.resolve(false);
    publish({ loading: true, ready: false, error: null });
    loadPromise = Promise.resolve().then(async () => {
      try {
        const json = await storage.getItem(STORAGE_KEY);
        publish({ saved: parseSavedData(json), ready: true });
        return true;
      } catch {
        // Okunamayan/bozuk dosyayı boş listeyle ezme; kullanıcı yeniden deneyebilir.
        publish({ error: 'Kayıtlar okunamadı. Lütfen tekrar deneyin.', ready: false });
        return false;
      } finally {
        publish({ loading: false });
        loadPromise = null;
      }
    });
    return loadPromise;
  }

  function updateSaved(change) {
    // İlk okuma gelmeden boş state ile eski kayıtların üstüne yazılamaz.
    if (!state.ready) return Promise.resolve(false);
    pendingWrites += 1;
    publish({ saving: true, error: null });
    const operation = writeQueue.then(async () => {
      // Önceki yazı bittikten sonraki en güncel listeyle hesapla.
      const next = change(state.saved);
      if (next === state.saved) return true;
      await storage.setItem(STORAGE_KEY, JSON.stringify(next));
      // Disk yazısı başarılı olmadan arayüzde kaydedilmiş gösterme.
      publish({ saved: next, error: null });
      return true;
    }).catch(() => {
      publish({ error: 'Değişiklik kaydedilemedi. Lütfen tekrar deneyin.' });
      return false;
    }).finally(() => {
      pendingWrites -= 1;
      publish({ saving: pendingWrites > 0 });
    });
    // Her işlem hatayı yakaladığından bir hata sıradaki işlemi engellemez.
    writeQueue = operation;
    return operation;
  }

  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    addPokemon(pokemon) {
      if (!validPokemon(pokemon)) return Promise.resolve(false);
      return updateSaved((saved) => saved.some((item) => item.name === pokemon.name)
        ? saved : [...saved, { name: pokemon.name, url: pokemon.url }]);
    },
    removePokemon(name) {
      return updateSaved((saved) => saved.some((item) => item.name === name)
        ? saved.filter((item) => item.name !== name) : saved);
    },
  };
}
