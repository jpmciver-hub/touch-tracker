import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Flame, TrendingUp, Calendar, Edit3, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ProgressRing from './ProgressRing';
import Celebration from './Celebration';

export default function Dashboard() {
  const { goal, todayTotal, progress, remaining, goalReached, streaks, todayEntries, actions } = useApp();
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevGoalReached = useRef(false);

  // Trigger celebration only when goal is first reached
  useEffect(() => {
    if (goalReached && !prevGoalReached.current) {
      setShowCelebration(true);
    }
    prevGoalReached.current = goalReached;
  }, [goalReached]);

  const handleGoalSave = () => {
    const parsed = parseInt(goalInput, 10);
    if (parsed > 0) {
      actions.setGoal(parsed);
    }
    setEditingGoal(false);
  };

  const sessionsToday = todayEntries.length;
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <Celebration show={showCelebration} onDismiss={() => setShowCelebration(false)} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm">{todayDate}</p>
      </div>

      {/* Progress Ring + Stats */}
      <div className="glass-card p-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <ProgressRing
            progress={progress}
            total={todayTotal}
            goal={goal}
            remaining={remaining}
            goalReached={goalReached}
          />
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            {/* Goal */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
                <Target size={14} />
                DAILY GOAL
              </div>
              {editingGoal ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goalInput}
                    onChange={e => setGoalInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGoalSave()}
                    className="input-field w-full text-xl font-bold py-2"
                    autoFocus
                  />
                  <button onClick={handleGoalSave} className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setGoalInput(goal); setEditingGoal(true); }}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-2xl font-black text-white">{goal.toLocaleString()}</span>
                  <Edit3 size={14} className="text-gray-600 group-hover:text-brand-400 transition-colors" />
                </button>
              )}
            </div>

            {/* Progress % */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
                <TrendingUp size={14} />
                PROGRESS
              </div>
              <div className="text-2xl font-black text-white">{Math.round(progress)}%</div>
              <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${goalReached ? 'bg-emerald-400' : 'bg-brand-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
                <Flame size={14} />
                STREAK
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-400">{streaks.current}</span>
                <span className="text-sm text-gray-500">days</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">Best: {streaks.best} days</div>
            </div>

            {/* Sessions */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
                <Calendar size={14} />
                SESSIONS
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{sessionsToday}</span>
                <span className="text-sm text-gray-500">today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick recent entries */}
      {todayEntries.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Recent Entries</h3>
          <div className="space-y-2">
            {todayEntries.slice(-5).reverse().map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.02]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.activityColor || '#6366f1' }}
                  />
                  <span className="text-sm text-gray-300">{entry.activityName}</span>
                  <span className="text-xs text-gray-600">{entry.reps} reps</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">+{entry.totalTouches}</span>
                  <span className="text-xs text-gray-600">{entry.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
