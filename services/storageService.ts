import { DailyLog } from '../types';
import { v4 as uuidv4 } from 'uuid'; 

const USER_KEY = 'skinglow_user';

// Hardcoded accounts
const CREDENTIALS: Record<string, string> = {
  'Timo': 'Grassijsje22',
  'Amy': 'Dikkie'
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Helper om de unieke key voor de huidige gebruiker te krijgen
const getCurrentUserLogKey = (username?: string): string => {
  const user = username || localStorage.getItem(USER_KEY);
  if (!user) return 'skinglow_logs_guest';
  return `skinglow_logs_${user}`;
};

export const verifyCredentials = (username: string, password: string): boolean => {
  // Hoofdlettergevoeligheid negeren voor gebruikersnaam
  const cleanName = Object.keys(CREDENTIALS).find(k => k.toLowerCase() === username.toLowerCase());
  if (!cleanName) return false;
  return CREDENTIALS[cleanName] === password;
};

export const saveLog = (log: DailyLog) => {
  const existingLogs = getLogs();
  const index = existingLogs.findIndex(l => l.id === log.id);
  
  if (index >= 0) {
    existingLogs[index] = log;
  } else {
    existingLogs.push(log);
  }
  
  localStorage.setItem(getCurrentUserLogKey(), JSON.stringify(existingLogs));
};

export const getLogs = (): DailyLog[] => {
  const key = getCurrentUserLogKey();
  const logs = localStorage.getItem(key);
  return logs ? JSON.parse(logs) : [];
};

export const getUser = (): string | null => {
  return localStorage.getItem(USER_KEY);
};

export const loginUser = (name: string) => {
  // Zorg dat we de "echte" naam gebruiken zoals in de credentials (voor consistentie)
  const realName = Object.keys(CREDENTIALS).find(k => k.toLowerCase() === name.toLowerCase()) || name;
  localStorage.setItem(USER_KEY, realName);
  
  // Check of we voor deze gebruiker al ooit data hebben 'geseed' (ingeladen)
  // Zo niet, en de lijst is leeg, laad dan demo data.
  // Als we al wel geseeed hebben, maar de lijst is leeg (gebruiker heeft alles gewist), doe niets.
  const hasSeededKey = `skinglow_seeded_${realName}`;
  const hasSeeded = localStorage.getItem(hasSeededKey);

  if (!hasSeeded && getLogs().length === 0) {
    seedData(realName);
    localStorage.setItem(hasSeededKey, 'true');
  }
};

export const logoutUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Nieuwe functie: Data wissen voor de ingelogde gebruiker
export const clearUserData = () => {
  const key = getCurrentUserLogKey();
  localStorage.removeItem(key);
  // We verwijderen NIET de 'seeded' key, want we willen niet dat demo data terugkomt
};

const seedData = (username: string) => {
  const logs: DailyLog[] = [];
  const today = new Date();
  
  // Maak de data iets anders op basis van de gebruiker om het verschil te laten zien
  const isAmy = username === 'Amy';
  
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Amy heeft vaker stress in de demo data, Timo eet slechter
    const stress = isAmy ? Math.floor(Math.random() * 4) + 2 : Math.floor(Math.random() * 3); 
    const ateBad = isAmy ? Math.random() > 0.8 : Math.random() > 0.4;
    
    // Logica voor puistjes in demo data
    const hasPimple = isAmy 
        ? (i % 6 === 0) // Amy patroon
        : (ateBad && Math.random() > 0.5); // Timo patroon

    logs.push({
      id: generateId(),
      date: dateStr,
      activities: isAmy ? 'Yoga, werken' : 'Gamen, werken',
      food: {
        breakfast: isAmy ? 'Smoothie' : 'Broodje kaas',
        lunch: 'Salade',
        dinner: ateBad ? 'Pizza' : 'Stamppot',
        snacks: ateBad ? (isAmy ? 'Chocolade' : 'Chips') : 'Fruit',
        drinks: 'Water, koffie'
      },
      alcohol: { consumed: i % 7 === 0, details: 'Glas wijn' },
      makeup: { worn: isAmy, details: isAmy ? 'Foundation' : '' },
      skincare: { am: 'Basis routine', pm: 'Basis routine' },
      hygiene: { showered: true, pillowCaseChanged: i % 7 === 0 },
      lifestyle: {
        stress: stress,
        sleepHours: isAmy ? 7 : 8,
        sleepQuality: 'Goed',
        exercise: i % 2 === 0,
        faceWashedAfterSweat: true,
        faceTouching: false,
        sunExposure: false,
        spfUsed: true
      },
      skin: {
        newPimple: hasPimple,
        newPimpleLocation: hasPimple ? 'Kin' : '',
        oldPimple: false,
        oldPimpleStatus: ''
      },
      menstruation: {
        active: isAmy && i < 5, 
        symptoms: isAmy && i < 5 ? ['Buikpijn'] : [],
        other: ''
      },
      notes: `Demo data voor ${username}`
    });
  }
  localStorage.setItem(`skinglow_logs_${username}`, JSON.stringify(logs));
};