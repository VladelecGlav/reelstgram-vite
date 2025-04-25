import { useState } from 'react';

export default function ChannelSettings({ channel, onSave, onCancel }) {
  const [description, setDescription] = useState(channel.description || '');
  const [avatar, setAvatar] = useState(channel.avatar || '');
  const [error, setError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024; // 2 МБ в байтах
      if (file.size > maxSize) {
        setError('Avatar size exceeds 2MB limit. Please choose a smaller file.');
        setAvatar('');
        return;
      }

      const filetypes = /jpeg|jpg|png/;
      const extname = filetypes.test(file.name.split('.').pop().toLowerCase());
      const mimetype = filetypes.test(file.type);
      if (!extname || !mimetype) {
        setError('Only images (jpeg, jpg, png) are allowed for avatar');
        setAvatar('');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...channel, description, avatar });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 p-4">
      <h1 className="text-2xl text-white mb-8">Channel Settings - {channel.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-[400px] max-w-[90%]">
        <div className="flex items-center space-x-4">
          {avatar ? (
            <img
              src={avatar}
              alt="Channel avatar preview"
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center border-2 border-gray-500">
              <span className="text-white text-xl">{channel.name[0]}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleAvatarChange}
            className="text-white"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Channel Description"
          className="w-full p-2 rounded text-black"
          rows="4"
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}