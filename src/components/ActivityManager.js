import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit3, Trash2, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from './Modal';

const PRESET_COLORS = ['#818cf8', '#34d399', '#f472b6', '#fb923c', '#38bdf8', '#facc15', '#a78bfa', '#f87171', '#2dd4bf', '#e879f9'];

function ActivityForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || { name: '', touchesPerRep: 1, notes: '', color: PRESET_COLORS[0] }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      touchesPerRep: Math.max(1, parseInt(form.touchesPerRep, 10) || 1),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Activity Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Juggles"
          className="input-field w-full"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Touches Per Rep
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setForm({ ...form, touchesPerRep: v })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                parseInt(form.touchesPerRep) === v
                  ? 'bg-brand-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {v}
            </button>
          ))}
          <input
            type="number"
            value={form.touchesPerRep}
            onChange={e => setForm({ ...form, touchesPerRep: e.target.value })}
            className="input-field w-20 text-center text-sm"
            min="1"
            placeholder="Custom"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setForm({ ...form, color: c })}
              className={`w-8 h-8 rounded-full transition-all ${
                form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-800 scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Notes (optional)
        </label>
        <input
          type="text"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          placeholder="e.g., Alternating feet"
          className="input-field w-full"
        />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button
          type="submit"
          disabled={!form.name.trim()}
          className="btn-primary disabled:opacity-30"
        >
          <Save size={16} className="inline mr-1.5" />
          {initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default function ActivityManager() {
  const { activities, actions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (data) => {
    if (editingId) {
      actions.updateActivity({ ...data, id: editingId });
    } else {
      actions.addActivity(data);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (activity) => {
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      actions.deleteActivity(deleteId);
      setDeleteId(null);
    }
  };

  const editingActivity = editingId ? activities.find(a => a.id === editingId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Activities</h1>
          <p className="text-gray-500 text-sm">Manage your training activities</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-1.5 text-sm"
        >
          <Plus size={16} />
          Add Activity
        </button>
      </div>

      {/* Activity list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {activities.map(activity => (
            <motion.div
              key={activity.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activity.color }} />
                  <h3 className="font-bold text-white">{activity.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteId(activity.id)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-2xl font-black text-brand-400 font-mono">{activity.touchesPerRep}</span>
                  <span className="text-xs text-gray-500 ml-1">touch{activity.touchesPerRep !== 1 ? 'es' : ''}/rep</span>
                </div>
              </div>
              {activity.notes && (
                <p className="text-xs text-gray-500 mt-2">{activity.notes}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add/Edit modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingId(null); }}
        title={editingId ? 'Edit Activity' : 'New Activity'}
      >
        <ActivityForm
          initial={editingActivity}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
        />
      </Modal>

      {/* Delete confirmation */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Activity">
        <p className="text-gray-400 text-sm mb-4">
          Are you sure you want to delete this activity? Existing log entries will not be affected.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-ghost">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
