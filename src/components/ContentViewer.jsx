import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import Post from './Post';

// Утилита для преобразования текста с URL в кликабельные ссылки
const renderTextWithLinks = (text) => {
  if (!text) return 'No description available.';

  // Регулярное выражение для поиска URL
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Разбиваем текст на части: обычный текст и ссылки
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-blue-300"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Функция для записи аналитики в localStorage
const logAnalyticsEvent = (eventType, data) => {
  const timestamp = new Date().toISOString();
  const analyticsData = JSON.parse(localStorage.getItem('analytics')) || [];
  analyticsData.push({ eventType, data, timestamp });
  localStorage.setItem('analytics', JSON.stringify(analyticsData));
  console.log(`Analytics event logged: ${eventType}`, data);
};

// Функция для отправки события в Google Analytics (если GA4 подключён)
const sendGA4Event = (eventName, params) => {
  if (window.gtag) {
    window.gtag('event', eventName, params);
    console.log(`GA4 event sent: ${eventName}`, params);
  } else {
    console.log('GA4 not initialized. Event not sent:', eventName, params);
  }
};

export default function ContentViewer({ channels, onBack, onLike, onView, onOpenMenu, onAddContent, onOpenSettings, handleToggleSubscription }) {
  const { uniqueId, postId } = useParams();
  const navigate = useNavigate();

  const channel = channels.find((ch) => ch.uniqueId === uniqueId);
  const initialIndex = channel?.posts?.findIndex((post) => post.id === parseInt(postId)) || 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [canScroll, setCanScroll] = useState(true);
  const [direction, setDirection] = useState(0);
  const [hasViewed, setHasViewed] = useState({});
  const [isChannelInfoOpen, setIsChannelInfoOpen] = useState(false);
  const [showSubscribePrompt, setShowSubscribePrompt] = useState(false);

  useEffect(() => {
    const newChannel = channels.find((ch) => ch.uniqueId === uniqueId);
    if (newChannel) {
      const newIndex = newChannel.posts.findIndex((post) => post.id === parseInt(postId)) || 0;
      if (newIndex >= 0) {
        setCurrentIndex(newIndex);
      } else {
        setCurrentIndex(0);
        if (newChannel.posts.length > 0) {
          navigate(`/channel/${newChannel.uniqueId}/post/${newChannel.posts[0].id}`);
        } else {
          navigate(`/channel/${newChannel.uniqueId}/post/0`);
        }
      }
      // Проверяем, подписан ли пользователь, и показываем уведомление, если не подписан
      setShowSubscribePrompt(!newChannel.subscribed);

      // Логируем событие перехода по ссылке
      logAnalyticsEvent('link_click', {
        channelId: uniqueId,
        channelName: newChannel.name,
        timestamp: new Date().toISOString(),
      });

      // Отправляем событие в GA4 (если подключён)
      sendGA4Event('link_click', {
        channel_id: uniqueId,
        channel_name: newChannel.name,
      });
    }
  }, [channels, uniqueId, postId, navigate]);

  useEffect(() => {
    if (channel?.posts?.length > 0) {
      const post = channel.posts[currentIndex];
      const viewKey = `${uniqueId}-${post.id}`;
      if (!hasViewed[viewKey]) {
        console.log("ContentViewer.jsx: Incrementing view for post:", post.id, "in channel:", uniqueId);
        onView(post.id, uniqueId);
        setHasViewed((prev) => ({ ...prev, [viewKey]: true }));
      }
    }
  }, [currentIndex, channel, onView, uniqueId]);

  const handlers = useSwipeable({
    onSwipedUp: () => {
      if (channel?.posts?.length > 0 && currentIndex < channel.posts.length - 1) {
        setDirection(1);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        navigate(`/channel/${uniqueId}/post/${channel.posts[nextIndex].id}`);
      }
    },
    onSwipedDown: () => {
      if (channel?.posts?.length > 0 && currentIndex > 0) {
        setDirection(-1);
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        navigate(`/channel/${uniqueId}/post/${channel.posts[prevIndex].id}`);
      }
    },
    trackMouse: true,
    preventDefaultTouchmoveEvent: true,
  });

  useEffect(() => {
    const handleWheel = (event) => {
      if (!canScroll) return;

      const threshold = 50;
      if (event.deltaY > threshold && currentIndex < channel?.posts?.length - 1) {
        setCanScroll(false);
        setDirection(1);
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        navigate(`/channel/${uniqueId}/post/${channel.posts[nextIndex].id}`);
      } else if (event.deltaY < -threshold && currentIndex > 0) {
        setCanScroll(false);
        setDirection(-1);
        const prevIndex = currentIndex - 1;
        setCurrentIndex(prevIndex);
        navigate(`/channel/${uniqueId}/post/${channel.posts[prevIndex].id}`);
      }
    };

    window.addEventListener('wheel', handleWheel);

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentIndex, canScroll, channel?.posts, uniqueId, navigate]);

  const handleAnimationComplete = () => {
    setCanScroll(true);
  };

  const toggleChannelInfo = () => {
    setIsChannelInfoOpen(!isChannelInfoOpen);
  };

  const closeChannelInfo = () => {
    setIsChannelInfoOpen(false);
  };

  const copyChannelLink = async () => {
    const channelLink = `${window.location.origin}/#/channel/${uniqueId}/post/0`;
    try {
      await navigator.clipboard.writeText(channelLink);
      alert('Channel link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy it manually: ' + channelLink);
    }
  };

  const handleSubscribe = () => {
    handleToggleSubscription(uniqueId);
    setShowSubscribePrompt(false);

    // Логируем событие подписки
    logAnalyticsEvent('subscribe', {
      channelId: uniqueId,
      channelName: channel.name,
      timestamp: new Date().toISOString(),
    });

    // Отправляем событие в GA4 (если подключён)
    sendGA4Event('subscribe', {
      channel_id: uniqueId,
      channel_name: channel.name,
    });
  };

  // Если канал не найден, показываем сообщение об ошибке
  if (!channel) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="pt-20 h-screen flex flex-col items-center justify-center">
          <p className="text-white text-lg mb-4">Channel not found.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Если пост не найден или канал пуст
  if (parseInt(postId) === 0 && channel.posts.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div
          onClick={toggleChannelInfo}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg z-50 w-[720px] border-b border-gray-700 cursor-pointer"
        >
          <div className="flex items-center p-4">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={`${channel.name} avatar`}
                className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-gray-600"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
                <span className="text-white text-2xl">{channel.name[0]}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white">{channel.name}</h2>
              <p className="text-gray-300 text-sm">{channel.subscribers.toLocaleString()} subscribers</p>
            </div>
          </div>
        </div>

        {isChannelInfoOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeChannelInfo}
          >
            <div
              className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeChannelInfo}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <button
                onClick={() => {
                  onOpenSettings(channel);
                  closeChannelInfo();
                }}
                className="absolute top-3 right-10 text-gray-400 hover:text-white"
              >
                ⚙️
              </button>
              <div className="flex items-center mb-4">
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={`${channel.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
                    <span className="text-white text-xl">{channel.name[0]}</span>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-white">{channel.name}</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                {renderTextWithLinks(channel.description)}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {channel.subscribers.toLocaleString()} subscribers
              </p>
              <button
                onClick={copyChannelLink}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                Copy Channel Link
              </button>
              <button
                onClick={() => {
                  handleToggleSubscription(channel.uniqueId);
                  closeChannelInfo();
                }}
                className={`mt-2 px-4 py-2 rounded text-white ${
                  channel.subscribed
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </div>
          </div>
        )}

        <div className="pt-20 h-screen flex flex-col items-center justify-center">
          <button
            onClick={onOpenMenu}
            className="fixed top-14 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
          >
            ☰
          </button>
          <button
            onClick={() => {
              console.log("Back button clicked, calling onBack...");
              onBack();
            }}
            className="fixed top-14 left-16 bg-blue-500 text-white px-4 py-2 rounded z-50"
          >
            Back
          </button>
          <p className="text-white text-lg">No posts yet. Add some content!</p>
          <button
            onClick={() => onAddContent(channel)}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded z-50"
          >
            Add Content
          </button>
        </div>

        {/* Уведомление "Подписаться" */}
        <AnimatePresence>
          {showSubscribePrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] text-center z-50 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Subscribe to {channel.name}</h2>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to see the content of this channel.
              </p>
              <button
                onClick={handleSubscribe}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Subscribe
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Если пост не найден
  if (!channel.posts[currentIndex]) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div
          onClick={toggleChannelInfo}
          className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg z-50 w-[720px] border-b border-gray-700 cursor-pointer"
        >
          <div className="flex items-center p-4">
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={`${channel.name} avatar`}
                className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-gray-600"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
                <span className="text-white text-2xl">{channel.name[0]}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-white">{channel.name}</h2>
              <p className="text-gray-300 text-sm">{channel.subscribers.toLocaleString()} subscribers</p>
            </div>
          </div>
        </div>

        {isChannelInfoOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeChannelInfo}
          >
            <div
              className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeChannelInfo}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                ✕
              </button>
              <button
                onClick={() => {
                  onOpenSettings(channel);
                  closeChannelInfo();
                }}
                className="absolute top-3 right-10 text-gray-400 hover:text-white"
              >
                ⚙️
              </button>
              <div className="flex items-center mb-4">
                {channel.avatar ? (
                  <img
                    src={channel.avatar}
                    alt={`${channel.name} avatar`}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
                    <span className="text-white text-xl">{channel.name[0]}</span>
                  </div>
                )}
                <h2 className="text-xl font-semibold text-white">{channel.name}</h2>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                {renderTextWithLinks(channel.description)}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                {channel.subscribers.toLocaleString()} subscribers
              </p>
              <button
                onClick={copyChannelLink}
                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
              >
                Copy Channel Link
              </button>
              <button
                onClick={() => {
                  handleToggleSubscription(channel.uniqueId);
                  closeChannelInfo();
                }}
                className={`mt-2 px-4 py-2 rounded text-white ${
                  channel.subscribed
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            </div>
          </div>
        )}

        <div className="pt-20 h-screen flex flex-col items-center justify-center">
          <p className="text-white text-lg">Post not found.</p>
        </div>

        {/* Уведомление "Подписаться" */}
        <AnimatePresence>
          {showSubscribePrompt && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] text-center z-50 shadow-lg"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Subscribe to {channel.name}</h2>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to see the content of this channel.
              </p>
              <button
                onClick={handleSubscribe}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Subscribe
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const variants = {
    initial: (direction) => ({
      y: direction > 0 ? '100%' : '-100%',
      opacity: 0, // Добавляем затухание
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }, // Быстрее и с кастомным easing
    },
    exit: (direction) => ({
      y: direction > 0 ? '-100%' : '100%',
      opacity: 0, // Добавляем затухание
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  return (
    <div className="h-screen overflow-hidden bg-black" {...handlers}>
      <div
        onClick={toggleChannelInfo}
        className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-gray-900 shadow-lg z-50 w-[720px] border-b border-gray-700 cursor-pointer"
      >
        <div className="flex items-center p-4">
          {channel.avatar ? (
            <img
              src={channel.avatar}
              alt={`${channel.name} avatar`}
              className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-gray-600"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
              <span className="text-white text-2xl">{channel.name[0]}</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-white">{channel.name}</h2>
            <p className="text-gray-300 text-sm">{channel.subscribers.toLocaleString()} subscribers</p>
          </div>
        </div>
      </div>

      {isChannelInfoOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeChannelInfo}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeChannelInfo}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <button
              onClick={() => {
                onOpenSettings(channel);
                closeChannelInfo();
              }}
              className="absolute top-3 right-10 text-gray-400 hover:text-white"
            >
              ⚙️
            </button>
            <div className="flex items-center mb-4">
              {channel.avatar ? (
                <img
                  src={channel.avatar}
                  alt={`${channel.name} avatar`}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-600"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center mr-4 border-2 border-gray-500">
                  <span className="text-white text-xl">{channel.name[0]}</span>
                </div>
              )}
              <h2 className="text-xl font-semibold text-white">{channel.name}</h2>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              {renderTextWithLinks(channel.description)}
            </p>
            <p className="text-gray-400 text-sm mb-4">
              {channel.subscribers.toLocaleString()} subscribers
            </p>
            <button
              onClick={copyChannelLink}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
            >
              Copy Channel Link
            </button>
            <button
              onClick={() => {
                handleToggleSubscription(channel.uniqueId);
                closeChannelInfo();
              }}
              className={`mt-2 px-4 py-2 rounded text-white ${
                channel.subscribed
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
            </button>
          </div>
        </div>
      )}

      <div className="pt-20">
        <button
          onClick={onOpenMenu}
          className="fixed top-5 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
        >
          ☰
        </button>
        <button
          onClick={() => {
            console.log("Back button clicked, calling onBack...");
            onBack();
          }}
          className="fixed top-5 left-16 bg-blue-500 text-white px-4 py-2 rounded z-50"
        >
          Back
        </button>
        <div className="fixed top-5 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded z-50">
          Пост {currentIndex + 1} из {channel.posts.length}
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
              post={channel.posts[currentIndex]}
              channelId={channel.uniqueId}
              onLike={() => onLike(channel.posts[currentIndex].id, uniqueId)}
            />
          </motion.div>
        </AnimatePresence>
        <button
          onClick={() => onAddContent(channel)}
          className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded z-50"
        >
          Add Content
        </button>
      </div>

      {/* Уведомление "Подписаться" */}
      <AnimatePresence>
        {showSubscribePrompt && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%] text-center z-50 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-white mb-4">Subscribe to {channel.name}</h2>
            <p className="text-gray-300 text-sm mb-4">
              Subscribe to see the content of this channel.
            </p>
            <button
              onClick={handleSubscribe}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Subscribe
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}