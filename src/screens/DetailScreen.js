// Detay ekranı: Pokémon'u route.params ile alır, ikinci istekle ayrıntıyı çeker.
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getPokemonDetail, prettyName } from '../api';
import { useSaved } from '../SavedContext';

const MAX_STAT = 150; // çubuğun %100 olduğu değer

// İstatistik adlarının Türkçesi
const STAT_NAMES = {
  hp: 'Can (HP)',
  attack: 'Saldırı',
  defense: 'Savunma',
  'special-attack': 'Özel Saldırı',
  'special-defense': 'Özel Savunma',
  speed: 'Hız',
};

// Tür adlarının Türkçesi (listede olmayan tür İngilizce adıyla görünür)
const TYPE_NAMES = {
  water: 'Su',
  fire: 'Ateş',
  grass: 'Çimen',
  electric: 'Elektrik',
  ice: 'Buz',
  ground: 'Toprak',
  rock: 'Kaya',
  flying: 'Uçan',
  psychic: 'Psişik',
  poison: 'Zehir',
  bug: 'Böcek',
  fighting: 'Dövüş',
  normal: 'Normal',
  ghost: 'Hayalet',
  dragon: 'Ejderha',
  dark: 'Karanlık',
  steel: 'Çelik',
  fairy: 'Peri',
};

export default function DetailScreen({ route, navigation }) {
  const { pokemon } = route.params; // Liste ya da Kaydedilenler'den gelen kayıt
  const {
    isSaved, addPokemon, removePokemon, storageLoading, storageReady,
    storageSaving, storageError, retryLoad,
  } = useSaved();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  function loadDetail() {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    getPokemonDetail(pokemon.name)
      .then((data) => {
        if (currentRequest === requestId.current) setDetail(data);
      })
      .catch(() => {
        if (currentRequest === requestId.current) setError('Ayrıntı alınamadı.');
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
  }

  useEffect(() => {
    navigation.setOptions({ title: prettyName(pokemon.name) });
    loadDetail();
    return () => { requestId.current += 1; };
  }, [pokemon.name]);

  const saved = isSaved(pokemon.name);

  function toggleSave() {
    if (!storageReady || storageSaving) return;
    if (saved) {
      removePokemon(pokemon.name);
    } else {
      addPokemon(pokemon);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E88E5" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.saveButton} onPress={loadDetail}>
          <Text style={styles.saveText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Image source={{ uri: detail.sprites.front_default }} style={styles.image} />
        <Text style={styles.name}>{prettyName(detail.name)}</Text>
        <Text style={styles.types}>
          {detail.types
            .map((t) => TYPE_NAMES[t.type.name] || prettyName(t.type.name))
            .join(' · ')}
        </Text>

        {/* PokeAPI boyu desimetre, ağırlığı hektogram verir */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>{detail.height / 10} m</Text>
            <Text style={styles.infoLabel}>Boy</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoValue}>{detail.weight / 10} kg</Text>
            <Text style={styles.infoLabel}>Ağırlık</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
        {detail.stats.map((s) => {
          // Konuya özel beklenti: çubuğun genişliği değere bağlı (en çok 150)
          const percent = Math.min(s.base_stat, MAX_STAT) / MAX_STAT * 100;
          return (
            <View key={s.stat.name} style={styles.statRow}>
              <Text style={styles.statName}>{STAT_NAMES[s.stat.name] || s.stat.name}</Text>
              <Text style={styles.statValue}>{s.base_stat}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.bar, { width: percent + '%' }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Yetenekler: abilities[i].ability.name, gizli yetenek ayrıca işaretlenir */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Yetenekler</Text>
        <View style={styles.chipRow}>
          {detail.abilities.map((a) => (
            <View key={a.ability.name} style={styles.chip}>
              <Text style={styles.chipText}>
                {prettyName(a.ability.name)}
                {a.is_hidden ? ' (gizli)' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={[
          styles.saveButton, saved && styles.removeButton,
          (!storageReady || storageSaving) && styles.disabledButton,
        ]}
        disabled={!storageReady || storageSaving}
        onPress={toggleSave}
      >
        <Text style={styles.saveText}>
          {storageLoading ? 'Kayıtlar yükleniyor…' : storageSaving ? 'Kaydediliyor…' :
            saved ? 'Kaydedilenlerden çıkar' : 'Kaydet'}
        </Text>
      </Pressable>
      {storageError && <Text style={styles.storageError}>{storageError}</Text>}
      {!storageReady && !storageLoading && (
        <Pressable style={styles.saveButton} onPress={retryLoad}>
          <Text style={styles.saveText}>Kayıtları tekrar oku</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
  error: {
    color: '#C62828',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  image: {
    width: 180,
    height: 180,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  types: {
    color: '#1E88E5',
    marginTop: 4,
    fontSize: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 14,
  },
  infoBox: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoLabel: {
    color: '#888',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
  },
  statName: {
    width: 110,
    color: '#444',
  },
  statValue: {
    width: 36,
    textAlign: 'right',
    marginRight: 8,
    fontWeight: '600',
  },
  barBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#1E88E5',
    borderRadius: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignSelf: 'flex-start',
  },
  chip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#0D47A1',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1E88E5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: '#E53935',
  },
  disabledButton: {
    opacity: 0.55,
  },
  storageError: {
    color: '#C62828',
    textAlign: 'center',
    marginVertical: 12,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
