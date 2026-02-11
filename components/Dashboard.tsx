import React, { useMemo, useState } from 'react';
import { DailyLog } from '../types';
import Charts from './Charts';
import { analyzePatterns } from '../services/patternAnalysis';
import { clearUserData } from '../services/storageService';
import EntryForm from './EntryForm'; // Zorg dat deze import klopt

interface DashboardProps {
  username: string;
  logs: DailyLog[];
  onLogout: () => void;
  // onAddEntry is niet meer nodig als prop, dat doet het dashboard nu zelf
}

const Dashboard: React.FC<DashboardProps> = ({ username, logs, onLogout }) => {
  // State voor het beheren van de modal (nieuw of bewerken)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<DailyLog | undefined>(undefined);

  // Filter logs for stats
  const totalEntries = logs.length;
  const pimpleDays = logs.filter(l => l.skin.newPimple).length;
  const avgStress = logs.length > 0 ? (logs.reduce((acc, curr) => acc + curr.lifestyle.stress, 0) / logs.length).toFixed(1) : 0;

  // Run analysis when logs change
  const patterns = useMemo(() => analyzePatterns(logs), [logs]);

  const handleClearData = () => {
    if (window.confirm(`Weet je zeker dat je alle data voor ${username} wilt wissen? Dit kan niet ongedaan gemaakt worden.`)) {
        clearUserData();
        window.location.reload();
    }
  };

  // Functie voor NIEUWE entry
  const handleAddNew = () => {
    setEditingLog(undefined); // Geen data meegeven = leeg formulier
    setIsModalOpen(true);
  };

  // Functie voor BEWERKEN (wordt aangeroepen als je op een rij klikt)
  const handleEditEntry = (log: DailyLog) => {
    setEditingLog(log); // Vul het formulier met deze data
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLog(undefined);
    // Optioneel: herlaad pagina of trigger een update als je live updates wilt zien zonder refresh
    // window.location.reload(); 
    // Beter is om de logs state in de parent (App.tsx) te updaten, maar een reload werkt altijd:
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      {/* Top Bar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-600">✨ SkinGlow</h1>
        <div className="flex items-center gap-4">
            <span className="text-gray-600 hidden sm:block">Hi, {username}!</span>
            <button onClick={onLogout} className="text-sm text-pink-400 hover:text-pink-600 underline">Uitloggen</button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pink-400">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Aantekeningen</p>
                <p className="text-2xl font-bold text-gray-800">{totalEntries}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-400">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Breakouts</p>
                <p className="text-2xl font-bold text-gray-800">{pimpleDays} <span className="text-sm font-normal text-gray-400">dagen</span></p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-purple-400">
                <p className="text-gray-500 text-xs uppercase tracking-wider">Gem. Stress</p>
                <p className="text-2xl font-bold text-gray-800">{avgStress} <span className="text-sm font-normal text-gray-400">/ 5</span></p>
            </div>
            <button 
                onClick={handleAddNew}
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-md flex flex-col items-center justify-center transition transform hover:scale-105"
            >
                <span className="text-2xl">+</span>
                <span className="text-sm font-bold">Vandaag invullen</span>
            </button>
        </div>

        {/* Pattern Detective Section */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔎</span>
                <div>
                    <h2 className="text-xl font-bold text-pink-700">Huid-Detective</h2>
                    <p className="text-sm text-gray-500">
                        Wij zoeken naar patronen in de 24-48 uur <span className="font-semibold">voor</span> een puistje ontstaat.
                    </p>
                </div>
            </div>

            {pimpleDays === 0 ? (
                 <div className="bg-green-50 text-green-800 p-4 rounded-lg">
                    Geen puistjes geregistreerd! Goed bezig. 🎉 Vul het dagboek in als je een uitbraak hebt om patronen te vinden.
                 </div>
            ) : patterns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patterns.map((insight, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${insight.color} border-opacity-20`}>
                            <div className="flex items-center gap-2 font-bold mb-2">
                                <span className="text-xl">{insight.icon}</span>
                                <h3>{insight.title}</h3>
                            </div>
                            <p className="text-sm opacity-90">{insight.description}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 text-gray-600 p-4 rounded-lg text-center italic">
                    Nog niet genoeg data om duidelijke boosdoeners aan te wijzen. <br/>
                    Blijf je dagboek invullen, dan wordt de detective slimmer! 🕵️‍♀️
                </div>
            )}
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
            <div className="mb-4">
                 <h3 className="text-lg font-bold text-gray-700">Grafieken</h3>
                 <p className="text-xs text-gray-400 md:hidden italic">← Veeg over de grafiek →</p>
            </div>
            <div className="overflow-x-auto touch-pan-x pb-2">
                <div className="min-w-[600px] min-h-[400px]">
                    <Charts data={logs} />
                </div>
            </div>
        </div>

        {/* Recent History List - NU KLIKBAAR */}
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">Recente Logboeken</h3>
            <p className="text-xs text-gray-400 mb-2 italic">Klik op een rij om deze aan te passen ✏️</p>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-500">
                            <th className="pb-2">Datum</th>
                            <th className="pb-2">Stress</th>
                            <th className="pb-2">Huid</th>
                            <th className="pb-2">Voeding</th>
                            <th className="pb-2">Slaap</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(log => (
                            <tr 
                                key={log.id} 
                                onClick={() => handleEditEntry(log)}
                                className="border-b border-gray-50 hover:bg-pink-50 cursor-pointer transition-colors"
                                title="Klik om te bewerken"
                            >
                                <td className="py-3 font-medium text-pink-600">{new Date(log.date).toLocaleDateString()}</td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${log.lifestyle.stress > 3 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {log.lifestyle.stress}/5
                                    </span>
                                </td>
                                <td className="py-3">
                                    {log.skin.newPimple ? '🔴 Breakout' : '✨ Rustig'}
                                </td>
                                <td className="py-3 text-gray-500 truncate max-w-[150px]">{log.food.dinner || '-'}</td>
                                <td className="py-3">{log.lifestyle.sleepHours}u</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        
        {/* Settings Area */}
        <div className="text-center pt-8 border-t border-gray-200 mt-8">
            <button 
                onClick={handleClearData} 
                className="text-red-400 text-xs hover:text-red-600 underline"
            >
                ⚠️ Alle data van {username} wissen
            </button>
        </div>

      </main>

      {/* MODAL VOOR INVULLEN/BEWERKEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm overflow-y-auto">
             <div className="w-full max-w-2xl max-h-screen overflow-y-auto my-auto">
                <EntryForm 
                    onClose={handleCloseModal} 
                    initialData={editingLog} 
                />
             </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;