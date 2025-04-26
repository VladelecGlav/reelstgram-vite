import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function WelcomePage({ channels, handleSelectChannel }) {
  const navigate = useNavigate();

  const popularChannels = channels
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Reelstgram!</h1>
        <p className="text-lg mb-6">Discover and share amazing content in our channels.</p>
        <button
          onClick={() => window.open('https://t.me/ReelstgramTestBot', '_blank')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mb-6"
        >
          Open in Telegram
        </button>
        <h2 className="text-2xl font-semibold mb-4">Popular Channels</h2>
        {popularChannels.length === 0 ? (
          <p className="text-gray-400">No channels yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {popularChannels.map((channel) => (
              <motion.div
                key={channel.uniqueId}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 p-4 rounded-lg cursor-pointer"
                onClick={() => handleSelectChannel(channel)}
              >
                <div className="flex items-center space-x-4">
                  {channel.avatar ? (
                    <img
                      src={channel.avatar}
                      alt={`${channel.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500">
                      <span className="text-white text-xl">{channel.name[0]}</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{channel.name}</h3>
                    <p className="text-gray-400">{channel.subscribers.toLocaleString()} subscribers</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mt-2 truncate">{channel.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://t.me/ReelstgramTestBot?start=channel_${channel.uniqueId}`, '_blank');
                  }}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded text-sm"
                >
                  Open in Telegram
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}