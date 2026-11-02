// PokeAPI ile ilgili tüm adresler ve istekler bu dosyada.
// Varyant: b · Su  →  https://pokeapi.co/api/v2/type/water

export const TYPE_URL = 'https://pokeapi.co/api/v2/type/water';

// 15 saniyelik sınır hem bağlantıyı hem JSON gövdesinin okunmasını kapsar.
// Promise.race, gövde okunurken iptali desteklemeyen ortamlarda da beklemeyi bitirir.
async function fetchJsonWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('İstek zaman aşımına uğradı.'));
    }, ms);
  });
  try {
    return await Promise.race([
      (async () => {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Sunucu hatası: ' + response.status);
        }
        return response.json();
      })(),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

// Liste isteği: su türündeki Pokémon'ların adı ve adresi gelir.
export async function getWaterPokemon() {
  const data = await fetchJsonWithTimeout(TYPE_URL);
  // data.pokemon = [{ slot, pokemon: { name, url } }, ...]
  return data.pokemon.map((item) => ({
    name: item.pokemon.name,
    url: item.pokemon.url,
  }));
}

// Detay için ikinci istek: pokemon/{name}
export async function getPokemonDetail(name) {
  return fetchJsonWithTimeout('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(name));
}

// Adresin sonundaki numarayı alır: ".../pokemon/7/" → "7"
export function getIdFromUrl(url) {
  const parts = url.split('/').filter((p) => p !== '');
  return parts[parts.length - 1];
}

// Listede küçük görsel göstermek için numaradan resim adresi kurulur.
export function getSpriteUrl(url) {
  return (
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' +
    getIdFromUrl(url) +
    '.png'
  );
}

// "mr-mime" → "Mr Mime"
export function prettyName(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
