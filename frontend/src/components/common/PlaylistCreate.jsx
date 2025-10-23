import React, { useState } from 'react';
import axiosClient from '../../utils/axiosClient';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlaylistCreate = ({ onCreate }) => {
  const [playlistName, setPlaylistName] = useState('');
  const [loading, setLoading] = useState(false);

  const createPlaylist = async () => {
    if (!playlistName.trim()) {
      toast.error('Playlist name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosClient.post('/playlists', { name: playlistName.trim() });
      if (response.data.success) {
        toast.success('Playlist created successfully');
        setPlaylistName('');
        if (onCreate) {
          onCreate(response.data.data);
        }
      } else {
        toast.error('Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      createPlaylist();
    }
  };

  return (
    <div className="playlist-create-container">
      <input
        type="text"
        placeholder="Enter playlist name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="playlist-input"
      />
      <button
        onClick={createPlaylist}
        disabled={loading}
        className="playlist-create-button"
      >
        {loading ? 'Creating...' : 'Create Playlist'}
      </button>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default PlaylistCreate;
