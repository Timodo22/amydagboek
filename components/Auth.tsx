import React, { useState } from 'react';
import { loginUser, verifyCredentials } from '../services/storageService';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (verifyCredentials(name, password)) {
        loginUser(name);
        onLogin();
    } else {
        setError('Naam of wachtwoord is onjuist.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-pink-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-pink-600 mb-2">SkinGlow</h1>
            <p className="text-gray-500">Jouw persoonlijke huid & leefstijl dagboek.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Gebruikersnaam</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition"
                    placeholder="Bijv. Timo of Amy"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Wachtwoord</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition"
                    placeholder="••••••••"
                    required
                />
            </div>
            
            {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition hover:-translate-y-0.5 mt-2"
            >
                Inloggen
            </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
            Data wordt lokaal opgeslagen per gebruiker.
        </p>
      </div>
    </div>
  );
};

export default Auth;