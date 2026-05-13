const KEYS = {
  ACTIVITIES: 'tt_activities',
  DAILY_LOGS: 'tt_daily_logs',
  GOAL: 'tt_goal',
  STREAKS: 'tt_streaks',
};

const REPO = 'jpmciver-hub/touch-tracker';
const DATA_FILE = 'data.json';
const TOKEN_KEY = 'tt_gh_token';

export function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

export function getGitHubToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setGitHubToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export async function syncToCloud(state) {
  const data = {
    goal: state.goal,
    activities: state.activities,
    dailyLogs: state.dailyLogs,
    streaks: state.streaks,
    lastSync: new Date().toISOString(),
  };

  const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

  try {
    const existing = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_FILE}?ref=main`, {
      headers: { Authorization: `token ${getGitHubToken()}` },
    });

    const body = { message: `Sync training data ${new Date().toLocaleString()}`, content, branch: 'main' };

    if (existing.ok) {
      const file = await existing.json();
      body.sha = file.sha;
    }

    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${getGitHubToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return { ok: res.ok, error: res.ok ? null : `Save failed (${res.status})` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loadFromCloud() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${DATA_FILE}?ref=main`, {
      headers: { Authorization: `token ${getGitHubToken()}` },
    });
    if (!res.ok) return null;
    const file = await res.json();
    const decoded = decodeURIComponent(escape(atob(file.content)));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export { KEYS };
