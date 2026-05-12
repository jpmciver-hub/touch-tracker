import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function QuickLog() {
  const { activities, actions } = useApp();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);

  const activity = activities.find(a => a.id === selectedActivity);
  const repsNum = parseInt(reps, 10) || 0;
  const totalTouches = activity ? repsNum * activity.touchesPerRep : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activity || repsNum <= 0) return;

    actions.addEntry({
      activityId: activity.id,
      activityName: activity.name,
      activityColor: activity.color,
      reps: repsNum,
      touchesPerRep: activity.touchesPerRep,
      totalTouches,
      notes,
    });

    setLastAdded({ name: activity.name, touches: totalTouches });
    setShowSuccess(true);
    setReps('');
    setNotes('');

    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Quick-add preset buttons for common rep counts
  const presets = [10, 25, 50, 100];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Quick Log</h1>
        <p className="text-gray-500 text-sm">Add touches from your training session</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        {/* Activity selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Activity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activities.map(a => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedActivity(a.id)}
                className={`relative p-3 rounded-xl border text-left transition-all duration-200 ${
                  selectedActivity === a.id
                    ? 'border-brand-500/50 bg-brand-600/10'
                    : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                  <span className="text-sm font-semibold text-white truncate">{a.name}</span>
                </div>
                <span className="text-xs text-gray-500">{a.touchesPerRep} touch{a.touchesPerRep !== 1 ? 'es' : ''}/rep</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reps input */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Reps Completed
          </label>
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder="Enter reps..."
            className="input-field w-full text-2xl font-bold text-center py-4"
            min="1"
          />
          <div className="flex gap-2 mt-3">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setReps(String(p))}
                className="flex-1 btn-ghost text-center text-sm py-2"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g., Left foot only..."
            className="input-field w-full"
          />
        </div>

        {/* Calculation preview */}
        <AnimatePresence>
          {activity && repsNum > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-brand-600/10 border border-brand-500/20 rounded-xl p-4"
            >
              <div className="text-xs text-gray-400 mb-2">CALCULATION</div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="font-mono">{repsNum} reps</span>
                <span className="text-gray-600">&times;</span>
                <span className="font-mono">{activity.touchesPerRep} touches/rep</span>
                <span className="text-gray-600">=</span>
                <span className="text-2xl font-black text-brand-400 font-mono">{totalTouches}</span>
                <span className="text-gray-400">touches</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <button
          type="submit"
          disabled={!activity || repsNum <= 0}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <PlusCircle size={20} />
          Add {totalTouches > 0 ? `${totalTouches} Touches` : 'Touches'}
        </button>
      </form>

      {/* Success toast */}
      <AnimatePresence>
        {showSuccess && lastAdded && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 flex items-center gap-3 shadow-2xl"
          >
            <Zap size={18} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">
              +{lastAdded.touches} touches from {lastAdded.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
