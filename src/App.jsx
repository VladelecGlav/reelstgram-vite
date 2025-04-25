import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import ChannelList from './components/ChannelList';
import CreateChannel from './components/CreateChannel';
import AddContent from './components/AddContent';
import ContentViewer from './components/ContentViewer';
import ChannelSettings from './components/ChannelSettings';

function AppContent() {
  console.log("Step 4: App component initialized.");

  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showAddContent, setShowAddContent] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showChannelSettings, setShowChannelSettings] = useState(null);

  const navigate = useNavigate();

  // Инициализация Telegram Web App
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      console.log('Telegram Web App initialized');
      const initData = window.Telegram.WebApp.initDataUnsafe;
      const startParam = initData?.start_param;

      if (startParam && startParam.startsWith('channel_')) {
        const channelId = startParam.replace('channel_', '');
        console.log('Opening channel from Telegram start param:', channelId);
        navigate(`/channel/${channelId}/post/0`);
      }
    }
  }, [navigate]);

  useEffect(() => {
    console.log("Step 5: Loading channels from localStorage...");
    const saved = localStorage.getItem("channels");
    if (saved) {
      const parsedChannels = JSON.parse(saved);
      const updatedChannels = parsedChannels.map((channel) => ({
        ...channel,
        avatar: channel.avatar || '',
        uniqueId: channel.uniqueId || nanoid(8),
        subscribed: channel.subscribed ?? false,
        subscribers: channel.subscribers ?? Math.floor(Math.random() * 4900) + 100,
        posts: channel.posts.map((post) => {
          const updatedPost = {
            ...post,
            likes: post.likes || 0,
            views: post.views || 0,
            buttons: post.buttons || [
              { text: "Visit Website", url: "https://example.com" },
              { text: "Join Chat", url: "https://t.me/examplechat" },
            ],
          };
          console.log("Post buttons after update:", updatedPost.buttons); // Отладка
          return updatedPost;
        }),
      }));
      console.log("Step 6: Channels loaded:", updatedChannels);
      setChannels(updatedChannels);
      localStorage.setItem("channels", JSON.stringify(updatedChannels));
    } else {
      console.log("Step 6: No channels found in localStorage.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    console.log("Step 7: Saving channels to localStorage...");
    localStorage.setItem("channels", JSON.stringify(channels));
  }, [channels]);

  const handleCreateChannel = ({ name, description }) => {
    console.log("Creating new channel:", { name, description });
    const newChannel = {
      id: channels.length + 1,
      uniqueId: nanoid(8),
      name,
      description,
      avatar: '',
      subscribed: true,
      subscribers: Math.floor(Math.random() * 4900) + 100,
      posts: [],
    };
    setChannels([...channels, newChannel]);
    setShowCreateChannel(false);
    setIsMenuOpen(false);
  };

  const handleAddContent = (channel, content) => {
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channel.uniqueId
        ? {
            ...ch,
            posts: [
              ...ch.posts,
              {
                id: ch.posts.length + 1,
                ...content,
                likes: 0,
                views: 0,
                buttons: content.buttons || [],
              },
            ],
          }
        : ch
    );
    setChannels(updatedChannels);
    setShowAddContent(null);
  };

  const handleLike = (postId, channelUniqueId) => {
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channelUniqueId
        ? {
            ...ch,
            posts: ch.posts.map((post) =>
              post.id === postId
                ? { ...post, likes: post.likes + 1 }
                : post
            ),
          }
        : ch
    );
    setChannels(updatedChannels);
  };

  const handleView = (postId, channelUniqueId) => {
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channelUniqueId
        ? {
            ...ch,
            posts: ch.posts.map((post) =>
              post.id === postId
                ? { ...post, views: post.views + 1 }
                : post
            ),
          }
        : ch
    );
    setChannels(updatedChannels);
  };

  const handleUpdateChannel = (updatedChannel) => {
    console.log("Updating channel:", updatedChannel);
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === updatedChannel.uniqueId
        ? { ...ch, description: updatedChannel.description, avatar: updatedChannel.avatar }
        : ch
    );
    setChannels(updatedChannels);
    setShowChannelSettings(null);
    setIsMenuOpen(false);
  };

  const handleSelectChannel = (channel) => {
    setIsMenuOpen(false);
    if (channel.posts.length > 0) {
      navigate(`/channel/${channel.uniqueId}/post/${channel.posts[0].id}`);
    } else {
      navigate(`/channel/${channel.uniqueId}/post/0`);
    }
  };

  const handleToggleSubscription = (channelUniqueId) => {
    const updatedChannels = channels.map((ch) =>
      ch.uniqueId === channelUniqueId
        ? { ...ch, subscribed: !ch.subscribed }
        : ch
    );
    setChannels(updatedChannels);
  };

  const handleOpenSettings = (channel) => {
    setShowChannelSettings(channel);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <p className="text-white text-lg">Loading channels...</p>
      </div>
    );
  }

  return (
    <div className="font-sans relative">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 shadow-lg"
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-white text-2xl"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => setShowCreateChannel(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
              >
                Create Channel
              </button>
              <h3 className="text-lg font-semibold mb-2">Channels</h3>
              {channels.length === 0 ? (
                <p className="text-gray-400">No channels yet.</p>
              ) : (
                <ul className="space-y-2">
                  {channels
                    .filter((channel) => channel.subscribed)
                    .map((channel) => (
                      <li key={channel.uniqueId} className="flex items-center justify-between">
                        <button
                          onClick={() => handleSelectChannel(channel)}
                          className="flex items-center space-x-2 text-left px-4 py-2 hover:bg-gray-700 rounded text-white"
                        >
                          {channel.avatar ? (
                            <img
                              src={channel.avatar}
                              alt={`${channel.name} avatar`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                              <span className="text-white">{channel.name[0]}</span>
                            </div>
                          )}
                          <span>{channel.name}</span>
                        </button>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleToggleSubscription(channel.uniqueId)}
                            className={`px-2 py-1 rounded text-sm ${
                              channel.subscribed
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            title={channel.subscribed ? 'Unsubscribe' : 'Subscribe'}
                          >
                            {channel.subscribed ? 'Unsub' : 'Sub'}
                          </button>
                          <button
                            onClick={() => handleOpenSettings(channel)}
                            className="text-gray-400 hover:text-white"
                            title="Channel Settings"
                          >
                            ⚙️
                          </button>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-40"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-30">
        <Routes>
          <Route
            path="/"
            element={
              <ChannelList
                channels={channels}
                handleSelectChannel={handleSelectChannel}
                setShowCreateChannel={setShowCreateChannel}
                onOpenMenu={() => setIsMenuOpen(true)}
                handleToggleSubscription={handleToggleSubscription}
              />
            }
          />
          <Route
            path="/channel/:uniqueId/post/:postId"
            element={
              <ContentViewer
                channels={channels}
                onBack={() => navigate('/')}
                onLike={handleLike}
                onView={handleView}
                onOpenMenu={() => setIsMenuOpen(true)}
                onAddContent={(channel) => setShowAddContent(channel)}
                onOpenSettings={handleOpenSettings}
                handleToggleSubscription={handleToggleSubscription}
              />
            }
          />
          <Route
            path="*"
            element={
              <div className="h-screen flex flex-col items-center justify-center bg-black">
                <p className="text-white text-lg mb-4">Page not found.</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Go to Home
                </button>
              </div>
            }
          />
        </Routes>
      </div>

      <AnimatePresence>
        {showCreateChannel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <CreateChannel
              onSave={handleCreateChannel}
              onCancel={() => setShowCreateChannel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <AddContent
              channel={showAddContent}
              onSave={(content) => handleAddContent(showAddContent, content)}
              onCancel={() => setShowAddContent(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChannelSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
          >
            <ChannelSettings
              channel={showChannelSettings}
              onSave={handleUpdateChannel}
              onCancel={() => setShowChannelSettings(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}