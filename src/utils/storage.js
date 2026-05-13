const KEYS = {
  ACTIVITIES: 'tt_activities',
  DAILY_LOGS: 'tt_daily_logs',
  GOAL: 'tt_goal',
  STREAKS: 'tt_streaks',
};

const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REACT_APP_GOOGLE_REFRESH_TOKEN;

let cachedAccessToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedAccessToken && Date.now() < tokenExpiry) return cachedAccessToken;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) return null;
  const data = await res.json();
  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedAccessToken;
}

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
  return SHEET_ID ? 'configured' : '';
}

export async function syncToCloud(state) {
  if (!SHEET_ID) return { ok: false, error: 'No sheet configured' };

  const token = await getAccessToken();
  if (!token) return { ok: false, error: 'Auth failed' };

  const data = {
    goal: state.goal,
    activities: state.activities,
    dailyLogs: state.dailyLogs,
    streaks: state.streaks,
    lastSync: new Date().toISOString(),
  };

  const encoded = JSON.stringify(data);
  const chunks = [];
  for (let i = 0; i < encoded.length; i += 40000) {
    chunks.push(encoded.substring(i, i + 40000));
  }

  const values = chunks.map((chunk, i) => [`chunk_${i}`, chunk]);
  values.unshift(['key', 'value']);
  values.push(['_meta', JSON.stringify({ lastSync: new Date().toISOString(), chunks: chunks.length })]);

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/state!A1:B${values.length}?valueInputOption=RAW`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ range: `state!A1:B${values.length}`, majorDimension: 'ROWS', values }),
      }
    );
    return { ok: res.ok, error: res.ok ? null : `Save failed (${res.status})` };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loadFromCloud() {
  if (!SHEET_ID) return null;

  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/state!A:B`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const rows = data.values || [];
    if (rows.length < 2) return null;

    const chunkRows = rows.filter(r => r[0] && r[0].startsWith('chunk_')).sort((a, b) => {
      const ai = parseInt(a[0].split('_')[1]);
      const bi = parseInt(b[0].split('_')[1]);
      return ai - bi;
    });

    if (chunkRows.length === 0) return null;
    const fullJson = chunkRows.map(r => r[1]).join('');
    return JSON.parse(fullJson);
  } catch {
    return null;
  }
}

export { KEYS };
