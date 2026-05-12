import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressRing({ progress, total, goal, remaining, goalReached }) {
  const radius = 90;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <motion.circle
          cx="110" cy="110" r={radius}
          fill="none"
          stroke={goalReached ? '#34d399' : '#6366f1'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {goalReached && (
          <motion.circle
            cx="110" cy="110" r={radius}
            fill="none"
            stroke="#34d399"
            strokeWidth={stroke + 4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset: [circumference, offset],
              opacity: [0.8, 0.2, 0.8],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </svg>
      <div className="absolute text-center">
        <motion.div
          className={`text-5xl font-black font-mono ${goalReached ? 'text-emerald-400' : 'text-white'}`}
          key={total}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          {total.toLocaleString()}
        </motion.div>
        <div className="text-sm text-gray-500 mt-1">
          of {goal.toLocaleString()}
        </div>
        <div className={`text-xs font-semibold mt-1 ${goalReached ? 'text-emerald-400' : 'text-brand-400'}`}>
          {goalReached ? 'GOAL REACHED' : `${remaining.toLocaleString()} remaining`}
        </div>
      </div>
    </div>
  );
}
