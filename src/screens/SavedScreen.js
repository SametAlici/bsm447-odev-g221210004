// Kaydedilenler ekranı: AsyncStorage'da tutulan Pokémon'lar.
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSaved } from '../SavedContext';
import PokemonRow from '../components/PokemonRow';

export default function SavedScreen({ navigation }) {
  const { saved, removePokemon } = useSaved();

  if (saved.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>💧</Text>
        <Text style={styles.emptyText}>Henüz kayıt yok</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <PokemonRow
            pokemon={item}
            onPress={() => navigation.navigate('Detay', { pokemon: item })}
            right={
              <Pressable style={styles.remove} onPress={() => removePokemon(item.name)}>
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
});
