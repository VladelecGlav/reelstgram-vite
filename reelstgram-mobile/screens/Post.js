import { StyleSheet, View, Image } from 'react-native';
import { Video } from 'expo-av';

export default function Post({ post, channelId, onLike, navigate }) {
  return (
    <View style={styles.container}>
      {post.type === 'image' ? (
        <Image source={{ uri: post.url }} style={styles.media} resizeMode="cover" />
      ) : (
        <Video
          source={{ uri: post.url }}
          style={styles.media}
          useNativeControls
          resizeMode="contain"
          shouldPlay
          isMuted
          isLooping
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
});