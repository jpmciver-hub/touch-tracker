const KEYS = {
  ACTIVITIES: 'tt_activities',
  DAILY_LOGS: 'tt_daily_logs',
  GOAL: 'tt_goal',
  STREAKS: 'tt_streaks',
};

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

export { KEYS };
