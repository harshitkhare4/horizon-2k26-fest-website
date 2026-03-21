import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Register', path: '/register' },
    { name: 'Admin', path: '/admin' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass m-4 mt-6">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold neon-text">HORIZON 2K26</Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`hover:text-neon-pink transition-colors ${location.pathname === link.path ? 'text-neon-pink font-semibold' : 'text-white/70'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-bg/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="flex flex-col p-6 space-y-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg ${location.pathname === link.path ? 'text-neon-pink' : 'text-white/70'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export const Footer = () => (
  <footer className="py-12 border-t border-white/10 mt-20">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
      <div className="mb-8 md:mb-0">
        <h3 className="text-2xl font-bold neon-text mb-2">HORIZON 2K26</h3>
        <p className="text-white/50">Experience the magic of culture.</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="bg-white p-2 rounded-lg shadow-lg">
          <QRCodeSVG 
            value="https://instagram.com/BT_HORIZON_2K26" 
            size={48}
            level="L"
          />
        </div>
        <a href="https://instagram.com/BT_HORIZON_2K26" target="_blank" rel="noreferrer" className="hover:text-neon-pink transition-colors">
          <Instagram size={24} />
        </a>
      </div>
    </div>
    <div className="text-center mt-12 text-white/30 text-sm">
      © 2026 Horizon Cultural Fest. All rights reserved.
    </div>
  </footer>
);
