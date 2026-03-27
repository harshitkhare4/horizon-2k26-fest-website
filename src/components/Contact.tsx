import React from 'react';
import { motion } from 'motion/react';
import { Instagram, Phone, MessageCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const CONTACT_NUMBERS = [
  '9131047427',
  '9098505275',
  '7489096587',
  '6265474192',
];

export const ContactPage = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-black mb-6">Contact <span className="neon-text">Us</span></h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Have questions? Reach out to our student coordinators or follow us on Instagram for real-time updates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Instagram Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-neon-pink/20 rounded-2xl flex items-center justify-center mb-6">
              <Instagram className="text-neon-pink" size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Official Instagram</h3>
            <p className="text-white/50 mb-8">Scan to follow @BT_HORIZON_2K26</p>
            
            <div className="bg-white p-6 rounded-3xl shadow-2xl mb-8">
              <QRCodeSVG 
                value="https://instagram.com/BT_HORIZON_2K26" 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <a 
              href="https://instagram.com/BT_HORIZON_2K26" 
              target="_blank" 
              rel="noreferrer"
              className="neon-btn px-8 py-3 rounded-xl font-bold w-full"
            >
              Follow Us
            </a>
          </motion.div>

          {/* Contact Numbers Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Phone className="text-neon-purple" />
              Student Coordinators
            </h3>
            
            <div className="grid gap-4">
              {CONTACT_NUMBERS.map((number) => (
                <div key={number} className="glass p-6 flex items-center justify-between border-white/5 hover:border-neon-purple/30 transition-all group">
                  <div className="flex flex-col">
                    <span className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Coordinator</span>
                    <span className="text-2xl font-mono font-bold tracking-tighter text-white/90 group-hover:text-neon-purple transition-colors">
                      {number}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href={`tel:${number}`}
                      className="w-12 h-12 bg-neon-purple/10 rounded-xl flex items-center justify-center text-neon-purple hover:bg-neon-purple hover:text-white transition-all shadow-lg shadow-neon-purple/5"
                      title="Call Now"
                    >
                      <Phone size={20} />
                    </a>
                    <a 
                      href={`https://wa.me/91${number}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all shadow-lg shadow-green-500/5"
                      title="WhatsApp"
                    >
                      <MessageCircle size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 text-center space-y-2">
              <p className="text-white/40 text-sm uppercase font-bold tracking-widest mb-2">Office Location</p>
              <p className="text-xl font-bold text-neon-purple">Room No. - S-28</p>
              <p className="text-white/70">BTIRT Sironja, Sagar</p>
              <p className="text-white/40 text-xs mt-4 italic">
                Available during College Time (10:00 AM to 04:00 PM)
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
