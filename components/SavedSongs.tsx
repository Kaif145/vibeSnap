
import React, { useState } from 'react';
import { Song } from '../types';
import { Play, Music2, Sparkles, Search, Disc, X, ExternalLink, MoreVertical, Share2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpotifyEmbed from './SpotifyEmbed';

interface SavedSongsProps {
  songs: Song[];
  onGoToReels: () => void;
  onRemoveSong: (id: string) => void;
}

const SavedSongs: React.FC<SavedSongsProps> = ({ songs, onGoToReels, onRemoveSong }) => {
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<Song | null>(null);

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 max-w-6xl mx-auto space-y-12 pb-24">
      <motion.header 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">Your Collection</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Discovered Vibes & Favorites</p>
      </motion.header>

      {songs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-neutral-900/30 border border-neutral-800 rounded-[40px] p-16 md:p-24 text-center space-y-8 flex flex-col items-center justify-center"
        >
          <div className="w-24 h-24 bg-neutral-800 rounded-3xl flex items-center justify-center text-5xl">
            <Music2 className="w-12 h-12 text-neutral-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase tracking-tight">Your library is silent</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">Use AI on the Dashboard to find tracks that match your mood or aesthetic.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToReels}
            className="bg-white text-black font-black py-5 px-12 rounded-full hover:bg-purple-500 hover:text-white transition-all uppercase tracking-widest text-[10px] shadow-xl"
          >
            Go Discover Music
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {songs.map((song, i) => (
            <motion.div 
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group cursor-pointer space-y-4"
            >
              <div className="aspect-square rounded-[32px] overflow-hidden relative shadow-2xl border border-white/5">
                <img src={song.coverUrl} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" alt={song.title} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                  {song.spotifyId ? (
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setActiveSong(song);
                      }}
                      className="bg-[#1DB954] text-white p-5 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <Play className="w-7 h-7 fill-current" />
                    </motion.button>
                  ) : (
                    <motion.a 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1DB954] text-white p-5 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                    >
                      <Play className="w-7 h-7 fill-current" />
                    </motion.a>
                  )}
                </div>
                {song.createdBy === 'ai' && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600/90 backdrop-blur-md text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10 flex items-center gap-1">
                      <Sparkles className="w-2 h-2" />
                      AI Discover
                    </span>
                  </div>
                )}
              </div>
              <div className="px-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-black text-lg truncate group-hover:text-purple-400 transition-colors uppercase tracking-tight">{song.title}</h4>
                    <p className="text-xs font-bold text-gray-500 truncate uppercase tracking-widest">{song.artist}</p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenFor(song);
                    }}
                    className="p-2 -mr-2 text-neutral-500 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveSong(song)}
                    className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest bg-neutral-900 hover:bg-neutral-800 text-white py-3 rounded-xl transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Play Track
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                    <span className="text-[8px] font-black uppercase tracking-tighter text-neutral-600">#{song.genre}</span>
                    <a 
                      href={song.spotifyId ? `https://open.spotify.com/track/${song.spotifyId}` : `https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] font-black uppercase text-purple-500 hover:underline"
                    >
                      Spotify Link
                    </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {/* 3-Dot Menu Bottom Sheet */}
      <AnimatePresence>
        {menuOpenFor && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-4"
            onClick={() => setMenuOpenFor(null)}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-[32px] p-6 pb-8 shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center gap-4 mb-6 border-b border-neutral-800 pb-4">
                <img src={menuOpenFor.coverUrl} className="w-12 h-12 rounded-xl object-cover" alt={menuOpenFor.title} referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-black uppercase tracking-tight truncate">{menuOpenFor.title}</h4>
                  <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px] truncate">{menuOpenFor.artist}</p>
                </div>
              </div>

              <div className="space-y-2">
                <button 
                  onClick={() => {
                    setActiveSong(menuOpenFor);
                    setMenuOpenFor(null);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-800 transition-colors text-white font-bold uppercase tracking-widest text-xs"
                >
                  <Play className="w-5 h-5 text-purple-400" />
                  Play Track
                </button>
                <a 
                  href={menuOpenFor.spotifyId ? `https://open.spotify.com/track/${menuOpenFor.spotifyId}` : `https://open.spotify.com/search/${encodeURIComponent(menuOpenFor.title + ' ' + menuOpenFor.artist)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpenFor(null)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-800 transition-colors text-white font-bold uppercase tracking-widest text-xs"
                >
                  <ExternalLink className="w-5 h-5 text-green-400" />
                  Open in Spotify
                </a>
                <button 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${menuOpenFor.title} by ${menuOpenFor.artist}`,
                        text: `Check out this vibe I found on vibeSnap!`,
                        url: menuOpenFor.spotifyId ? `https://open.spotify.com/track/${menuOpenFor.spotifyId}` : window.location.href,
                      }).catch(console.error);
                    }
                    setMenuOpenFor(null);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-neutral-800 transition-colors text-white font-bold uppercase tracking-widest text-xs"
                >
                  <Share2 className="w-5 h-5 text-blue-400" />
                  Share Song
                </button>
                <button 
                  onClick={() => {
                    onRemoveSong(menuOpenFor.id);
                    setMenuOpenFor(null);
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-500/10 transition-colors text-red-500 font-bold uppercase tracking-widest text-xs"
                >
                  <Trash2 className="w-5 h-5" />
                  Remove from Saved
                </button>
              </div>

              <button 
                onClick={() => setMenuOpenFor(null)}
                className="w-full mt-4 p-4 rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors font-black uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile-Friendly Bottom Player */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 md:p-6 pb-8"
          >
            <div className="max-w-4xl mx-auto flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img src={activeSong.coverUrl} alt={activeSong.title} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover shadow-md" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-black uppercase tracking-tight truncate text-sm md:text-base">{activeSong.title}</h4>
                    <p className="text-purple-400 font-bold uppercase tracking-widest text-[10px] md:text-xs truncate">{activeSong.artist}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => setMenuOpenFor(activeSong)}
                    className="w-10 h-10 bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setActiveSong(null)}
                    className="w-10 h-10 bg-neutral-800 text-neutral-400 rounded-full flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="w-full">
                {activeSong.spotifyId ? (
                  <SpotifyEmbed trackId={activeSong.spotifyId} compact height={80} />
                ) : activeSong.previewUrl ? (
                  <div className="bg-neutral-800/50 rounded-2xl p-3 flex items-center gap-4 border border-neutral-700/50">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                        <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                    </div>
                    <div className="flex-1">
                        <audio 
                            controls 
                            autoPlay
                            className="w-full h-8 accent-purple-500"
                            src={activeSong.previewUrl}
                        >
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-800/30 border border-dashed border-neutral-700/50 rounded-2xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Preview not available</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedSongs;
