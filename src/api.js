// PokeAPI ile ilgili tüm adresler ve istekler bu dosyada.
// Varyant: b · Su  →  https://pokeapi.co/api/v2/type/water

export const TYPE_URL = 'https://pokeapi.co/api/v2/type/water';

// İstek 15 saniyede cevap gelmezse iptal edilir; böylece ekran
// sonsuza kadar "Yükleniyor…" kalmaz, hata mesajı gösterilir.
async function fetchWithTimeout(url, ms = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Liste isteği: su türündeki Pokémon'ların adı ve adresi gelir.
export async function getWaterPokemon() {
  const response = await fetchWithTimeout(TYPE_URL);
  if (!response.ok) {
    throw new Error('Sunucu hatası: ' + response.status);
  }
  const data = await response.json();
  // data.pokemon = [{ slot, pokemon: { name, url } }, ...]
  return data.pokemon.map((item) => ({
    name: item.pokemon.name,
    url: item.pokemon.url,
  }));
}

// Detay için ikinci istek: pokemon/{name}
export async function getPokemonDetail(name) {
  const response = await fetchWithTimeout('https://pokeapi.co/api/v2/pokemon/' + name);
  if (!response.ok) {
    throw new Error('Sunucu hatası: ' + response.status);
  }
  return response.json();
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
