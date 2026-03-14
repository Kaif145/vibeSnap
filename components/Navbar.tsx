
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Menu, X, LogOut, Music, Sparkles, Bookmark, ShieldCheck, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  currentView: string;
  onNavigate: (view: 'dashboard' | 'admin' | 'saved') => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { label: string; view: 'dashboard' | 'admin' | 'saved'; icon: React.ReactNode; role?: UserRole }[] = [
    { label: 'Discover', view: 'dashboard', icon: <Sparkles className="w-4 h-4" /> },
    { label: 'Saved', view: 'saved', icon: <Bookmark className="w-4 h-4" /> },
    { label: 'Admin', view: 'admin', icon: <ShieldCheck className="w-4 h-4" />, role: UserRole.ADMIN },
  ];

  const handleNavigate = (view: 'dashboard' | 'admin' | 'saved') => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-4 md:px-6 py-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => handleNavigate('dashboard')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center transition group-hover:rotate-12 shadow-lg shadow-purple-500/20">
            <Music className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            vibeSnap
          </h1>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            (!item.role || item.role === user.role) && (
              <button 
                key={item.view}
                onClick={() => handleNavigate(item.view)}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:text-purple-400 ${
                  currentView === item.view ? 'text-purple-400' : 'text-gray-500'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black truncate max-w-[120px]">{user.name}</p>
            <p className="text-[10px] text-purple-500 uppercase font-bold tracking-tighter">{user.role}</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="hidden sm:flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition border border-white/5"
          >
            <LogOut className="w-3 h-3" />
            Logout
          </motion.button>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-800 overflow-hidden shadow-2xl z-40"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                (!item.role || item.role === user.role) && (
                  <button 
                    key={item.view}
                    onClick={() => handleNavigate(item.view)}
                    className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
                      currentView === item.view 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-neutral-800/50 text-gray-400 border border-transparent hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              ))}
              
              <div className="h-px bg-neutral-800 my-2" />
              
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                    <span className="text-white font-black text-sm">{user.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                     <p className="text-white text-sm font-black truncate">{user.name}</p>
                     <p className="text-purple-400 text-[10px] uppercase font-bold tracking-widest truncate">{user.role}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
