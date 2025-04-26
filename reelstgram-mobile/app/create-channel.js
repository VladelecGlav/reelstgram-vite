import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { nanoid } from 'nanoid/non-secure';
import analytics from '@react-native-firebase/analytics';

export default function CreateChannelScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentUser] = useState('default-user'); // Для примера, можно заменить на реального пользователя

  useEffect(() => {
    const logScreenView = async () => {
      await analytics().logScreenView({
        screen_name: 'CreateChannel',
        screen_class: 'CreateChannelScreen',
      });
    };
    logScreenView();
  }, []);

  const handleCreateChannel = async () => {
    if (!name || !description) {
      await analytics().logEvent('create_channel_failed', {
        reason: 'missing_fields',
      });
      Alert.alert('Error', 'Please fill in both name and description.');
      return;
    }

    const newChannel = {
      id: Date.now(),
      uniqueId: nanoid(),
      name,
      description,
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

    await analytics().logEvent('create_channel_success', {
      channel_id: newChannel.uniqueId,
      channel_name: newChannel.name,
      user_id: currentUser,
    });

    Alert.alert('Success', 'Channel created successfully!');
    router.back();
  };

  const handleCancel = async () => {
    await analytics().logEvent('create_channel_cancel', {});
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Channel</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Channel Name"
        placeholderTextColor="#aaa"
        style={styles.input}
      />
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor="#aaa"
        style={styles.input}
        multiline
      />
      <TouchableOpacity onPress={handleCreateChannel} style={styles.createButton}>
        <Text style={styles.createButtonText}>Create Channel</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
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
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});