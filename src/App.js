import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import QuickLog from './components/QuickLog';
import HistoryPanel from './components/HistoryPanel';
import Analytics from './components/Analytics';
import ActivityManager from './components/ActivityManager';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function AppContent() {
  const { activeTab } = useApp();

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'log': return <QuickLog />;
      case 'history': return <HistoryPanel />;
      case 'analytics': return <Analytics />;
      case 'activities': return <ActivityManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen dark">
      <Navigation />
      <main className="md:ml-20 pb-24 md:pb-8 px-4 md:px-8 pt-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
