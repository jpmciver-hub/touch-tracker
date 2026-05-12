import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Search, Download, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportToCSV } from '../utils/csv';
import Modal from './Modal';

export default function HistoryPanel() {
  const { dailyLogs, activities, todayKey, actions } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDays, setExpandedDays] = useState({ [todayKey]: true });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Build sorted day list with totals
  const days = useMemo(() => {
    return Object.entries(dailyLogs)
      .map(([date, entries]) => ({
        date,
        entries,
        total: entries.reduce((sum, e) => sum + e.totalTouches, 0),
        sessionCount: entries.length,
      }))
      .filter(day => day.entries.length > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dailyLogs]);

  // Filter by search
  const filteredDays = useMemo(() => {
    if (!searchQuery.trim()) return days;
    const q = searchQuery.toLowerCase();
    return days
      .map(day => ({
        ...day,
        entries: day.entries.filter(e =>
          e.activityName.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
        ),
      }))
      .filter(day => day.entries.length > 0);
  }, [days, searchQuery]);

  const toggleDay = (date) => {
    setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const handleDelete = () => {
    if (confirmDelete) {
      actions.deleteEntry(confirmDelete.date, confirmDelete.entryId);
      setConfirmDelete(null);
    }
  };

  const handleReset = () => {
    actions.resetToday();
    setConfirmReset(false);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    if (dateStr === todayKey) return 'Today';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">History</h1>
          <p className="text-gray-500 text-sm">All your training entries</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirmReset(true)}
            className="btn-danger flex items-center gap-1.5 text-xs"
          >
            <RotateCcw size={14} />
            Reset Today
          </button>
          <button
            onClick={() => exportToCSV(dailyLogs, activities)}
            className="btn-ghost flex items-center gap-1.5 text-xs"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search activities or notes..."
          className="input-field w-full pl-10"
        />
      </div>

      {/* Day groups */}
      <div className="space-y-3">
        {filteredDays.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-500">
            {searchQuery ? 'No entries match your search.' : 'No entries yet. Start logging!'}
          </div>
        ) : (
          filteredDays.map(day => (
            <div key={day.date} className="glass-card overflow-hidden">
              {/* Day header */}
              <button
                onClick={() => toggleDay(day.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white">{formatDate(day.date)}</span>
                  <span className="text-xs text-gray-500">{day.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm font-bold text-brand-400">{day.total.toLocaleString()} touches</span>
                    <span className="text-xs text-gray-600 ml-2">{day.sessionCount} sessions</span>
                  </div>
                  {expandedDays[day.date] ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                </div>
              </button>

              {/* Entries */}
              <AnimatePresence>
                {expandedDays[day.date] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5">
                      {day.entries.slice().reverse().map(entry => (
                        <div key={entry.id} className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] border-b border-white/[0.02] last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.activityColor || '#6366f1' }} />
                            <div>
                              <span className="text-sm font-semibold text-gray-200">{entry.activityName}</span>
                              {entry.notes && <span className="text-xs text-gray-600 ml-2">- {entry.notes}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xs text-gray-500">{entry.reps} reps &times; {entry.touchesPerRep}</span>
                              <span className="text-sm font-bold text-white ml-3">+{entry.totalTouches}</span>
                            </div>
                            <span className="text-xs text-gray-600 w-16 text-right">{entry.time}</span>
                            <button
                              onClick={() => setConfirmDelete({ date: day.date, entryId: entry.id })}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Entry">
        <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete this entry? This cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>

      {/* Reset confirmation */}
      <Modal isOpen={confirmReset} onClose={() => setConfirmReset(false)} title="Reset Today's Progress">
        <p className="text-gray-400 text-sm mb-4">This will delete all of today's entries and reset your touch count to 0. Are you sure?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setConfirmReset(false)} className="btn-ghost">Cancel</button>
          <button onClick={handleReset} className="btn-danger">Reset Today</button>
        </div>
      </Modal>
    </div>
  );
}
