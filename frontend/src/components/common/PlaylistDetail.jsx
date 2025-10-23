import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Folder, List, ChevronLeft, Play, BookOpen, X 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosClient from '../../utils/axiosClient';

const PlaylistDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(location.state?.playlist || null);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaylistData = async () => {
      try {
        setLoading(true);
        
        if (location.state?.playlist) {
          setPlaylist(location.state.playlist);
          setProblems(location.state.playlist.problems || []);
          return;
        }

        const { data } = await axiosClient.get(`/playlists/${id}`, {
          params: { populateProblems: true }
        });

        if (!data) {
          throw new Error('Playlist not found');
        }

        setPlaylist(data);
        setProblems(data.problems || []);
        
      } catch (err) {
        console.error('Error fetching playlist data:', err);
        toast.error('Failed to load playlist data');
        setPlaylist(null);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistData();
  }, [id, location.state]);

  const handleRemoveFromPlaylist = async (problemId) => {
    try {
      const { data } = await axiosClient.delete(
        `/playlists/${id}/problems/${problemId}`
      );
      
      if (data.success) {
        setPlaylist(data.data);
        setProblems(data.data.problems);
        toast.success('Problem removed from playlist');
      }
    } catch (err) {
      console.error('Error removing problem:', err);
      toast.error('Failed to remove problem from playlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500/20 border-t-orange-500 mx-auto mb-4"></div>
          <div className="text-slate-300 font-medium">Loading Playlist...</div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-full bg-slate-700/50 border border-slate-600/30 w-fit mx-auto mb-4">
            <X className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Playlist Not Found</h3>
          <NavLink 
            to="/problems" 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 mx-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Problems
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <NavLink 
            to="/problems" 
            className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Problems
          </NavLink>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
                try {
                  await axiosClient.delete(`/playlists/${id}`);
                  toast.success('Playlist deleted successfully');
                  // Redirect to playlists or problems page after deletion
                  // Use react-router navigation instead of window.location.href for SPA behavior
                  navigate('/problems');
                } catch (error) {
                  console.error('Failed to delete playlist:', error);
                  toast.error('Failed to delete playlist');
                }
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-md transition-colors"
            title="Delete Playlist"
          >
            Delete Playlist
          </button>
        </div>

        <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/30 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Folder className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{playlist.name}</h1>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <List className="w-4 h-4" />
                <span>{playlist.problems?.length || 0} problems</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {problems.length > 0 ? (
            problems.map(problem => (
              <div 
                key={problem._id} 
                className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl p-6 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="text-xl font-semibold text-white hover:text-orange-400 transition-colors"
                    >
                      {problem.title}
                    </NavLink>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      problem.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      problem.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveFromPlaylist(problem._id)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove from playlist"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <NavLink 
                      to={`/problem/${problem._id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                    >
                      <Play className="w-4 h-4" />
                      Solve
                    </NavLink>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-slate-700/50 border border-slate-600/30 w-fit mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Problems in This Playlist</h3>
              <p className="text-slate-400 mb-6">Add problems to this playlist from the problems page.</p>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default PlaylistDetail;