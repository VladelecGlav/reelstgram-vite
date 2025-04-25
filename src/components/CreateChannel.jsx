import { useState } from 'react';

export default function CreateChannel({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Channel name is required');
      return;
    }

    onSave({ name, description });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 p-4">
      <h1 className="text-2xl text-white mb-8">Create New Channel</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-[400px] max-w-[90%]">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel Name"
          className="w-full p-2 rounded text-black"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Channel Description (optional)"
          className="w-full p-2 rounded text-black"
          rows="4"
        />
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Create
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