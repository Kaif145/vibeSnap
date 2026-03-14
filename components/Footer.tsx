
import React from 'react';
import { Instagram, Mail, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <span className="text-white font-black text-xs">V</span>
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase italic">vibeSnap</h2>
          </div>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest max-w-xs">
            Discovering the soundtrack to your soul through AI and emotion.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Built by</p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="text-2xl font-black italic tracking-tighter uppercase text-white"
          >
            MAXI
          </motion.div>
          <div className="flex items-center gap-4">
            <motion.a 
              whileHover={{ y: -2, color: '#E1306C' }}
              href="https://www.instagram.com/maxiiiii.__/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors"
            >
              <Instagram className="w-5 h-5" />
            </motion.a>
            <motion.a 
              whileHover={{ y: -2, color: '#A855F7' }}
              href="mailto:kaifur.rahaman.145@gmail.com" 
              className="text-neutral-400 transition-colors"
            >
              <Mail className="w-5 h-5" />
            </motion.a>
          </div>
        </div>

        <div className="text-center md:text-right space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            © {new Date().getFullYear()} vibeSnap
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-700 flex items-center justify-center md:justify-end gap-1">
            Made with <Heart className="w-2 h-2 fill-current text-red-500" /> for music lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
