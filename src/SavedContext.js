// Kaydedilenler: AsyncStorage ile telefonda saklanır.
// Context sayesinde Detay ve Kaydedilenler ekranı aynı listeyi görür.
import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'kaydedilenler';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [saved, setSaved] = useState([]);

  // Uygulama açılınca kayıtlı veriyi oku
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((json) => {
      if (json) {
        setSaved(JSON.parse(json));
      }
    });
  }, []);

  // Listeyi hem state'e hem AsyncStorage'a yaz
  function updateSaved(newList) {
    setSaved(newList);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  }

  function isSaved(name) {
    return saved.some((p) => p.name === name);
  }

  function addPokemon(pokemon) {
    if (!isSaved(pokemon.name)) {
      updateSaved([...saved, { name: pokemon.name, url: pokemon.url }]);
    }
  }

  function removePokemon(name) {
    updateSaved(saved.filter((p) => p.name !== name));
  }

  return (
    <SavedContext.Provider value={{ saved, isSaved, addPokemon, removePokemon }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
