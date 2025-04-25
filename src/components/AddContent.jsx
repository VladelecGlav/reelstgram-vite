import { useState } from 'react';

export default function AddContent({ channel, onSave, onCancel }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [buttons, setButtons] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('channelId', channel.id);

    try {
      const response = await fetch('/api/upload', { // Используем Vercel Serverless Function
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('AddContent.jsx: File uploaded successfully:', data);

      onSave({
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: data.url,
        caption,
        buttons,
      });
    } catch (error) {
      console.error('AddContent.jsx: Error uploading file:', error);
      alert('Failed to upload file.');
    }
  };

  const handleAddButton = () => {
    setButtons([...buttons, { text: '', url: '' }]);
  };

  const handleRemoveButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const handleButtonChange = (index, field, value) => {
    const updatedButtons = buttons.map((button, i) =>
      i === index ? { ...button, [field]: value } : button
    );
    setButtons(updatedButtons);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black">
      <div className="bg-gray-900 p-6 rounded-lg w-[400px] max-w-[90%]">
        <h2 className="text-xl font-semibold text-white mb-4">Add Content to {channel.name}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Select File (Image or Video)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="w-full p-2 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter caption..."
              className="w-full p-2 rounded bg-gray-800 text-white"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">URL Buttons</label>
            {buttons.map((button, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                  placeholder="Button Text"
                  className="flex-1 p-2 rounded bg-gray-800 text-white"
                />
                <input
                  type="url"
                  value={button.url}
                  onChange={(e) => handleButtonChange(index, 'url', e.target.value)}
                  placeholder="Button URL"
                  className="flex-1 p-2 rounded bg-gray-800 text-white"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveButton(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddButton}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Add Button
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}