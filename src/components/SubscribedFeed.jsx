import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Post from './Post';

export default function SubscribedFeed({ channels, onLike, onView, onOpenMenu }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScroll, setCanScroll] = useState(true);
  const [direction, setDirection] = useState(0);
  const viewedPostsRef = useRef(new Set()); // Используем useRef вместо состояния

  // Собираем все посты из подписанных каналов
  useEffect(() => {
    const subscribedChannels = channels.filter((channel) => channel.subscribed);
    const allPosts = subscribedChannels.flatMap((channel) =>
      channel.posts.map((post) => ({
        ...post,
        channelId: channel.uniqueId,
        channelName: channel.name,
      }))
    );
    setPosts(allPosts);
  }, [channels]);

  // Увеличиваем просмотры только один раз для каждого поста
  useEffect(() => {
    if (posts.length > 0 && currentIndex >= 0 && currentIndex < posts.length) {
      const post = posts[currentIndex];
      const viewKey = `${post.channelId}-${post.id}`;
      if (!viewedPostsRef.current.has(viewKey)) {
        console.log("SubscribedFeed.jsx: Incrementing view for post:", post.id, "in channel:", post.channelId);
        onView(post.id, post.channelId);
        viewedPostsRef.current.add(viewKey);
      }
    }
  }, [currentIndex, posts, onView]); // Убрали viewedPosts из зависимостей

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (posts.length > 0 && currentIndex < posts.length - 1) {
        setDirection(1);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
      }
    },
    onSwipedDown: () => {
      if (posts.length > 0 && currentIndex > 0) {
        setDirection(-1);
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
      }
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  useEffect(() => {
    const handleWheel = (event) => {
      if (!canScroll) return;

      const threshold = 50;
      if (event.deltaY > threshold && currentIndex < posts.length - 1) {
        setCanScroll(false);
        setDirection(1);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
      } else if (event.deltaY < -threshold && currentIndex > 0) {
        setCanScroll(false);
        setDirection(-1);
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, canScroll, posts]);

  const handleAnimationComplete = () => {
    setCanScroll(true);
  };

  const handleOpenMenu = () => {
    console.log('SubscribedFeed.jsx: Opening menu');
    onOpenMenu();
  };

  const handleBack = () => {
    console.log('SubscribedFeed.jsx: Going back');
    navigate('/');
  };

  const handleChannelClick = () => {
    console.log('SubscribedFeed.jsx: Navigating to channel', posts[currentIndex].channelId, 'post', posts[currentIndex].id);
    navigate(`/channel/${posts[currentIndex].channelId}/post/${posts[currentIndex].id}`);
  };

  if (posts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <button
          onClick={handleOpenMenu}
          className="fixed top-14 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
        >
          ☰
        </button>
        <p className="text-white text-lg">No posts from subscribed channels.</p>
      </div>
    );
  }

  const variants = {
    initial: (direction) => ({
      y: direction > 0 ? 'calc(100% + 10px)' : 'calc(-100% - 10px)',
      opacity: 1,
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    },
    exit: (direction) => ({
      y: direction > 0 ? 'calc(-100% - 10px)' : 'calc(100% + 10px)',
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeInOut' },
    }),
  };

  return (
    <div className="h-screen overflow-hidden bg-black" {...handlers}>
      <div
        onClick={handleChannelClick}
        className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg z-50 w-[720px] border-b border-gray-700 cursor-pointer"
      >
        <div className="flex items-center p-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">{posts[currentIndex].channelName}</h2>
          </div>
        </div>
      </div>

      <div className="pt-20">
        <button
          onClick={handleOpenMenu}
          className="fixed top-5 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
        >
          ☰
        </button>
        <button
          onClick={handleBack}
          className="fixed top-5 left-16 bg-blue-500 text-white px-4 py-2 rounded z-50"
        >
          Back
        </button>
        <div className="fixed top-5 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded z-50">
          Пост {currentIndex + 1} из {posts.length}
        </div>
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            onAnimationComplete={handleAnimationComplete}
            style={{ position: 'absolute', width: '100%', height: 'calc(100% - 5rem)' }}
          >
            <Post
              post={posts[currentIndex]}
              channelId={posts[currentIndex].channelId}
              onLike={() => {
                console.log('SubscribedFeed.jsx: Calling onLike for post', posts[currentIndex].id);
                onLike(posts[currentIndex].id, posts[currentIndex].channelId);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}