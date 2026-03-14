import React, { useState } from 'react';
import { Song, Language } from '../types';
import { Plus, Trash2, TrendingUp, Music, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminDashboardProps {
  songs: Song[];
  onUpdateSongs: (songs: Song[]) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ songs, onUpdateSongs }) => {
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    genre: '',
    vibe: 'happy',
    language: Language.ENGLISH,
    previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    coverUrl: 'https://picsum.photos/seed/new/800/1200',
    isTrending: false
  });

  const addSong = () => {
    const song: Song = {
      ...newSong,
      id: Math.random().toString(36).substr(2, 9),
      createdBy: 'admin'
    };
    onUpdateSongs([...songs, song]);
    setNewSong({
      title: '',
      artist: '',
      genre: '',
      vibe: 'happy',
      language: Language.ENGLISH,
      previewUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      coverUrl: 'https://picsum.photos/seed/' + Math.random() + '/800/1200',
      isTrending: false
    });
  };

  const deleteSong = (id: string) => {
    onUpdateSongs(songs.filter(s => s.id !== id));
  };

  const toggleTrending = (id: string) => {
    onUpdateSongs(songs.map(s => s.id === id ? { ...s, isTrending: !s.isTrending } : s));
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 max-w-6xl mx-auto space-y-12 pb-24">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20">
          <ShieldCheck className="text-purple-500 w-6 h-6" />
        </div>
        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Admin Management</h2>
      </motion.div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-neutral-900/50 border border-neutral-800 p-8 md:p-10 rounded-[40px] space-y-8"
      >
        <div className="flex items-center gap-3">
          <Plus className="text-purple-500 w-5 h-5" />
          <h3 className="text-xl font-black uppercase tracking-widest">Add New Song</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Song Title</label>
            <input 
              type="text" placeholder="e.g. Moonlight Sonata" value={newSong.title}
              onChange={e => setNewSong({...newSong, title: e.target.value})}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Artist Name</label>
            <input 
              type="text" placeholder="e.g. Beethoven" value={newSong.artist}
              onChange={e => setNewSong({...newSong, artist: e.target.value})}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Genre</label>
            <input 
              type="text" placeholder="e.g. Classical" value={newSong.genre}
              onChange={e => setNewSong({...newSong, genre: e.target.value})}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-2">Language</label>
            <select 
              value={newSong.language}
              onChange={e => setNewSong({...newSong, language: e.target.value as Language})}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm appearance-none"
            >
              {Object.values(Language).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4 px-4 py-4 bg-black/30 rounded-2xl border border-neutral-800">
            <input 
              type="checkbox" checked={newSong.isTrending}
              onChange={e => setNewSong({...newSong, isTrending: e.target.checked})}
              className="w-6 h-6 accent-purple-500 rounded-lg"
            />
            <span className="text-xs font-black uppercase tracking-widest text-neutral-400">Mark as Trending</span>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addSong}
          disabled={!newSong.title || !newSong.artist}
          className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-purple-500 hover:text-white transition-all uppercase tracking-[0.2em] text-[10px] shadow-xl disabled:opacity-20"
        >
          Upload to Database
        </motion.button>
      </motion.section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-black uppercase tracking-widest">Manage Tracks ({songs.length})</h3>
          <div className="h-[1px] flex-1 bg-neutral-800 mx-6"></div>
        </div>
        <div className="grid gap-4">
          {songs.map((song, i) => (
            <motion.div 
              key={song.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-neutral-900/30 p-4 md:p-6 rounded-3xl border border-neutral-800 hover:border-neutral-700 transition-all group"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={song.coverUrl} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                  {song.isTrending && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 p-1.5 rounded-full shadow-lg">
                      <TrendingUp className="w-3 h-3 text-black" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-black text-lg uppercase tracking-tight group-hover:text-purple-400 transition-colors">{song.title}</h4>
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{song.artist} • {song.language} • {song.genre}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTrending(song.id)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                    song.isTrending 
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' 
                      : 'bg-neutral-800 text-neutral-500 border border-transparent'
                  }`}
                >
                  {song.isTrending ? 'Trending' : 'Set Trending'}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteSong(song.id)}
                  className="p-3 text-neutral-600 hover:text-red-500 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
