import React, { useState, useEffect, useRef } from 'react';
import { Song, User } from '../types';
import { Play, Heart, Bookmark, Compass, Sparkles, Music2, X, ExternalLink, Volume2, Share2, Pause, Disc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyEmbed from './SpotifyEmbed';

interface VibeExploreProps {
  songs: Song[];
  user: User;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
}

const VibeExplore: React.FC<VibeExploreProps> = ({ songs, user, onLike, onSave }) => {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [activeVibe, setActiveVibe] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerMode, setPlayerMode] = useState<'preview' | 'full'>('full');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const vibes = Array.from(new Set(songs.map(s => s.vibe)));
  const filteredSongs = activeVibe ? songs.filter(s => s.vibe === activeVibe) : songs;

  useEffect(() => {
    // Reset play state and auto-play when song changes
    setIsPlaying(false);
    if (selectedSong?.previewUrl) {
      setPlayerMode('preview');
      // Small delay to ensure audio element is rendered
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.error("Auto-play failed:", err));
        }
      }, 300);
    } else if (selectedSong?.spotifyId) {
      setPlayerMode('full');
    }
  }, [selectedSong]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Playback failed:", err);
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-black text-white pb-24">
      {/* Header Section */}
      <div className="p-6 md:p-12 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-500">
              <Compass className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Explore</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
              Find Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Frequency</span>
            </h2>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            <button 
              onClick={() => setActiveVibe(null)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                !activeVibe ? 'bg-white text-black border-white' : 'bg-neutral-900 text-gray-500 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              All Vibes
            </button>
            {vibes.map(vibe => (
              <button 
                key={vibe}
                onClick={() => setActiveVibe(vibe)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  activeVibe === vibe ? 'bg-purple-500 text-white border-purple-500' : 'bg-neutral-900 text-gray-500 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {vibe}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Vibe Stories (Instagram Style) */}
        <div className="flex gap-6 overflow-x-auto py-4 no-scrollbar">
          {songs.filter(s => s.isTrending).map((song, i) => (
            <motion.div 
              key={song.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 cursor-pointer group"
              onClick={() => setSelectedSong(song)}
            >
              <div className="relative p-1 rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-black overflow-hidden bg-neutral-900">
                  <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" referrerPolicy="no-referrer" />
                </div>
                <div className="absolute bottom-0 right-0 bg-purple-500 p-1.5 rounded-full border-2 border-black">
                   <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">
                {song.artist.split(' ')[0]}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Explore Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredSongs.map((song, i) => (
            <motion.div 
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-[3/4] rounded-[32px] overflow-hidden cursor-pointer"
              onClick={() => setSelectedSong(song)}
            >
              <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end gap-2">
                <div className="flex items-center gap-2">
                  {song.isTrending && (
                    <span className="px-2 py-0.5 bg-purple-500 text-[8px] font-black uppercase tracking-widest rounded-full">Trending</span>
                  )}
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/60">#{song.genre}</span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-none group-hover:text-purple-400 transition-colors">
                  {song.title}
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{song.artist}</p>
              </div>

              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSong(song);
                  }}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current ml-1" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Immersive Player Portal */}
      <AnimatePresence>
        {selectedSong && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Atmospheric Background */}
            <div className="absolute inset-0 z-0">
              <motion.img 
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1.1, opacity: 0.5 }}
                src={selectedSong.coverUrl} 
                className="w-full h-full object-cover blur-[100px]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black"></div>
            </div>

            {/* Close Button */}
            <motion.button 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setSelectedSong(null)}
              className="absolute top-8 right-8 z-[110] w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/20 transition"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Player Content */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-12 md:gap-24 p-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="relative w-full max-w-md aspect-square rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(168,85,247,0.3)] border border-white/10 group/cover"
              >
                <img src={selectedSong.coverUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                
                {/* Play/Pause Overlay for Preview */}
                {selectedSong.previewUrl && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                    <button 
                      onClick={togglePlayback}
                      className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 hover:scale-110 transition"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-white" /> : <Play className="w-10 h-10 fill-white ml-2" />}
                    </button>
                  </div>
                )}
                
                {/* Audio Visualizer Mockup */}
                {isPlaying && (
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1 h-8">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [10, 32, 10] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-purple-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              <div className="flex-1 space-y-12 text-center md:text-left">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-center md:justify-start gap-3"
                  >
                    <span className="px-4 py-1.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedSong.vibe}
                    </span>
                    <span className="px-4 py-1.5 bg-white/5 text-gray-400 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedSong.language}
                    </span>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500"
                  >
                    {selectedSong.title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl md:text-4xl text-purple-400 font-medium tracking-tight"
                  >
                    {selectedSong.artist}
                  </motion.p>
                  
                  {selectedSong.lyricsSnippet && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="mt-6 p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 mb-3 flex items-center justify-center md:justify-start gap-2">
                        <Sparkles className="w-3 h-3" />
                        30s Lyric Highlight
                      </p>
                      <p className="text-lg md:text-xl font-bold text-white leading-relaxed italic">
                        "{selectedSong.lyricsSnippet}"
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Player Mode Toggle */}
                {selectedSong.spotifyId && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-white/5 p-1 rounded-full border border-white/10 flex gap-1">
                      <button 
                        onClick={() => setPlayerMode('preview')}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          playerMode === 'preview' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        30s Preview
                      </button>
                      <button 
                        onClick={() => setPlayerMode('full')}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          playerMode === 'full' ? 'bg-[#1DB954] text-white shadow-lg shadow-green-500/20' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Full Player
                      </button>
                    </div>
                  </div>
                )}

                {/* Spotify Preview or Full Player */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="w-full min-h-[80px] md:min-h-[320px] rounded-3xl overflow-hidden bg-neutral-900/50 border border-white/10 backdrop-blur-md flex items-center justify-center"
                >
                  {playerMode === 'full' && selectedSong.spotifyId ? (
                    <SpotifyEmbed trackId={selectedSong.spotifyId} height={320} />
                  ) : selectedSong.previewUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-6">
                      <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        <Volume2 className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-white mb-4">30-Second Preview</p>
                        <audio 
                          ref={audioRef}
                          key={selectedSong.id}
                          controls 
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          onEnded={() => setIsPlaying(false)}
                          className="w-full max-w-md h-10 accent-purple-500"
                          src={selectedSong.previewUrl}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Music2 className="w-8 h-8 text-gray-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase tracking-widest text-white">Preview not available</p>
                        <p className="text-xs text-gray-500 font-medium">This track doesn't support direct previews.</p>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Actions */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-center md:justify-start gap-6"
                >
                  <button 
                    onClick={() => onLike(selectedSong.id)}
                    className={`p-6 rounded-full border transition-all ${
                      user.likedSongs.includes(selectedSong.id) 
                        ? 'bg-pink-500 border-pink-500 text-white shadow-xl shadow-pink-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Heart className="w-8 h-8" fill={user.likedSongs.includes(selectedSong.id) ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => onSave(selectedSong.id)}
                    className={`p-6 rounded-full border transition-all ${
                      user.savedSongs.includes(selectedSong.id) 
                        ? 'bg-purple-500 border-purple-500 text-white shadow-xl shadow-purple-500/30' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Bookmark className="w-8 h-8" fill={user.savedSongs.includes(selectedSong.id) ? "currentColor" : "none"} />
                  </button>
                  <div className="flex-1 flex gap-3">
                    <a 
                      href={selectedSong.spotifyId ? `https://open.spotify.com/track/${selectedSong.spotifyId}` : `https://open.spotify.com/search/${encodeURIComponent(selectedSong.title + ' ' + selectedSong.artist)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-[#1DB954] text-white font-black py-6 rounded-full hover:bg-[#1ed760] transition uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-green-500/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Listen Full
                    </a>
                    <button className="p-6 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition">
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VibeExplore;
