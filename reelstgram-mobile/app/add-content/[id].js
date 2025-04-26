import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddContentScreen() {
  const { id } = useLocalSearchParams(); // Получаем параметр id из URL
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [newPostUrl, setNewPostUrl] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');

  useEffect(() => {
    const loadChannel = async () => {
      const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
      const selectedChannel = channels.find((ch) => ch.uniqueId === id);
      if (selectedChannel) {
        setChannel(selectedChannel);
      }
    };
    loadChannel();
  }, [id]);

  const handleAddPost = async () => {
    if (!newPostUrl || !newPostCaption) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните URL и описание.');
      return;
    }

    const newPost = {
      id: channel.posts.length + 1,
      url: newPostUrl,
      type: newPostUrl.includes('.mp4') ? 'video' : 'image',
      caption: newPostCaption,
      likes: 0,
      views: 0,
      buttons: [],
      comments: [],
    };

    const updatedPosts = [...channel.posts, newPost];
    const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channel.uniqueId ? { ...ch, posts: updatedPosts } : ch
    );
    await AsyncStorage.setItem('channels', JSON.stringify(updatedChannels));

    Alert.alert('Успех', 'Пост успешно добавлен!');
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text style={styles.noChannel}>Канал не найден.</Text>
        <TouchableOpacity
          onPress={() => router.push('/')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добавить новый пост в {channel.name}</Text>
      <TextInput
        value={newPostUrl}
        onChangeText={setNewPostUrl}
        placeholder="URL поста (изображение или видео)"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TextInput
        value={newPostCaption}
        onChangeText={setNewPostCaption}
        placeholder="Описание"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleAddPost} style={styles.addButton}>
        <Text style={styles.addButtonText}>Добавить пост</Text>
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
  addButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
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
  noChannel: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
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