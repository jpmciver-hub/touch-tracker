import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, PlusCircle, History, BarChart3, Settings, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log', label: 'Log', icon: PlusCircle },
  { id: 'history', label: 'History', icon: History },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'activities', label: 'Activities', icon: Settings },
];

export default function Navigation() {
  const { activeTab, actions } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-6 bg-surface-850/80 backdrop-blur-xl border-r border-white/5 z-40">
        <div className="mb-8">
          <Zap size={28} className="text-brand-400" />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => actions.setTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 group ${
                  isActive ? 'text-brand-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-600/15 rounded-xl"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon size={20} className="relative z-10" />
                <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-850/90 backdrop-blur-xl border-t border-white/5 z-40 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => actions.setTab(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${
                  isActive ? 'text-brand-400' : 'text-gray-500'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute inset-0 bg-brand-600/15 rounded-xl"
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <Icon size={18} className="relative z-10" />
                <span className="text-[9px] font-medium relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
