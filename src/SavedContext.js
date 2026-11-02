// Detay ve Kaydedilenler ekranları aynı kalıcı kayıt durumunu paylaşır.
import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSavedStore } from './savedStore';

const SavedContext = createContext(null);

export function SavedProvider({ children }) {
  const [store] = useState(() => createSavedStore(AsyncStorage));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.load();
  }, [store]);

  return (
    <SavedContext.Provider value={{
      saved: state.saved,
      storageLoading: state.loading,
      storageReady: state.ready,
      storageSaving: state.saving,
      storageError: state.error,
      retryLoad: store.load,
      isSaved: (name) => state.saved.some((pokemon) => pokemon.name === name),
      addPokemon: store.addPokemon,
      removePokemon: store.removePokemon,
    }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
