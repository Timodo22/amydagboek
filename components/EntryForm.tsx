import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
// We importeren saveLog niet meer direct voor de submit, 
// we doen de logica hier om updates (edits) zeker goed te laten gaan.
// Tenzij je saveLog update in je service file.
import { USER_DATA_KEY } from '../services/storageService'; 
// Als je USER_DATA_KEY niet exporteert in storageService, zet dan hier: const USER_DATA_KEY = 'skinglow_data';

interface EntryFormProps {
  onClose: () => void;
  initialData?: DailyLog;
}

// Helper for generating default empty state
const createEmptyLog = (): DailyLog => ({
  id: Date.now().toString(),
  date: new Date().toISOString().split('T')[0],
  activities: '',
  food: { breakfast: '', lunch: '', dinner: '', snacks: '', drinks: '' },
  alcohol: { consumed: false, details: '' },
  makeup: { worn: false, details: '' },
  skincare: { am: '', pm: '' },
  hygiene: { showered: false, pillowCaseChanged: false },
  lifestyle: {
    stress: 0,
    sleepHours: 7,
    sleepQuality: 'Redelijk',
    exercise: false,
    faceWashedAfterSweat: null,
    faceTouching: false,
    sunExposure: false,
    spfUsed: null
  },
  skin: {
    newPimple: false,
    newPimpleLocation: '',
    oldPimple: false,
    oldPimpleStatus: ''
  },
  menstruation: { active: false, symptoms: [], other: '' },
  notes: ''
});

const SectionHeader = ({ title, icon }: { title: string; icon: string }) => (
  <h3 className="text-xl font-bold text-pink-600 mt-6 mb-3 flex items-center gap-2 border-b-2 border-pink-100 pb-1">
    <span>{icon}</span> {title}
  </h3>
);

const InputRow: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-gray-700 text-sm font-semibold mb-1">{label}</label>
    {children}
  </div>
);

const EntryForm: React.FC<EntryFormProps> = ({ onClose, initialData }) => {
  // Als we initialData hebben (bewerken), gebruiken we dat ID.
  // Anders maken we een nieuw ID aan.
  const [formData, setFormData] = useState<DailyLog>(initialData || createEmptyLog());
  
  // Is dit bewerken of nieuw?
  const isEditing = !!initialData;

  const handleChange = (section: keyof DailyLog, field: string | null, value: any) => {
    setFormData(prev => {
      if (field) {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: value
          }
        };
      }
      return { ...prev, [section]: value };
    });
  };

  const handleSymptomToggle = (symptom: string) => {
    const currentSymptoms = formData.menstruation.symptoms;
    let newSymptoms;
    if (currentSymptoms.includes(symptom)) {
      newSymptoms = currentSymptoms.filter(s => s !== symptom);
    } else {
      newSymptoms = [...currentSymptoms, symptom];
    }
    handleChange('menstruation', 'symptoms', newSymptoms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Haal bestaande data op uit localStorage
    // (Zorg dat de key 'skinglow_data' matcht met wat je in storageService.ts hebt staan)
    const STORAGE_KEY = 'skinglow_data'; 
    const storedData = localStorage.getItem(STORAGE_KEY);
    let logs: DailyLog[] = storedData ? JSON.parse(storedData) : [];

    if (isEditing) {
        // 2a. UPDATE: Zoek de oude log en vervang hem
        logs = logs.map(log => log.id === formData.id ? formData : log);
    } else {
        // 2b. NIEUW: Voeg toe aan de lijst
        logs.push(formData);
    }

    // 3. Opslaan
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    
    // Sluit modal
    onClose();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl mx-auto border border-pink-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-pink-700">
            {isEditing ? '🖊️ Dagboek Bewerken' : '✨ Nieuwe Aantekening'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">✕</button>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <InputRow label="Datum">
            <input 
              type="date" 
              required
              className="w-full p-2 border border-pink-200 rounded focus:ring-2 focus:ring-pink-300 outline-none"
              value={formData.date}
              onChange={(e) => handleChange('date', null, e.target.value)}
            />
          </InputRow>
          <InputRow label="Wat heb je gedaan vandaag?">
             <input 
              type="text" 
              className="w-full p-2 border border-pink-200 rounded focus:ring-2 focus:ring-pink-300 outline-none"
              placeholder="Gewerkt, gesport, relax..."
              value={formData.activities}
              onChange={(e) => handleChange('activities', null, e.target.value)}
            />
          </InputRow>
        </div>

        {/* Food */}
        <SectionHeader title="Eten & Drinken" icon="🍎" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (
             <InputRow key={meal} label={meal.charAt(0).toUpperCase() + meal.slice(1)}>
              <input 
                type="text" 
                className="w-full p-2 border border-pink-100 rounded bg-pink-50/50 focus:bg-white transition-colors"
                value={(formData.food as any)[meal]}
                onChange={(e) => handleChange('food', meal, e.target.value)}
              />
            </InputRow>
          ))}
          <InputRow label="Drinken">
             <input 
                type="text" 
                className="w-full p-2 border border-pink-100 rounded bg-pink-50/50"
                value={formData.food.drinks}
                onChange={(e) => handleChange('food', 'drinks', e.target.value)}
              />
          </InputRow>
        </div>

        <div className="mt-4 p-4 bg-pink-50 rounded-lg">
          <div className="flex items-center gap-3">
             <label className="font-semibold text-pink-800">Alcohol gedronken?</label>
             <input 
                type="checkbox" 
                className="w-5 h-5 accent-pink-500"
                checked={formData.alcohol.consumed}
                onChange={(e) => handleChange('alcohol', 'consumed', e.target.checked)}
             />
          </div>
          {formData.alcohol.consumed && (
             <input 
               type="text" 
               placeholder="Wat heb je gedronken?"
               className="w-full mt-2 p-2 border border-pink-200 rounded"
               value={formData.alcohol.details}
               onChange={(e) => handleChange('alcohol', 'details', e.target.value)}
             />
          )}
        </div>

        {/* Beauty */}
        <SectionHeader title="Beauty & Hygiëne" icon="💄" />
        <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                 <input type="checkbox" className="accent-pink-500 w-4 h-4" checked={formData.makeup.worn} onChange={(e) => handleChange('makeup', 'worn', e.target.checked)} />
                 Make-up gedragen?
              </label>
              {formData.makeup.worn && (
                  <input type="text" placeholder="Welke producten?" className="flex-1 p-1 border-b border-pink-200 bg-transparent outline-none" value={formData.makeup.details} onChange={(e) => handleChange('makeup', 'details', e.target.value)} />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputRow label="Skincare Ochtend">
                   <textarea className="w-full p-2 border border-pink-200 rounded h-20 text-sm" value={formData.skincare.am} onChange={(e) => handleChange('skincare', 'am', e.target.value)} />
                </InputRow>
                <InputRow label="Skincare Avond">
                   <textarea className="w-full p-2 border border-pink-200 rounded h-20 text-sm" value={formData.skincare.pm} onChange={(e) => handleChange('skincare', 'pm', e.target.value)} />
                </InputRow>
            </div>

            <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-pink-500 w-5 h-5" checked={formData.hygiene.showered} onChange={(e) => handleChange('hygiene', 'showered', e.target.checked)} />
                    🚿 Gedoucht
                </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-pink-500 w-5 h-5" checked={formData.hygiene.pillowCaseChanged} onChange={(e) => handleChange('hygiene', 'pillowCaseChanged', e.target.checked)} />
                    🛏️ Kussen verschoond
                </label>
            </div>
        </div>

        {/* Lifestyle */}
        <SectionHeader title="Leefstijl" icon="🧘‍♀️" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-semibold mb-2">Stressniveau (0-5)</label>
                <input 
                  type="range" min="0" max="5" step="1" 
                  className="w-full accent-pink-500"
                  value={formData.lifestyle.stress}
                  onChange={(e) => handleChange('lifestyle', 'stress', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Relaxed</span>
                    <span>Gemiddeld</span>
                    <span>Paniek!</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-2">
                 <InputRow label="Uren slaap">
                    <input type="number" className="w-full p-2 border border-pink-200 rounded" value={formData.lifestyle.sleepHours} onChange={(e) => handleChange('lifestyle', 'sleepHours', parseInt(e.target.value))} />
                 </InputRow>
                 <InputRow label="Kwaliteit">
                    <select className="w-full p-2 border border-pink-200 rounded" value={formData.lifestyle.sleepQuality} onChange={(e) => handleChange('lifestyle', 'sleepQuality', e.target.value)}>
                        <option>Slecht</option>
                        <option>Redelijk</option>
                        <option>Goed</option>
                    </select>
                 </InputRow>
             </div>
        </div>

        <div className="mt-4 space-y-2">
             <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                 <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-pink-500" checked={formData.lifestyle.exercise} onChange={(e) => handleChange('lifestyle', 'exercise', e.target.checked)} />
                    Gesport / Veel gezweet?
                 </label>
                 {formData.lifestyle.exercise && (
                     <label className="flex items-center gap-2 text-sm text-pink-700">
                        <input type="checkbox" className="accent-pink-600" checked={formData.lifestyle.faceWashedAfterSweat || false} onChange={(e) => handleChange('lifestyle', 'faceWashedAfterSweat', e.target.checked)} />
                        Gezicht direct gereinigd?
                     </label>
                 )}
             </div>

             <div className="flex items-center justify-between p-2 bg-pink-50 rounded">
                 <label className="flex items-center gap-2">
                    <input type="checkbox" className="accent-pink-500" checked={formData.lifestyle.sunExposure} onChange={(e) => handleChange('lifestyle', 'sunExposure', e.target.checked)} />
                    Veel zon gehad?
                 </label>
                 {formData.lifestyle.sunExposure && (
                     <label className="flex items-center gap-2 text-sm text-pink-700">
                        <input type="checkbox" className="accent-pink-600" checked={formData.lifestyle.spfUsed || false} onChange={(e) => handleChange('lifestyle', 'spfUsed', e.target.checked)} />
                        SPF Gebruikt?
                     </label>
                 )}
             </div>
              <label className="flex items-center gap-2 p-2">
                  <input type="checkbox" className="accent-pink-500" checked={formData.lifestyle.faceTouching} onChange={(e) => handleChange('lifestyle', 'faceTouching', e.target.checked)} />
                  Gezicht veel aangeraakt?
              </label>
        </div>

        {/* Skin & Menstruation */}
        <SectionHeader title="Huid & Cyclus" icon="🌺" />
        
        <div className="border border-red-100 bg-red-50 p-4 rounded-lg mb-4">
             <label className="flex items-center gap-2 font-bold text-red-800 cursor-pointer">
                <input type="checkbox" className="accent-red-500 w-5 h-5" checked={formData.skin.newPimple} onChange={(e) => handleChange('skin', 'newPimple', e.target.checked)} />
                🚨 Nieuw puistje vandaag?
             </label>
             {formData.skin.newPimple && (
                 <input type="text" placeholder="Waar? (bijv. kin, voorhoofd)" className="w-full mt-2 p-2 border border-red-200 rounded" value={formData.skin.newPimpleLocation} onChange={(e) => handleChange('skin', 'newPimpleLocation', e.target.value)} />
             )}
        </div>
        
        <div className="mb-4">
             <label className="flex items-center gap-2 font-semibold text-pink-800 cursor-pointer mb-2">
                <input type="checkbox" className="accent-pink-500" checked={formData.menstruation.active} onChange={(e) => handleChange('menstruation', 'active', e.target.checked)} />
                Menstruatie / Klachten?
             </label>
             {formData.menstruation.active && (
                 <div className="flex flex-wrap gap-2">
                    {['Buikpijn', 'Hoofdpijn', 'Hormonaal'].map(sym => (
                        <button 
                            key={sym} type="button"
                            onClick={() => handleSymptomToggle(sym)}
                            className={`px-3 py-1 rounded-full text-sm border ${formData.menstruation.symptoms.includes(sym) ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-gray-300'}`}
                        >
                            {sym}
                        </button>
                    ))}
                 </div>
             )}
        </div>

        <InputRow label="Notities">
            <textarea className="w-full p-2 border border-pink-200 rounded" rows={3} value={formData.notes} onChange={(e) => handleChange('notes', null, e.target.value)}></textarea>
        </InputRow>

        <button type="submit" className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-xl shadow-lg transform transition hover:scale-[1.01]">
            {isEditing ? 'Wijzigingen Opslaan' : 'Opslaan in Dagboek ✨'}
        </button>

      </form>
    </div>
  );
};

export default EntryForm;