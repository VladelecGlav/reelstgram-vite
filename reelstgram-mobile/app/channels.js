import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChannelsScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const loadChannels = async () => {
      let savedChannels = await AsyncStorage.getItem('channels');
      if (savedChannels) {
        setChannels(JSON.parse(savedChannels));
      }
    };
    loadChannels();
  }, []);

  const handleSelectChannel = (channel) => {
    router.push(`/channel/${channel.uniqueId}`);
  };

  const handleBackToHome = () => {
    router.push('/');
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
      <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Каналы</Text>
      {channels.length === 0 ? (
        <Text style={styles.noChannels}>Пока нет каналов. Создайте один!</Text>
      ) : (
        <FlatList
          data={channels}
          renderItem={renderChannel}
          keyExtractor={(item) => item.uniqueId}
          contentContainerStyle={styles.channelList}
        />
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
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  noChannels: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
  },
  channelList: {
    paddingBottom: 20,
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
    marginBottom: 10,
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
  description: {
    color: '#ccc',
    fontSize: 14,
  },
  backButton: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});