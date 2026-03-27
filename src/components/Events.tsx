import React from "react";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EVENTS } from '../constants';
import { Calendar, Users, User, Info } from 'lucide-react';

export const EventsSection = () => {
  const [activeDay, setActiveDay] = useState<number>(0);

  const days = [
    { label: 'Compulsory', value: 0 },
    { label: 'Day 1', value: 1 },
    { label: 'Day 2', value: 2 },
    { label: 'Day 3', value: 3 },
  ];

  const filteredEvents = EVENTS.filter(e => e.day === activeDay);

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto" id="events">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold mb-6">Explore <span className="neon-text">Events</span></h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
          From high-energy competitions to soulful performances, we have something for everyone.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl max-w-3xl mx-auto"
        >
          <h4 className="text-red-500 font-black text-xl mb-2 uppercase flex items-center justify-center gap-2">
            <span className="animate-pulse">⚠️</span> Mandatory Gate Pass
          </h4>
          <p className="text-white/80 text-sm leading-relaxed">
            A <span className="text-red-500 font-bold">Gate Pass (₹100)</span> is <span className="underline decoration-red-500 font-bold">COMPULSORY</span> for every person entering the fest. 
            Even if you are participating in other events, you <span className="text-red-500 font-bold italic">MUST</span> have a Gate Pass. 
            Entry to the fest will be strictly prohibited without a valid Gate Pass.
          </p>
        </motion.div>
      </div>

      {/* Day Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {days.map((day) => (
          <button
            key={day.label}
            onClick={() => setActiveDay(day.value as any)}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              activeDay === day.value 
                ? 'neon-btn' 
                : 'glass hover:bg-white/10'
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="glass p-6 hover:neon-border transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold group-hover:text-neon-pink transition-colors">{event.name}</h3>
              <div className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {event.category || `Day ${event.day}`}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {event.isSoloOnly && (
                <div className="flex items-center gap-2 text-white/70">
                  <User size={18} className="text-neon-pink" />
                  <span>Solo: ₹{event.soloFee}</span>
                </div>
              )}
              {event.isTeamOnly && (
                <div className="flex items-center gap-2 text-white/70">
                  <Users size={18} className="text-neon-purple" />
                  <span>Team: ₹{event.teamFee} {event.perMemberFee ? '/ member' : ''}</span>
                </div>
              )}
              {event.isBoth && (
                <>
                  <div className="flex items-center gap-2 text-white/70">
                    <User size={18} className="text-neon-pink" />
                    <span>Solo: ₹{event.soloFee}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Users size={18} className="text-neon-purple" />
                    <span>Team: ₹{event.teamFee}</span>
                  </div>
                </>
              )}
            </div>

            {event.subEvents && (
              <div className="mb-6">
                <p className="text-xs font-bold text-white/40 uppercase mb-2">Sub-events:</p>
                <div className="flex flex-wrap gap-2">
                  {event.subEvents.map(se => (
                    <span key={se.id} className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10">
                      {se.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link to="/register" className="block w-full text-center py-3 rounded-xl border border-neon-pink/30 hover:bg-neon-pink/10 transition-all font-bold">
              Register
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
