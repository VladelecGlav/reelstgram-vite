import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';

export default function CreateChannelScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [currentUser] = useState('default-user'); // Для примера, можно заменить на реального пользователя

  const handleCreateChannel = async () => {
    if (!name) {
      Alert.alert('Ошибка', 'Пожалуйста, введите название канала.');
      return;
    }

    const newChannel = {
      id: Date.now(),
      uniqueId: nanoid(),
      name,
      avatar: '',
      subscribed: true,
      subscribers: 1,
      ownerId: currentUser,
      admins: [currentUser],
      posts: [],
    };

    const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
    const updatedChannels = [...channels, newChannel];
    await AsyncStorage.setItem('channels', JSON.stringify(updatedChannels));

    Alert.alert('Успех', 'Канал успешно создан!');
    router.back();
  };

  const handleCancel = () => {
    router.push('/channels');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Создать новый канал</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Название канала"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleCreateChannel} style={styles.createButton}>
        <Text style={styles.createButtonText}>Создать канал</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Отмена</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ff5555',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 80, // Устанавливаем отступ, чтобы кнопка была выше панели навигации
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});