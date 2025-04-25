import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChannelSettings({ channel, onSave, onCancel, allUsers }) {
  const [description, setDescription] = useState(channel.description);
  const [avatar, setAvatar] = useState(channel.avatar);
  const [admins, setAdmins] = useState(channel.admins || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Фильтрация пользователей по запросу
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !admins.includes(user.userId) &&
        user.userId !== channel.ownerId
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]);
      setShowDropdown(false);
    }
  }, [searchQuery, allUsers, admins, channel.ownerId]);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddAdmin = (userId) => {
    if (!admins.includes(userId)) {
      setAdmins([...admins, userId]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveAdmin = (adminId) => {
    setAdmins(admins.filter((id) => id !== adminId));
  };

  const handleSubmit = () => {
    onSave({
      ...channel,
      description,
      avatar,
      admins,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%]">
        <h2 className="text-xl font-bold text-white mb-4">Channel Settings</h2>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white"
            rows="3"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Avatar URL</label>
          <input
            type="text"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
            placeholder="Enter image URL"
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <div className="mb-4 relative">
          <label className="block text-gray-300 mb-1">Administrators</label>
          <div className="mb-2 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by name..."
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <AnimatePresence>
              {showDropdown && filteredUsers.length > 0 && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 w-full mt-1 bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {filteredUsers.map((user) => (
                    <motion.div
                      key={user.userId}
                      whileHover={{ backgroundColor: '#4a5568' }}
                      className="p-2 text-white cursor-pointer"
                      onClick={() => handleAddAdmin(user.userId)}
                    >
                      {user.username} ({user.userId})
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ul className="space-y-2">
            {admins.map((adminId) => {
              const adminUser = allUsers.find((u) => u.userId === adminId);
              return (
                <motion.li
                  key={adminId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between text-white bg-gray-800 p-2 rounded"
                >
                  <span>{adminUser ? `${adminUser.username} (${adminId})` : adminId}</span>
                  <button
                    onClick={() => handleRemoveAdmin(adminId)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    disabled={adminId === channel.ownerId}
                  >
                    Remove
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}