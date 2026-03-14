
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, UserRole, Song, Language, AIRecommendation } from './types';
import { INITIAL_SONGS } from './constants';
import { analyzeMood, analyzePhoto } from './services/geminiService';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import SavedSongs from './components/SavedSongs';
import Footer from './components/Footer';

import { motion, AnimatePresence } from 'framer-motion';
import { Music2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);
  const [currentView, setCurrentView] = useState<'dashboard' | 'admin' | 'saved'>('dashboard');
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AIRecommendation | null>(null);
  const [analysisSource, setAnalysisSource] = useState<'mood' | 'photo' | null>(null);

  // 1. Initial Load: Only on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('vibeSnap_token');
      if (token) {
        try {
          const response = await axios.get('/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
        } catch (err) {
          console.error('Failed to fetch user:', err);
          localStorage.removeItem('vibeSnap_token');
        }
      } else {
        const savedUser = localStorage.getItem('vibeSnap_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    };
    
    fetchUser();

    const savedCustomSongs = localStorage.getItem('vibeSnap_custom_songs');
    if (savedCustomSongs) {
      const customSongs: Song[] = JSON.parse(savedCustomSongs);
      setSongs(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const uniqueCustom = customSongs.filter(s => !existingIds.has(s.id));
        return [...prev, ...uniqueCustom];
      });
    }
  }, []);

  const syncUserData = async (updatedData: Partial<User>) => {
    const token = localStorage.getItem('vibeSnap_token');
    if (token) {
      try {
        await axios.post('/api/user/sync', updatedData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to sync user data:', err);
      }
    }
  };

  // 2. Spotify Message Listener: Use functional update to avoid dependency loop
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        const { accessToken } = event.data.payload;
        setUser(prev => {
          if (!prev) return null;
          const updatedUser = { ...prev, spotifyToken: accessToken };
          localStorage.setItem('vibeSnap_user', JSON.stringify(updatedUser));
          syncUserData({ spotifyToken: accessToken });
          return updatedUser;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleAuth = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('vibeSnap_user', JSON.stringify(loggedInUser));
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vibeSnap_user');
    localStorage.removeItem('vibeSnap_token');
    setCurrentView('dashboard');
    setCurrentAnalysis(null);
    setAnalysisSource(null);
  }, []);

  const toggleLike = useCallback((songId: string) => {
    setUser(prev => {
      if (!prev) return null;
      const isLiked = prev.likedSongs.includes(songId);
      const updatedUser = {
        ...prev,
        likedSongs: isLiked 
          ? prev.likedSongs.filter(id => id !== songId) 
          : [...prev.likedSongs, songId]
      };
      localStorage.setItem('vibeSnap_user', JSON.stringify(updatedUser));
      syncUserData({ likedSongs: updatedUser.likedSongs });
      return updatedUser;
    });
  }, []);

  const toggleSave = useCallback((songId: string, songData?: Song) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      
      const isSaved = prevUser.savedSongs.includes(songId);

      // LOGIC FIX: If saving an AI track, we must register it in the master 'songs' list
      if (!isSaved && (songId.startsWith('ai-') || songData)) {
        setSongs(prevSongs => {
          if (prevSongs.find(s => s.id === songId)) return prevSongs;
          
          let newSong: Song | undefined = songData;

          if (!newSong && songId.startsWith('ai-')) {
            const aiTrack = currentAnalysis?.recommendedTracks.find(t => 
              `ai-${t.title}-${t.artist}`.replace(/\s+/g, '-').toLowerCase() === songId
            );

            if (aiTrack) {
              newSong = {
                id: songId,
                title: aiTrack.title,
                artist: aiTrack.artist,
                genre: aiTrack.tags[0] || 'Discovery',
                vibe: currentAnalysis?.vibe || 'AI Mix',
                language: Language.MIX,
                previewUrl: aiTrack.previewUrl || '', 
                coverUrl: `https://picsum.photos/seed/${songId}/800/1200`,
                isTrending: false,
                createdBy: 'ai',
                spotifyId: aiTrack.spotifyId,
                lyricsSnippet: aiTrack.lyricsSnippet
              };
            }
          }

          if (newSong) {
            const updatedSongs = [...prevSongs, newSong];
            // Persist only the AI discovered songs to local storage
            const customOnly = updatedSongs.filter(s => s.createdBy === 'ai');
            localStorage.setItem('vibeSnap_custom_songs', JSON.stringify(customOnly));
            return updatedSongs;
          }
          return prevSongs;
        });
      }

      const updatedUser = {
        ...prevUser,
        savedSongs: isSaved 
          ? prevUser.savedSongs.filter(id => id !== songId) 
          : [...prevUser.savedSongs, songId]
      };
      localStorage.setItem('vibeSnap_user', JSON.stringify(updatedUser));
      syncUserData({ savedSongs: updatedUser.savedSongs });
      return updatedUser;
    });
  }, [currentAnalysis]);

  const onMoodSubmit = useCallback(async (mood: string, prefLanguage: Language) => {
    setIsLoading(true);
    try {
      const analysis = await analyzeMood(mood, prefLanguage);
      setCurrentAnalysis(analysis);
      setAnalysisSource('mood');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onPhotoSubmit = useCallback(async (base64: string, prefLanguage: Language) => {
    setIsLoading(true);
    try {
      const analysis = await analyzePhoto(base64, prefLanguage);
      setCurrentAnalysis(analysis);
      setAnalysisSource('photo');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNavigate = useCallback((view: 'dashboard' | 'admin' | 'saved') => {
    setCurrentView(view);
    if (view !== 'dashboard') {
      setCurrentAnalysis(null);
      setAnalysisSource(null);
    }
  }, []);

  const trendingSongs = useMemo(() => 
    songs.filter(s => s.isTrending || s.createdBy === 'admin'),
  [songs]);

  const userSavedSongs = useMemo(() => {
    if (!user) return [];
    return songs.filter(s => user.savedSongs.includes(s.id));
  }, [songs, user?.savedSongs]);

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        currentView={currentView} 
        onNavigate={handleNavigate} 
      />
      
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
            >
              <div className="relative flex items-center justify-center mb-8">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-32 h-32 bg-purple-600/30 blur-xl"
                />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/50 relative z-10"
                >
                  <Music2 className="w-10 h-10 text-white" />
                </motion.div>
                <motion.div
                  animate={{ y: [-10, 10, -10], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 text-purple-300"
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </div>
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-center space-y-2"
              >
                <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Tuning to your soul</h3>
                <p className="text-purple-400 text-xs font-bold uppercase tracking-[0.3em]">AI is analyzing your vibe...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {currentView === 'dashboard' && (
          <Dashboard 
            user={user}
            onMoodSubmit={onMoodSubmit} 
            onPhotoSubmit={onPhotoSubmit}
            analysis={currentAnalysis}
            analysisSource={analysisSource}
            onClearAnalysis={() => {
                setCurrentAnalysis(null);
                setAnalysisSource(null);
            }}
            onSaveTrack={toggleSave}
          />
        )}

        {currentView === 'admin' && user.role === UserRole.ADMIN && (
          <AdminDashboard 
            songs={songs} 
            onUpdateSongs={setSongs} 
          />
        )}

        {currentView === 'saved' && (
          <SavedSongs 
            songs={userSavedSongs} 
            onGoToReels={() => setCurrentView('dashboard')}
            onRemoveSong={toggleSave}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;
