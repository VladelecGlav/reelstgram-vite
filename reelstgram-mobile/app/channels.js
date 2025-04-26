import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChannelsScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);
  const [currentUser] = useState('default-user'); // Для примера

  useEffect(() => {
    const loadChannels = async () => {
      let savedChannels = await AsyncStorage.getItem('channels');
      if (!savedChannels) {
        savedChannels = [
          {
            id: 1,
            uniqueId: 'channel1',
            name: 'Канал 1',
            avatar: '',
            subscribed: true,
            subscribers: 150,
            ownerId: 'default-user',
            admins: ['default-user'],
            posts: [
              {
                id: 1,
                url: 'https://example.com/image1.jpg',
                type: 'image',
                caption: 'Первый пост в Канале 1',
                likes: 5,
                views: 10,
                buttons: [],
                comments: [],
              },
            ],
          },
          {
            id: 2,
            uniqueId: 'channel2',
            name: 'Канал 2',
            avatar: '',
            subscribed: true,
            subscribers: 200,
            ownerId: 'user1',
            admins: ['user1'],
            posts: [
              {
                id: 1,
                url: 'https://example.com/image2.jpg',
                type: 'image',
                caption: 'Первый пост в Канале 2',
                likes: 3,
                views: 8,
                buttons: [],
                comments: [],
              },
            ],
          },
        ];
        await AsyncStorage.setItem('channels', JSON.stringify(savedChannels));
      }
      setChannels(JSON.parse(savedChannels));
    };
    loadChannels();
  }, []);

  // Фильтруем только подписанные каналы для текущего пользователя
  const subscribedChannels = channels.filter((channel) => channel.subscribed);

  const handleSelectChannel = (channel) => {
    router.push(`/channel/${channel.uniqueId}`);
  };

  const handleCreateChannel = () => {
    router.push('/create-channel');
  };

  const renderChannel = ({ item }) => (
    <TouchableOpacity
      style={styles.channelCard}
      onPress={() => handleSelectChannel(item)}
    >
      <View style={styles.channelContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name[0]}</Text>
        </View>
        <View>
          <Text style={styles.channelName}>{item.name}</Text>
          <Text style={styles.subscribers}>{item.subscribers.toLocaleString()} подписчиков</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleCreateChannel}
        style={styles.createChannelButton}
      >
        <Text style={styles.createChannelButtonText}>+</Text>
      </TouchableOpacity>
      {subscribedChannels.length === 0 ? (
        <Text style={styles.noChannels}>Пока нет каналов. Создайте один!</Text>
      ) : (
        <FlatList
          data={subscribedChannels}
          renderItem={renderChannel}
          keyExtractor={(item) => item.uniqueId}
          contentContainerStyle={styles.channelList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  createChannelButton: {
    position: 'absolute',
    bottom: 100, // Поднимаем кнопку выше
    right: 40, // Смещаем левее
    backgroundColor: '#2ecc71',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Устанавливаем высокий zIndex, чтобы кнопка была поверх панели
  },
  createChannelButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  noChannels: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  channelList: {
    paddingBottom: 80, // Оставляем место для нижней навигации
  },
  channelCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  channelContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
  },
  channelName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscribers: {
    color: '#aaa',
    fontSize: 14,
  },
});