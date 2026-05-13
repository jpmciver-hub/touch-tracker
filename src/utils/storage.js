const KEYS = {
  ACTIVITIES: 'tt_activities',
  DAILY_LOGS: 'tt_daily_logs',
  GOAL: 'tt_goal',
  STREAKS: 'tt_streaks',
  GITHUB_TOKEN: 'tt_github_token',
  GIST_ID: 'tt_gist_id',
};

const GIST_FILENAME = 'touch-tracker-data.json';

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
  return localStorage.getItem(KEYS.GITHUB_TOKEN) || '';
}

export function setGitHubToken(token) {
  localStorage.setItem(KEYS.GITHUB_TOKEN, token);
}

export function getGistId() {
  return localStorage.getItem(KEYS.GIST_ID) || '';
}

export function setGistId(id) {
  localStorage.setItem(KEYS.GIST_ID, id);
}

export async function syncToCloud(state) {
  const token = getGitHubToken();
  if (!token) return { ok: false, error: 'No token' };

  const data = {
    goal: state.goal,
    activities: state.activities,
    dailyLogs: state.dailyLogs,
    streaks: state.streaks,
    lastSync: new Date().toISOString(),
  };

  const gistId = getGistId();
  try {
    if (gistId) {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } } }),
      });
      if (res.ok) return { ok: true };
      if (res.status === 404) {
        localStorage.removeItem(KEYS.GIST_ID);
        return syncToCloud(state);
      }
      return { ok: false, error: `Save failed (${res.status})` };
    } else {
      const res = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: { Authorization: `token ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: 'Touch Tracker - Training Data',
          public: false,
          files: { [GIST_FILENAME]: { content: JSON.stringify(data, null, 2) } },
        }),
      });
      if (res.ok) {
        const gist = await res.json();
        setGistId(gist.id);
        return { ok: true };
      }
      return { ok: false, error: `Create failed (${res.status})` };
    }
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loadFromCloud() {
  const token = getGitHubToken();
  if (!token) return null;

  const gistId = getGistId();
  if (!gistId) {
    const found = await findExistingGist(token);
    if (!found) return null;
  }

  try {
    const res = await fetch(`https://api.github.com/gists/${getGistId()}`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) return null;
    const gist = await res.json();
    const file = gist.files[GIST_FILENAME];
    if (!file) return null;
    return JSON.parse(file.content);
  } catch {
    return null;
  }
}

async function findExistingGist(token) {
  try {
    const res = await fetch('https://api.github.com/gists?per_page=100', {
      headers: { Authorization: `token ${token}` },
    });
    if (!res.ok) return false;
    const gists = await res.json();
    const match = gists.find(g => g.files[GIST_FILENAME]);
    if (match) {
      setGistId(match.id);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export { KEYS };
