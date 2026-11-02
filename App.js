// Su Pokédex · BSM447 Dönem Ödevi · Samet Alıcı · G221210004
// Düzen: Stack (en dışta) → Sekmeler (Liste, Kaydedilenler) + Detay
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { SavedProvider } from './src/SavedContext';
import ListScreen from './src/screens/ListScreen';
import DetailScreen from './src/screens/DetailScreen';
import SavedScreen from './src/screens/SavedScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: '#1E88E5' },
  headerTintColor: '#fff',
};

// Alt sekmeler
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerStyle,
        tabBarActiveTintColor: '#1E88E5',
        tabBarIcon: ({ color, size }) => {
          const icon = route.name === 'Liste' ? 'water' : 'bookmark';
          return <Ionicons name={icon} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Liste" component={ListScreen} options={{ title: 'Su Pokémonları' }} />
      <Tab.Screen name="Kaydedilenler" component={SavedScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SavedProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={headerStyle}>
          <Stack.Screen name="Sekmeler" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="Detay" component={DetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SavedProvider>
  );
}
