import React, { useState } from 'react';
import { Cloud, CloudOff, Check, Loader, AlertCircle, Settings } from 'lucide-react';
import { getGitHubToken, setGitHubToken } from '../utils/storage';
import { useApp } from '../context/AppContext';

export function SyncIndicator() {
  const { syncStatus } = useApp();
  const [showSetup, setShowSetup] = useState(false);
  const hasToken = !!getGitHubToken();

  const icons = {
    idle: hasToken ? <Cloud size={14} className="text-gray-500" /> : <CloudOff size={14} className="text-gray-600" />,
    loading: <Loader size={14} className="text-blue-400 animate-spin" />,
    syncing: <Loader size={14} className="text-brand-400 animate-spin" />,
    synced: <Check size={14} className="text-emerald-400" />,
    error: <AlertCircle size={14} className="text-red-400" />,
  };

  const labels = {
    idle: hasToken ? 'Ready' : 'Not connected',
    loading: 'Loading...',
    syncing: 'Saving...',
    synced: 'Saved',
    error: 'Sync error',
  };

  return (
    <>
      <button
        onClick={() => setShowSetup(true)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
        title="Cloud sync settings"
      >
        {icons[syncStatus] || icons.idle}
        <span className="text-[10px] text-gray-400">{labels[syncStatus] || ''}</span>
      </button>
      {showSetup && <SyncSetupModal onClose={() => setShowSetup(false)} />}
    </>
  );
}

function SyncSetupModal({ onClose }) {
  const { actions } = useApp();
  const [token, setToken] = useState(getGitHubToken());
  const [status, setStatus] = useState('');

  const handleSave = async () => {
    if (!token.trim()) {
      setGitHubToken('');
      setStatus('Disconnected');
      return;
    }
    setStatus('Testing...');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token.trim()}` },
      });
      if (res.ok) {
        const user = await res.json();
        setGitHubToken(token.trim());
        setStatus(`Connected as ${user.login}`);
        setTimeout(() => {
          actions.manualSync();
          onClose();
        }, 1000);
      } else {
        setStatus('Invalid token');
      }
    } catch {
      setStatus('Connection failed');
    }
  };

  const handleLoadFromCloud = async () => {
    setStatus('Loading from cloud...');
    await actions.forceLoadCloud();
    setStatus('Loaded!');
    setTimeout(onClose, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface-800 rounded-2xl p-6 w-full max-w-md border border-white/10" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={20} className="text-brand-400" />
          <h2 className="text-lg font-bold text-white">Cloud Sync</h2>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Save your training data to GitHub so it persists across devices and sessions. Your data is stored in a private Gist.
        </p>
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-300 mb-1">GitHub Personal Access Token</label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxx"
            className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500"
          />
          <p className="text-[10px] text-gray-500 mt-1">
            Create at github.com/settings/tokens with "gist" scope only
          </p>
        </div>
        {status && (
          <p className={`text-sm mb-3 ${status.includes('Connected') || status.includes('Loaded') ? 'text-emerald-400' : status.includes('Invalid') || status.includes('failed') ? 'text-red-400' : 'text-gray-400'}`}>
            {status}
          </p>
        )}
        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Save & Sync
          </button>
          {getGitHubToken() && (
            <button onClick={handleLoadFromCloud} className="flex-1 bg-surface-700 hover:bg-surface-600 text-white py-2 rounded-lg text-sm font-medium transition-colors">
              Load from Cloud
            </button>
          )}
        </div>
        <button onClick={onClose} className="w-full mt-2 text-gray-500 hover:text-gray-300 py-2 text-sm transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}
