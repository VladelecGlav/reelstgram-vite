import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('default-user');
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  useEffect(() => {
    const loadUsername = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
      }
    };
    loadUsername();
  }, []);

  const handleSaveUsername = async () => {
    if (!newUsername) {
      Alert.alert('Ошибка', 'Пожалуйста, введите имя пользователя.');
      return;
    }

    await AsyncStorage.setItem('username', newUsername);
    setUsername(newUsername);
    setIsEditing(false);
    Alert.alert('Успех', 'Имя пользователя успешно обновлено!');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="Введите новое имя пользователя"
            placeholderTextColor="#aaa"
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.label}>Имя пользователя:</Text>
          <Text style={styles.value}>{username}</Text>
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <Text style={styles.editButtonText}>Редактировать профиль</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom: 20,
  },
  infoContainer: {
    marginTop: 20,
  },
  label: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 5,
  },
  value: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff5555',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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