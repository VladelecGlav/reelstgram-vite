import { motion } from 'framer-motion';

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
    try {
      await navigator.clipboard.writeText(channelLink);
      alert('Channel link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy it manually: ' + channelLink);
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
      <h1 className="text-white text-2xl mb-4">Welcome, {user.username}!</h1>
      {channels.filter((channel) => user.subscribedChannels.includes(channel.uniqueId)).length === 0 ? (
        <p className="text-gray-400 mb-4">No subscribed channels yet.</p>
      ) : (
        <div className="space-y-2">
          {channels
            .filter((channel) => user.subscribedChannels.includes(channel.uniqueId))
            .map((channel) => (
              <div key={channel.uniqueId} className="flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-64">
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
                </div>
              </div>
            ))}
        </div>
      )}
      <motion.button
        onClick={() => setShowCreateChannel(true)}
        className="mt-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Create New Channel
      </motion.button>
    </div>
  );
}