import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Instagram } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-neon-pink/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-neon-purple/20 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-xl md:text-2xl font-semibold text-neon-pink mb-4 tracking-widest uppercase">
            The Grand Cultural Spectacle
          </h2>
          <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-none">
            HORIZON <span className="neon-text">2K26</span>
          </h1>
          
          <div className="flex flex-wrap justify-center gap-8 mb-12 text-lg text-white/80">
            <div className="flex items-center gap-2">
              <Calendar className="text-neon-pink" />
              <span>02 – 04 April 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="text-neon-purple" />
              <span>BT Institute Campus</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Link to="/register" className="neon-btn px-10 py-4 rounded-full text-lg font-bold">
              Register Now
            </Link>
            <Link to="/events" className="glass px-10 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition-all">
              Explore Events
            </Link>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block bg-red-500/10 border border-red-500/30 px-8 py-4 rounded-2xl"
          >
            <p className="text-red-500 font-black text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-3">
              <span className="animate-pulse text-xl">⚠️</span> 
              Gate Pass (₹100) is Compulsory for Entry & Participation
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export const InstagramSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto glass p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-bold mb-6">Stay <span className="neon-text">Connected</span></h2>
          <p className="text-white/70 text-lg mb-8">
            Follow our official Instagram handle for latest updates, behind-the-scenes, and announcements.
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 mb-8">
            <Instagram className="text-neon-pink" size={32} />
            <span className="text-2xl font-semibold">@BT_HORIZON_2K26</span>
          </div>
          <a 
            href="https://instagram.com/BT_HORIZON_2K26" 
            target="_blank" 
            rel="noreferrer"
            className="inline-block neon-btn px-8 py-3 rounded-xl font-bold"
          >
            Follow Us on Instagram
          </a>
        </div>
        <div className="w-64 h-64 bg-white p-6 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 flex items-center justify-center">
          <QRCodeSVG 
            value="https://instagram.com/BT_HORIZON_2K26" 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>
      </div>
    </section>
  );
};
