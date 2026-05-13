import React, { useState } from 'react';
import { Cloud, CloudOff, Check, Loader, AlertCircle } from 'lucide-react';
import { getGitHubToken, setGitHubToken } from '../utils/storage';
import { useApp } from '../context/AppContext';

export function SyncIndicator() {
  const { syncStatus, actions } = useApp();
  const [showPrompt, setShowPrompt] = useState(false);
  const hasToken = !!getGitHubToken();

  const icons = {
    idle: hasToken ? <Cloud size={14} className="text-gray-500" /> : <CloudOff size={14} className="text-gray-600" />,
    loading: <Loader size={14} className="text-blue-400 animate-spin" />,
    syncing: <Loader size={14} className="text-brand-400 animate-spin" />,
    synced: <Check size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  const labels = {
    idle: hasToken ? 'Ready' : 'Setup',
    loading: 'Loading...',
    syncing: 'Saving...',
    synced: 'Saved',
    error: 'Error',
  };

  const handleClick = () => {
    if (!hasToken) {
      setShowPrompt(true);
    } else {
      actions.forceLoadCloud();
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
        title={hasToken ? 'Click to refresh from cloud' : 'Click to set up cloud sync'}
      >
        {icons[syncStatus] || icons.idle}
        <span className="text-[10px] text-gray-400">{labels[syncStatus] || ''}</span>
      </button>
      {showPrompt && <TokenPrompt onClose={() => setShowPrompt(false)} onSave={() => { setShowPrompt(false); actions.manualSync(); }} />}
    </>
  );
}

function TokenPrompt({ onClose, onSave }) {
  const [token, setToken] = useState('');

  const handleSave = () => {
    if (token.trim()) {
      setGitHubToken(token.trim());
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-800 rounded-2xl p-6 w-full max-w-sm border border-white/10" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-white mb-2">Cloud Sync Setup</h2>
        <p className="text-sm text-gray-400 mb-4">
          Enter a GitHub token to save your training data. One-time setup.
        </p>
        <input
          type="password"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxx"
          className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 mb-4"
          autoFocus
        />
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-sm font-medium">Connect</button>
          <button onClick={onClose} className="flex-1 bg-surface-700 hover:bg-surface-600 text-white py-2 rounded-lg text-sm font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
}
