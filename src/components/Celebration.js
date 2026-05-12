import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

const CONFETTI_COLORS = ['#818cf8', '#34d399', '#f472b6', '#fb923c', '#38bdf8', '#facc15'];

function ConfettiPiece({ color, delay }) {
  const left = Math.random() * 100;
  const size = Math.random() * 8 + 4;
  return (
    <motion.div
      className="fixed z-[60] rounded-sm"
      style={{ left: `${left}%`, width: size, height: size, backgroundColor: color }}
      initial={{ top: -20, rotate: 0, opacity: 1 }}
      animate={{ top: '110vh', rotate: 720, opacity: 0 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
    />
  );
}

export default function Celebration({ show, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <>
          {Array.from({ length: 50 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
              delay={Math.random() * 0.5}
            />
          ))}
          <motion.div
            className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-card p-8 text-center pointer-events-auto"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Trophy size={64} className="mx-auto text-yellow-400 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-2">Goal Reached!</h2>
              <p className="text-gray-400">Amazing work today. Keep the streak alive!</p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
