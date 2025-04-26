import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname(); // Текущий путь

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleChannels = () => {
    router.push('/channels');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }} />
        <View style={styles.bottomNav}>
          <TouchableOpacity
            onPress={handleSettings}
            style={[styles.navButton, pathname === '/settings' && styles.activeNavButton]}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={pathname === '/settings' ? '#1e90ff' : '#fff'}
            />
            <Text
              style={[
                styles.navText,
                pathname === '/settings' && styles.activeNavText,
              ]}
            >
              Настройки
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleProfile}
            style={[styles.navButton, pathname === '/profile' && styles.activeNavButton]}
          >
            <Ionicons
              name="person-outline"
              size={24}
              color={pathname === '/profile' ? '#1e90ff' : '#fff'}
            />
            <Text
              style={[
                styles.navText,
                pathname === '/profile' && styles.activeNavText,
              ]}
            >
              Профиль
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChannels}
            style={[styles.navButton, pathname === '/channels' && styles.activeNavButton]}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={24}
              color={pathname === '/channels' ? '#1e90ff' : '#fff'}
            />
            <Text
              style={[
                styles.navText,
                pathname === '/channels' && styles.activeNavText,
              ]}
            >
              Каналы
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  navButton: {
    alignItems: 'center',
  },
  activeNavButton: {
    // Можно добавить стиль для активной кнопки, если нужно
  },
  navText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 3,
  },
  activeNavText: {
    color: '#1e90ff',
  },
});