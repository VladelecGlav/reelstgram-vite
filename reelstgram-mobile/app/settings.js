import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Настройки</Text>
      <Text style={styles.message}>Экран настроек в разработке.</Text>
      <TouchableOpacity
        onPress={handleBackToHome}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Вернуться на главную</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 100, // Оставляем место для нижней навигации
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  backButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});