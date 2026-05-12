import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { Activity, Clock, TrendingUp, Target } from 'lucide-react';
import { useApp } from '../context/AppContext';

const COLORS = ['#818cf8', '#34d399', '#f472b6', '#fb923c', '#38bdf8', '#facc15', '#a78bfa', '#f87171'];

function StatCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-2">
        <Icon size={14} />
        {label}
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-gray-600 mt-1">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { dailyLogs, todayEntries, todayTotal, goal } = useApp();

  // Activity breakdown for today
  const activityBreakdown = useMemo(() => {
    const map = {};
    todayEntries.forEach(e => {
      if (!map[e.activityName]) {
        map[e.activityName] = { name: e.activityName, touches: 0, reps: 0, sessions: 0, color: e.activityColor || '#6366f1' };
      }
      map[e.activityName].touches += e.totalTouches;
      map[e.activityName].reps += e.reps;
      map[e.activityName].sessions += 1;
    });
    return Object.values(map).sort((a, b) => b.touches - a.touches);
  }, [todayEntries]);

  // Timeline data (touches by hour today)
  const timelineData = useMemo(() => {
    const hours = {};
    for (let i = 0; i < 24; i++) {
      hours[i] = { hour: `${i}:00`, touches: 0 };
    }
    todayEntries.forEach(e => {
      const h = new Date(e.timestamp).getHours();
      hours[h].touches += e.totalTouches;
    });
    // Only show hours with data plus surrounding context
    const entries = Object.values(hours);
    const firstActive = entries.findIndex(h => h.touches > 0);
    const lastActive = entries.length - 1 - [...entries].reverse().findIndex(h => h.touches > 0);
    if (firstActive === -1) return entries.slice(6, 22); // Default view
    const start = Math.max(0, firstActive - 1);
    const end = Math.min(23, lastActive + 2);
    return entries.slice(start, end);
  }, [todayEntries]);

  // Weekly data (last 7 days)
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const entries = dailyLogs[key] || [];
      const total = entries.reduce((sum, e) => sum + e.totalTouches, 0);
      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: key,
        touches: total,
        goal: goal,
        metGoal: total >= goal,
      });
    }
    return data;
  }, [dailyLogs, goal]);

  const weeklyTotal = weeklyData.reduce((sum, d) => sum + d.touches, 0);
  const weeklyAvg = Math.round(weeklyTotal / 7);
  const daysGoalMet = weeklyData.filter(d => d.metGoal).length;

  // Pie chart data for activity breakdown
  const pieData = activityBreakdown.map((a, i) => ({
    ...a,
    fill: a.color || COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-gray-500 text-sm">Training insights and trends</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="TODAY" value={todayTotal.toLocaleString()} sub="touches" color="text-brand-400" />
        <StatCard icon={Clock} label="SESSIONS" value={todayEntries.length} sub="today" />
        <StatCard icon={TrendingUp} label="WEEKLY AVG" value={weeklyAvg.toLocaleString()} sub="touches/day" />
        <StatCard icon={Target} label="GOALS MET" value={`${daysGoalMet}/7`} sub="this week" color="text-emerald-400" />
      </div>

      {/* Weekly chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-4">Last 7 Days</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="touches" name="Touches" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, i) => (
                  <Cell key={i} fill={entry.metGoal ? '#34d399' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Today's Timeline</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="touchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="touches" name="Touches" stroke="#6366f1" fill="url(#touchGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">Activity Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              No activity data yet today
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-36 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="touches" innerRadius={35} outerRadius={60} paddingAngle={3}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {activityBreakdown.map((a, i) => (
                  <div key={a.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="text-xs text-gray-300 truncate">{a.name}</span>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-white">{a.touches}</span>
                      <span className="text-gray-600 ml-1">({Math.round((a.touches / todayTotal) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Weekly total */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Weekly Summary</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{weeklyTotal.toLocaleString()}</span>
          <span className="text-gray-500">total touches this week</span>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {daysGoalMet} of 7 days at or above goal ({goal.toLocaleString()})
        </div>
      </div>
    </div>
  );
}
