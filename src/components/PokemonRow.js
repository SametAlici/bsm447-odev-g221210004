// Liste ve Kaydedilenler ekranında kullanılan tek satır.
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getIdFromUrl, getSpriteUrl, prettyName } from '../api';

export default function PokemonRow({ pokemon, onPress, right }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Image source={{ uri: getSpriteUrl(pokemon.url) }} style={styles.image} />
      <View style={styles.texts}>
        <Text style={styles.name}>{prettyName(pokemon.name)}</Text>
        <Text style={styles.number}>#{getIdFromUrl(pokemon.url)}</Text>
      </View>
      {right}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 5,
    padding: 10,
    borderRadius: 12,
  },
  image: {
    width: 56,
    height: 56,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  texts: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0D47A1',
  },
  number: {
    fontSize: 13,
    color: '#888',
  },
});
