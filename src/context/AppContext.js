import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react';
import { loadFromStorage, saveToStorage, getTodayKey, KEYS, syncToCloud, loadFromCloud, getGitHubToken } from '../utils/storage';
import { DEFAULT_ACTIVITIES, DEFAULT_GOAL } from '../utils/defaults';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

const ACTION = {
  SET_GOAL: 'SET_GOAL',
  ADD_ENTRY: 'ADD_ENTRY',
  DELETE_ENTRY: 'DELETE_ENTRY',
  RESET_TODAY: 'RESET_TODAY',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  UPDATE_ACTIVITY: 'UPDATE_ACTIVITY',
  DELETE_ACTIVITY: 'DELETE_ACTIVITY',
  SET_TAB: 'SET_TAB',
  HYDRATE: 'HYDRATE',
};

function buildInitialState() {
  return {
    goal: loadFromStorage(KEYS.GOAL, DEFAULT_GOAL),
    activities: loadFromStorage(KEYS.ACTIVITIES, DEFAULT_ACTIVITIES),
    dailyLogs: loadFromStorage(KEYS.DAILY_LOGS, {}),
    streaks: loadFromStorage(KEYS.STREAKS, { current: 0, best: 0, lastGoalDate: null }),
    activeTab: 'dashboard',
  };
}

function computeStreaks(dailyLogs, goal, prevStreaks) {
  const today = getTodayKey();
  const todayEntries = dailyLogs[today] || [];
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.totalTouches, 0);

  if (todayTotal < goal) return prevStreaks;

  // Goal met today — update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split('T')[0];

  let current = prevStreaks.current;
  if (prevStreaks.lastGoalDate === today) {
    return prevStreaks; // Already counted today
  } else if (prevStreaks.lastGoalDate === yesterdayKey) {
    current += 1;
  } else {
    current = 1;
  }

  return {
    current,
    best: Math.max(current, prevStreaks.best),
    lastGoalDate: today,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case ACTION.SET_GOAL:
      return { ...state, goal: action.payload };

    case ACTION.ADD_ENTRY: {
      const today = getTodayKey();
      const entry = {
        id: uuidv4(),
        ...action.payload,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      };
      const updatedLogs = {
        ...state.dailyLogs,
        [today]: [...(state.dailyLogs[today] || []), entry],
      };
      const updatedStreaks = computeStreaks(updatedLogs, state.goal, state.streaks);
      return { ...state, dailyLogs: updatedLogs, streaks: updatedStreaks };
    }

    case ACTION.DELETE_ENTRY: {
      const { date, entryId } = action.payload;
      const filtered = (state.dailyLogs[date] || []).filter(e => e.id !== entryId);
      const updatedLogs = { ...state.dailyLogs, [date]: filtered };
      return { ...state, dailyLogs: updatedLogs };
    }

    case ACTION.RESET_TODAY: {
      const today = getTodayKey();
      const updatedLogs = { ...state.dailyLogs, [today]: [] };
      return { ...state, dailyLogs: updatedLogs };
    }

    case ACTION.ADD_ACTIVITY: {
      const activity = { id: uuidv4(), ...action.payload };
      return { ...state, activities: [...state.activities, activity] };
    }

    case ACTION.UPDATE_ACTIVITY: {
      const updated = state.activities.map(a =>
        a.id === action.payload.id ? { ...a, ...action.payload } : a
      );
      return { ...state, activities: updated };
    }

    case ACTION.DELETE_ACTIVITY: {
      return { ...state, activities: state.activities.filter(a => a.id !== action.payload) };
    }

    case ACTION.SET_TAB:
      return { ...state, activeTab: action.payload };

    case ACTION.HYDRATE:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, buildInitialState);
  const [syncStatus, setSyncStatus] = useState('idle');
  const syncTimer = useRef(null);
  const isInitialLoad = useRef(true);

  // Load from cloud on startup
  useEffect(() => {
    if (!getGitHubToken()) { isInitialLoad.current = false; return; }
    setSyncStatus('loading');
    loadFromCloud().then(cloudData => {
      if (cloudData) {
        dispatch({ type: ACTION.HYDRATE, payload: {
          goal: cloudData.goal,
          activities: cloudData.activities,
          dailyLogs: cloudData.dailyLogs,
          streaks: cloudData.streaks,
        }});
        setSyncStatus('synced');
      } else {
        setSyncStatus('idle');
      }
      isInitialLoad.current = false;
    }).catch(() => { setSyncStatus('error'); isInitialLoad.current = false; });
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(KEYS.GOAL, state.goal);
    saveToStorage(KEYS.ACTIVITIES, state.activities);
    saveToStorage(KEYS.DAILY_LOGS, state.dailyLogs);
    saveToStorage(KEYS.STREAKS, state.streaks);
  }, [state.goal, state.activities, state.dailyLogs, state.streaks]);

  // Auto-sync to cloud (debounced)
  useEffect(() => {
    if (isInitialLoad.current || !getGitHubToken()) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      setSyncStatus('syncing');
      const result = await syncToCloud(state);
      setSyncStatus(result.ok ? 'synced' : 'error');
    }, 2000);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [state.goal, state.activities, state.dailyLogs, state.streaks]);

  // Midnight reset check — runs on an interval
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        dispatch({ type: ACTION.HYDRATE, payload: {} });
      }
    };
    const interval = setInterval(checkMidnight, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayKey = getTodayKey();
  const todayEntries = state.dailyLogs[todayKey] || [];
  const todayTotal = todayEntries.reduce((sum, e) => sum + e.totalTouches, 0);
  const progress = Math.min((todayTotal / state.goal) * 100, 100);
  const remaining = Math.max(state.goal - todayTotal, 0);
  const goalReached = todayTotal >= state.goal;

  const actions = {
    setGoal: useCallback((goal) => dispatch({ type: ACTION.SET_GOAL, payload: goal }), []),
    addEntry: useCallback((entry) => dispatch({ type: ACTION.ADD_ENTRY, payload: entry }), []),
    deleteEntry: useCallback((date, entryId) => dispatch({ type: ACTION.DELETE_ENTRY, payload: { date, entryId } }), []),
    resetToday: useCallback(() => dispatch({ type: ACTION.RESET_TODAY }), []),
    addActivity: useCallback((activity) => dispatch({ type: ACTION.ADD_ACTIVITY, payload: activity }), []),
    updateActivity: useCallback((activity) => dispatch({ type: ACTION.UPDATE_ACTIVITY, payload: activity }), []),
    deleteActivity: useCallback((id) => dispatch({ type: ACTION.DELETE_ACTIVITY, payload: id }), []),
    setTab: useCallback((tab) => dispatch({ type: ACTION.SET_TAB, payload: tab }), []),
    manualSync: useCallback(async () => {
      if (!getGitHubToken()) return;
      setSyncStatus('syncing');
      const result = await syncToCloud(state);
      setSyncStatus(result.ok ? 'synced' : 'error');
    }, [state]),
    forceLoadCloud: useCallback(async () => {
      if (!getGitHubToken()) return;
      setSyncStatus('loading');
      const cloudData = await loadFromCloud();
      if (cloudData) {
        dispatch({ type: ACTION.HYDRATE, payload: {
          goal: cloudData.goal,
          activities: cloudData.activities,
          dailyLogs: cloudData.dailyLogs,
          streaks: cloudData.streaks,
        }});
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    }, []),
  };

  const value = {
    ...state,
    todayKey,
    todayEntries,
    todayTotal,
    progress,
    remaining,
    goalReached,
    syncStatus,
    actions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
