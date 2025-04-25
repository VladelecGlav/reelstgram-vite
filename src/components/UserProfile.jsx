import { useState } from 'react';

export default function UserProfile({ user, setUser, channels, onOpenMenu }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [newAvatar, setNewAvatar] = useState(user.avatar);

  const handleSave = () => {
    setUser((prevUser) => ({
      ...prevUser,
      username: newUsername,
      avatar: newAvatar,
    }));
    setIsEditing(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <button
        onClick={onOpenMenu}
        className="fixed top-4 left-4 bg-gray-700 text-white px-4 py-2 rounded z-50"
      >
        ☰
      </button>
      <h1 className="text-white text-2xl mb-4">User Profile</h1>
      <div className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%]">
        {isEditing ? (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-1">Avatar URL</label>
              <input
                type="text"
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                placeholder="Enter image URL"
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User avatar"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center mr-4">
                  <span className="text-white text-2xl">{user.username[0]}</span>
                </div>
              )}
              <div>
                <h2 className="text-white text-xl">{user.username}</h2>
                <p className="text-gray-400 text-sm">User ID: {user.userId}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
              Edit Profile
            </button>
            <h3 className="text-white text-lg mb-2">Subscribed Channels</h3>
            {user.subscribedChannels.length === 0 ? (
              <p className="text-gray-400">No subscriptions yet.</p>
            ) : (
              <ul className="space-y-2">
                {channels
                  .filter((channel) => user.subscribedChannels.includes(channel.uniqueId))
                  .map((channel) => (
                    <li key={channel.uniqueId} className="flex items-center space-x-2">
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
                      <span className="text-white">{channel.name}</span>
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}