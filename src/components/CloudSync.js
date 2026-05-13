import React from 'react';
import { Cloud, Check, Loader, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function SyncIndicator() {
  const { syncStatus, actions } = useApp();

  const icons = {
    idle: <Cloud size={14} className="text-gray-500" />,
    loading: <Loader size={14} className="text-blue-400 animate-spin" />,
    syncing: <Loader size={14} className="text-brand-400 animate-spin" />,
    synced: <Check size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  const labels = {
    idle: 'Sync',
    loading: 'Loading',
    syncing: 'Saving',
    synced: 'Saved',
    error: 'Error',
  };

  return (
    <button
      onClick={() => actions.forceLoadCloud()}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
      title="Click to refresh from cloud"
    >
      {icons[syncStatus] || icons.idle}
      <span className="text-[10px] text-gray-400">{labels[syncStatus] || ''}</span>
    </button>
  );
}
