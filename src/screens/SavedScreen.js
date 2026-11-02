// Kaydedilenler ekranı: AsyncStorage'da tutulan Pokémon'lar.
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSaved } from '../SavedContext';
import PokemonRow from '../components/PokemonRow';

export default function SavedScreen({ navigation }) {
  const {
    saved, removePokemon, storageLoading, storageReady, storageSaving,
    storageError, retryLoad,
  } = useSaved();

  if (storageLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.emptyText}>Kayıtlar yükleniyor…</Text>
      </View>
    );
  }

  if (!storageReady) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{storageError}</Text>
        <Pressable style={styles.retry} onPress={retryLoad}>
          <Text style={styles.removeText}>Tekrar dene</Text>
        </Pressable>
      </View>
    );
  }

  if (saved.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>💧</Text>
        <Text style={styles.emptyText}>Henüz kayıt yok</Text>
        {storageError && <Text style={styles.error}>{storageError}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {storageError && <Text style={styles.error}>{storageError}</Text>}
      {storageSaving && <Text style={styles.emptyText}>Kaydediliyor…</Text>}
      <FlatList
        data={saved}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PokemonRow
            pokemon={item}
            onPress={() => navigation.navigate('Detay', { pokemon: item })}
            right={
              <Pressable
                style={[styles.remove, storageSaving && styles.disabledButton]}
                disabled={storageSaving}
                onPress={() => removePokemon(item.name)}
              >
                <Text style={styles.removeText}>Çıkar</Text>
              </Pressable>
            }
          />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
      />
    </View>
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
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  remove: {
    backgroundColor: '#E53935',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeText: {
    color: '#fff',
    fontWeight: '600',
  },
  error: {
    color: '#C62828',
    textAlign: 'center',
    margin: 16,
  },
  retry: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
});
