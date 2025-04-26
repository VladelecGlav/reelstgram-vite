import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';

export default function WelcomeScreen() {
  const router = useRouter();
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    const logScreenView = async () => {
      await analytics().logScreenView({
        screen_name: 'Welcome',
        screen_class: 'WelcomeScreen',
      });
    };
    logScreenView();

    const loadChannels = async () => {
      let savedChannels = await AsyncStorage.getItem('channels');
      if (!savedChannels) {
        savedChannels = [
          {
            id: 1,
            uniqueId: 'channel1',
            name: 'Channel 1',
            description: 'Welcome to Channel 1!',
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
                caption: 'First post in Channel 1',
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
            name: 'Channel 2',
            description: 'Welcome to Channel 2!',
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
                caption: 'First post in Channel 2',
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

  const popularChannels = channels
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5);

  const handleSelectChannel = async (channel) => {
    await analytics().logEvent('select_channel', {
      channel_id: channel.uniqueId,
      channel_name: channel.name,
    });
    router.push(`/channel/${channel.uniqueId}`);
  };

  const handleOpenMenu = async () => {
    await analytics().logEvent('open_menu', {});
    router.push('/menu');
  };

  const handleCreateChannel = async () => {
    await analytics().logEvent('create_channel_start', {});
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
          <Text style={styles.subscribers}>{item.subscribers.toLocaleString()} subscribers</Text>
        </View>
      </View>
      <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleOpenMenu}
        style={styles.menuButton}
      >
        <Text style={styles.menuButtonText}>☰</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleCreateChannel}
        style={styles.createChannelButton}
      >
        <Text style={styles.createChannelButtonText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Welcome to Reelstgram!</Text>
      <Text style={styles.subtitle}>Discover and share amazing content in our channels.</Text>
      <Text style={styles.sectionTitle}>Popular Channels</Text>
      {popularChannels.length === 0 ? (
        <Text style={styles.noChannels}>No channels yet. Create one!</Text>
      ) : (
        <FlatList
          data={popularChannels}
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
  menuButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createChannelButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  createChannelButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  noChannels: {
    color: '#aaa',
    textAlign: 'center',
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
});