import { useState } from 'react';

export default function ChannelSettings({ channel, onSave, onCancel }) {
  const [description, setDescription] = useState(channel.description);
  const [avatar, setAvatar] = useState(channel.avatar);
  const [admins, setAdmins] = useState(channel.admins || []);
  const [newAdminId, setNewAdminId] = useState('');

  const handleAddAdmin = () => {
    if (newAdminId.trim() && !admins.includes(newAdminId.trim())) {
      setAdmins([...admins, newAdminId.trim()]);
      setNewAdminId('');
    }
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
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">Administrators</label>
          <div className="mb-2">
            <input
              type="text"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              placeholder="Enter user ID to add as admin"
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
            <button
              onClick={handleAddAdmin}
              className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Admin
            </button>
          </div>
          <ul className="space-y-2">
            {admins.map((adminId) => (
              <li key={adminId} className="flex items-center justify-between text-white">
                <span>{adminId}</span>
                <button
                  onClick={() => handleRemoveAdmin(adminId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  disabled={adminId === channel.ownerId} // Нельзя удалить владельца
                >
                  Remove
                </button>
              </li>
            ))}
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