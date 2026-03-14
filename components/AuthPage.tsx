
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Mail, Lock, User as UserIcon, ArrowRight, Music2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

interface AuthPageProps {
  onAuth: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const response = await axios.post('/api/auth/login', { email, password });
        localStorage.setItem('vibeSnap_token', response.data.token);
        onAuth(response.data.user);
      } else {
        const response = await axios.post('/api/auth/signup', { name, email, password });
        localStorage.setItem('vibeSnap_token', response.data.token);
        onAuth(response.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[120px]"
        ></motion.div>
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px]"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900/40 border border-neutral-800 p-8 md:p-10 rounded-[40px] shadow-2xl backdrop-blur-2xl relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-purple-500/20"
          >
            <Music2 className="text-white w-8 h-8" />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              {isLogin ? 'Welcome Back' : 'Join vibeSnap'}
            </h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Discover music through your emotions.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-xl text-center">
              {error}
            </div>
          )}
          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-neutral-800 rounded-2xl p-4 pl-12 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-black py-5 rounded-full hover:bg-purple-500 hover:text-white transition-all mt-6 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-white/5 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                {isLogin ? 'Login' : 'Sign Up'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center mt-8 space-y-4">
          <p className="text-xs text-neutral-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white font-black hover:text-purple-400 transition-colors uppercase tracking-widest ml-1"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
          <button
            onClick={() => onAuth({
              id: 'guest-' + Math.random().toString(36).substr(2, 9),
              name: 'Guest User',
              email: 'guest@vibesnap.com',
              role: UserRole.USER,
              savedSongs: [],
              likedSongs: []
            })}
            className="text-[10px] text-neutral-400 hover:text-white font-black uppercase tracking-[0.2em] transition-colors"
          >
            Skip Login
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-neutral-800/50 text-center">
          <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] leading-relaxed">
            Hint: Use 'admin@vibesnap.com' to login as Admin
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
