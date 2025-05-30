import { motion, AnimatePresence } from 'framer-motion';

// Утилита для преобразования текста с URL в кликабельные ссылки
const renderTextWithLinks = (text) => {
  if (!text) return null;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
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

export default function ChannelList({ channels, handleSelectChannel, setShowCreateChannel, onOpenMenu, handleToggleSubscription, user }) {
  const copyChannelLink = async (channel) => {
    const channelLink = `${window.location.origin}/#/channel/${channel.uniqueId}/post/0`;
    const telegramLink = `t.me/MyMiniAppBot?start=channel_${channel.uniqueId}`;
    
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.openLink(telegramLink);
        console.log('Opening Telegram link inside Mini App:', telegramLink);
      } else {
        await navigator.clipboard.writeText(channelLink);
        alert('Channel link copied to clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy it manually: ' + channelLink);
    }
  };

  const shareChannelLink = (channel) => {
    const telegramLink = `t.me/MyMiniAppBot?start=channel_${channel.uniqueId}`;
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(telegramLink)}&text=Check out this channel: ${channel.name}`);
      console.log('Sharing Telegram link:', telegramLink);
    } else {
      alert('Sharing is only available in Telegram Mini App.');
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <button
        onClick={onOpenMenu}
        className="fixed top-4 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
      >
        ☰
      </button>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-white text-2xl mb-4"
      >
        Welcome, {user.username}!
      </motion.h1>
      <AnimatePresence>
        {channels.filter((channel) => user.subscribedChannels.includes(channel.uniqueId)).length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400 mb-4"
          >
            No subscribed channels yet.
          </motion.p>
        ) : (
          <div className="space-y-2">
            {channels
              .filter((channel) => user.subscribedChannels.includes(channel.uniqueId))
              .map((channel, index) => (
                <motion.div
                  key={channel.uniqueId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-64"
                >
                  <motion.button
                    onClick={() => handleSelectChannel(channel)}
                    className="flex items-center space-x-2 flex-1 text-left"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                    <div className="flex-1">
                      <span>{channel.name}</span>
                      {channel.description && (
                        <p className="text-sm text-gray-300 truncate">
                          {renderTextWithLinks(channel.description)}
                        </p>
                      )}
                    </div>
                  </motion.button>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleToggleSubscription(channel.uniqueId)}
                      className={`px-2 py-1 rounded text-sm ${
                        user.subscribedChannels.includes(channel.uniqueId)
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      title={user.subscribedChannels.includes(channel.uniqueId) ? 'Unsubscribe' : 'Subscribe'}
                    >
                      {user.subscribedChannels.includes(channel.uniqueId) ? 'Unsub' : 'Sub'}
                    </button>
                    <button
                      onClick={() => copyChannelLink(channel)}
                      className="px-2 py-1 rounded text-sm bg-gray-500 hover:bg-gray-600"
                      title="Copy channel link"
                    >
                      🔗
                    </button>
                    <button
                      onClick={() => shareChannelLink(channel)}
                      className="px-2 py-1 rounded text-sm bg-purple-500 hover:bg-purple-600"
                      title="Share channel"
                    >
                      📤
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setShowCreateChannel(true)}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow-lg"
        whileHover={{ scale: 1.1, boxShadow: "0px 0px 15px rgba(34, 197, 94, 0.5)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        Create New Channel
      </motion.button>
    </div>
  );
}