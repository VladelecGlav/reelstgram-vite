import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

export default function ContentViewerScreen() {
  const { id } = useLocalSearchParams(); // Получаем параметр id из URL
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPostUrl, setNewPostUrl] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState('default-user'); // Для примера, можно заменить на реального пользователя
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasViewed, setHasViewed] = useState({});
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  // Анимация для свайпов
  const translateY = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    const loadChannel = async () => {
      const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
      const selectedChannel = channels.find((ch) => ch.uniqueId === id);
      if (selectedChannel) {
        setChannel(selectedChannel);
        setPosts(selectedChannel.posts || []);

        if (selectedChannel.posts.length > 0) {
          const viewKey = `${selectedChannel.uniqueId}-${selectedChannel.posts[currentIndex].id}`;
          if (!hasViewed[viewKey]) {
            setHasViewed((prev) => ({ ...prev, [viewKey]: true }));
          }
        }
      }
    };
    loadChannel();
  }, [id, currentIndex]);

  const handleAddPost = async () => {
    if (!newPostUrl || !newPostCaption) return;

    const newPost = {
      id: posts.length + 1,
      url: newPostUrl,
      type: newPostUrl.includes('.mp4') ? 'video' : 'image',
      caption: newPostCaption,
      likes: 0,
      views: 0,
      buttons: [],
      comments: [],
    };

    const updatedPosts = [...posts, newPost];
    setPosts(updatedPosts);

    // Обновляем канал в AsyncStorage
    const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channel.uniqueId ? { ...ch, posts: updatedPosts } : ch
    );
    await AsyncStorage.setItem('channels', JSON.stringify(updatedChannels));

    setNewPostUrl('');
    setNewPostCaption('');
  };

  const handleLike = async (postId) => {
    const updatedPosts = posts.map((post) =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);

    // Обновляем канал в AsyncStorage
    const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channel.uniqueId ? { ...ch, posts: updatedPosts } : ch
    );
    await AsyncStorage.setItem('channels', JSON.stringify(updatedChannels));
  };

  const handleAddComment = async (postId) => {
    if (!newComment) return;

    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            comments: [...(post.comments || []), { user: currentUser, text: newComment }],
          }
        : post
    );
    setPosts(updatedPosts);

    // Обновляем канал в AsyncStorage
    const channels = JSON.parse(await AsyncStorage.getItem('channels')) || [];
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channel.uniqueId ? { ...ch, posts: updatedPosts } : ch
    );
    await AsyncStorage.setItem('channels', JSON.stringify(updatedChannels));

    setNewComment('');
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (event.translationY > 50 && currentIndex < posts.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        translateY.value = withTiming(0);
      } else if (event.translationY < -50 && currentIndex > 0) {
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        translateY.value = withTiming(0);
      } else {
        translateY.value = withTiming(0);
      }
    });

  const isOwnerOrAdmin = channel?.ownerId === currentUser || channel?.admins.includes(currentUser);

  const copyChannelLink = async () => {
    const channelLink = `https://reelstgram-vite.vercel.app/#/channel/${channel.uniqueId}/post/0`;
    Alert.alert('Ссылка скопирована', channelLink);
  };

  const shareChannelLink = () => {
    const channelLink = `https://reelstgram-vite.vercel.app/#/channel/${channel.uniqueId}/post/0`;
    Alert.alert('Поделиться каналом', 'Поделитесь этой ссылкой: ' + channelLink);
  };

  const toggleChannelInfo = () => {
    setIsChannelInfoOpen(!isChannelInfoOpen);
  };

  const handleAddContentClick = () => {
    if (isOwnerOrAdmin) {
      router.push(`/add-content/${channel.uniqueId}`);
    } else {
      setShowPermissionPrompt(true);
    }
  };

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text style={styles.noChannel}>Канал не найден.</Text>
        <TouchableOpacity
          onPress={() => router.push('/channels')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Вернуться на главную</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.header} onPress={toggleChannelInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{channel.name[0]}</Text>
          </View>
          <View>
            <Text style={styles.title}>{channel.name}</Text>
            <Text style={styles.subscribers}>{channel.subscribers.toLocaleString()} подписчиков</Text>
          </View>
        </TouchableOpacity>

        {isChannelInfoOpen && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <TouchableOpacity onPress={() => setIsChannelInfoOpen(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.modalHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{channel.name[0]}</Text>
                </View>
                <Text style={styles.modalTitle}>{channel.name}</Text>
              </View>
              <Text style={styles.modalSubscribers}>{channel.subscribers.toLocaleString()} подписчиков</Text>
              <TouchableOpacity onPress={copyChannelLink} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Скопировать ссылку на канал</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={shareChannelLink} style={styles.modalButton}>
                <Text style={styles.modalButtonText}>Поделиться каналом</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push('/channels')}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Вернуться</Text>
        </TouchableOpacity>
        <Text style={styles.noPosts}>Пока нет постов. Добавьте контент!</Text>
        <TouchableOpacity onPress={handleAddContentClick} style={styles.addContentButton}>
          <Text style={styles.addContentButtonText}>Добавить контент</Text>
        </TouchableOpacity>

        {showPermissionPrompt && (
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Доступ запрещён</Text>
              <Text style={styles.modalDescription}>
                Только владелец канала или администраторы могут добавлять контент.
              </Text>
              <TouchableOpacity
                onPress={() => setShowPermissionPrompt(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Закрыть</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      {item.type === 'image' ? (
        <Image source={{ uri: item.url }} style={styles.postMedia} resizeMode="cover" />
      ) : (
        <Video
          source={{ uri: item.url }}
          style={styles.postMedia}
          useNativeControls
          resizeMode="contain"
          shouldPlay
          isMuted
          isLooping
        />
      )}
      <Text style={styles.caption}>{item.caption}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.actionButton}>
          <Text style={styles.actionText}>❤️ {item.likes}</Text>
        </TouchableOpacity>
        <Text style={styles.views}>{item.views} просмотров</Text>
      </View>

      <View style={styles.comments}>
        <Text style={styles.commentTitle}>Комментарии</Text>
        {item.comments && item.comments.length > 0 ? (
          item.comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <Text style={styles.commentUser}>{comment.user}:</Text>
              <Text style={styles.commentText}> {comment.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noComments}>Пока нет комментариев.</Text>
        )}
        <View style={styles.commentInputContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Добавить комментарий..."
            placeholderTextColor="#aaa"
            style={styles.commentInput}
          />
          <TouchableOpacity
            onPress={() => handleAddComment(item.id)}
            style={styles.commentButton}
          >
            <Text style={styles.commentButtonText}>Комментировать</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggleChannelInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{channel.name[0]}</Text>
        </View>
        <View>
          <Text style={styles.title}>{channel.name}</Text>
          <Text style={styles.subscribers}>{channel.subscribers.toLocaleString()} подписчиков</Text>
        </View>
      </TouchableOpacity>

      {isChannelInfoOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <TouchableOpacity onPress={() => setIsChannelInfoOpen(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.modalHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{channel.name[0]}</Text>
              </View>
              <Text style={styles.modalTitle}>{channel.name}</Text>
            </View>
            <Text style={styles.modalSubscribers}>{channel.subscribers.toLocaleString()} подписчиков</Text>
            <TouchableOpacity onPress={copyChannelLink} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Скопировать ссылку на канал</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={shareChannelLink} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Поделиться каналом</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.push('/channels')}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>Вернуться</Text>
      </TouchableOpacity>
      <Text style={styles.postCounter}>
        Пост {currentIndex + 1} из {posts.length}
      </Text>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.postContainer, animatedStyle]}>
          {renderPost({ item: posts[currentIndex] })}
        </Animated.View>
      </GestureDetector>

      <TouchableOpacity onPress={handleAddContentClick} style={styles.addContentButton}>
        <Text style={styles.addContentButtonText}>Добавить контент</Text>
      </TouchableOpacity>

      {showPermissionPrompt && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Доступ запрещён</Text>
            <Text style={styles.modalDescription}>
              Только владелец канала или администраторы могут добавлять контент.
            </Text>
            <TouchableOpacity
              onPress={() => setShowPermissionPrompt(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subscribers: {
    fontSize: 14,
    color: '#aaa',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    color: '#aaa',
    fontSize: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalSubscribers: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 15,
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postCounter: {
    position: 'absolute',
    top: 70,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    padding: 5,
    borderRadius: 5,
    zIndex: 10,
  },
  postContainer: {
    flex: 1,
    paddingTop: 100,
    paddingBottom: 80, // Уменьшаем отступ, так как панель стала компактнее
  },
  postCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginHorizontal: 10,
  },
  postMedia: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  caption: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButton: {
    marginRight: 15,
  },
  actionText: {
    color: '#ff5555',
    fontSize: 16,
  },
  views: {
    color: '#aaa',
    fontSize: 14,
  },
  comments: {
    marginTop: 10,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  noComments: {
    color: '#aaa',
    fontSize: 14,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  commentUser: {
    color: '#aaa',
    fontSize: 14,
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  commentButton: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 5,
  },
  commentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addContentButton: {
    position: 'absolute',
    bottom: 80, // Приподнимаем кнопку над навигацией
    right: 20,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 30,
  },
  addContentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noPosts: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  noChannel: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});