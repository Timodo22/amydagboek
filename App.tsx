import React, { useState, useEffect } from 'react';
import { ViewState, DailyLog } from './types';
import { getLogs, getUser, logoutUser } from './services/storageService';
import Dashboard from './components/Dashboard';
import EntryForm from './components/EntryForm';
import Auth from './components/Auth';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    // Check if user is already "logged in"
    const savedUser = getUser();
    if (savedUser) {
      setUser(savedUser);
      setLogs(getLogs());
      setView('DASHBOARD');
    }
  }, []);

  const handleLogin = () => {
    setUser(getUser());
    setLogs(getLogs());
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setView('LOGIN');
  };

  const handleEntryComplete = () => {
    setLogs(getLogs()); // Refresh data
    setView('DASHBOARD');
  };

  return (
    <div className="font-sans text-gray-800">
      {view === 'LOGIN' && (
        <Auth onLogin={handleLogin} />
      )}

      {view === 'DASHBOARD' && user && (
        <Dashboard 
          username={user} 
          logs={logs} 
          onAddEntry={() => setView('ENTRY_FORM')} 
          onLogout={handleLogout}
        />
      )}

      {view === 'ENTRY_FORM' && (
        <div className="min-h-screen bg-pink-50 py-8 px-4">
            <EntryForm onClose={handleEntryComplete} />
        </div>
      )}
    </div>
  );
};

export default App;