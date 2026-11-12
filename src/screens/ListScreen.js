// Liste ekranı: su türündeki Pokémon'ları çeker, arar, 10'ar 10'ar gösterir.
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getWaterPokemon } from '../api';
import PokemonRow from '../components/PokemonRow';

const PAGE_SIZE = 10; // Ek kural 6: 10'ar 10'ar gösterme

export default function ListScreen({ navigation }) {
  const [pokemonList, setPokemonList] = useState([]); // API'den gelen tüm veri
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // aşağı çekip yenileme
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE); // ekranda kaç kayıt var
  const [bgColor, setBgColor] = useState('#E3F2FD'); // arka plan rengi

  // Kullanıcı listeyi kaydırdı mı? (onEndReached ilk açılışta kendiliğinden
  // tetiklenmesin diye tutuluyor)
  const userScrolled = useRef(false);
  const requestId = useRef(0);

  // isRefresh: liste aşağı çekildiyse tam ekran "Yükleniyor…" yerine
  // listenin üstündeki küçük göstergeyi kullan
  function loadData(isRefresh = false) {
    const id = ++requestId.current;
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    getWaterPokemon()
      .then((list) => {
        if (id === requestId.current) {
          setPokemonList(list);
          setVisibleCount(PAGE_SIZE); // yenilenince yine ilk 10 kayıt
        }
      })
      .catch(() => {
        if (id === requestId.current) {
          setError('Veri alınamadı. İnternet bağlantınızı kontrol edin.');
        }
      })
      .finally(() => {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }

  // Ekran ilk açıldığında veriyi bir kez çek
  useEffect(() => {
    loadData();
    // Ekran kapandıysa veya yeni istek başladıysa eski yanıtı kullanma.
    return () => { requestId.current += 1; };
  }, []);

  // Arama değişince yine ilk 10 kayıttan başla
  function onSearchChange(text) {
    userScrolled.current = false;
    setSearch(text);
    setVisibleCount(PAGE_SIZE);
  }

  // Büyük/küçük harfe duyarsız arama
  const filtered = pokemonList.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // Sadece ilk visibleCount kadarı gösterilir
  const visibleList = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function loadMore() {
    if (hasMore) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length));
    }
  }

  // Liste sonuna gelince 10 kayıt daha ekle
  function onEndReached() {
    if (userScrolled.current) {
      userScrolled.current = false;
      loadMore();
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.info}>Yükleniyor…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.button} onPress={() => loadData()}>
          <Text style={styles.buttonText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Arka plan rengini değiştiren düğmeler */}
      <View style={styles.colorRow}>
        <Text>Arka plan: </Text>
        <Pressable
          style={[styles.colorButton, { backgroundColor: '#E3F2FD' }]}
          onPress={() => setBgColor('#E3F2FD')}
        />
        <Pressable
          style={[styles.colorButton, { backgroundColor: '#E8F5E9' }]}
          onPress={() => setBgColor('#E8F5E9')}
        />
        <Pressable
          style={[styles.colorButton, { backgroundColor: '#FFF3E0' }]}
          onPress={() => setBgColor('#FFF3E0')}
        />
        <Pressable
          style={[styles.colorButton, { backgroundColor: '#F3E5F5' }]}
          onPress={() => setBgColor('#F3E5F5')}
        />
      </View>
      <TextInput
        style={styles.search}
        placeholder="Pokémon ara (ör. squirtle)"
        value={search}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.counter}>
        {visibleList.length} / {filtered.length} kayıt gösteriliyor
      </Text>

      <FlatList
        data={visibleList}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PokemonRow
            pokemon={item}
            onPress={() => navigation.navigate('Detay', { pokemon: item })}
          />
        )}
        onScrollBeginDrag={() => (userScrolled.current = true)}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        refreshing={refreshing}
        onRefresh={() => loadData(true)}
        ListEmptyComponent={<Text style={styles.info}>Sonuç bulunamadı</Text>}
        ListFooterComponent={
          hasMore ? (
            <Pressable style={styles.moreButton} onPress={loadMore}>
              <Text style={styles.buttonText}>
                Daha fazla ({filtered.length - visibleCount} kaldı)
              </Text>
            </Pressable>
          ) : visibleList.length > 0 ? (
            <Text style={styles.info}>Hepsi gösterildi</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 14,
    marginTop: 10,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#999',
  },
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E3F2FD',
  },
  search: {
    backgroundColor: '#fff',
    margin: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  counter: {
    marginHorizontal: 14,
    marginBottom: 4,
    color: '#555',
  },
  info: {
    textAlign: 'center',
    color: '#555',
    marginTop: 12,
  },
  error: {
    color: '#C62828',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  moreButton: {
    backgroundColor: '#1E88E5',
    margin: 12,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
