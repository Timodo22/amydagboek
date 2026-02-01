import { DailyLog } from '../types';

export interface PatternInsight {
  title: string;
  description: string;
  intensity: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
}

const getPreviousDate = (dateStr: string, daysBack: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - daysBack);
  return date.toISOString().split('T')[0];
};

export const analyzePatterns = (logs: DailyLog[]): PatternInsight[] => {
  if (logs.length < 3) return [];

  const pimpleDays = logs.filter(l => l.skin.newPimple);
  const totalPimpleDays = pimpleDays.length;

  if (totalPimpleDays === 0) return [];

  // Verzamelen van data van de dagen VOOR de puistjes (Lag analysis)
  // We kijken naar 1 en 2 dagen voor de uitbraak.
  const causeLogs: DailyLog[] = [];
  
  pimpleDays.forEach(pLog => {
    const dayBefore = getPreviousDate(pLog.date, 1);
    const twoDaysBefore = getPreviousDate(pLog.date, 2);
    
    const log1 = logs.find(l => l.date === dayBefore);
    const log2 = logs.find(l => l.date === twoDaysBefore);
    
    if (log1) causeLogs.push(log1);
    if (log2) causeLogs.push(log2);
  });

  if (causeLogs.length === 0) return [];

  const insights: PatternInsight[] = [];

  // --- 1. Hormonale Check (Directe link, geen vertraging) ---
  const hormonalPimpleDays = pimpleDays.filter(l => l.menstruation.active).length;
  const hormonalPercentage = (hormonalPimpleDays / totalPimpleDays) * 100;
  
  if (hormonalPercentage > 50) {
    insights.push({
      title: "Hormonale Cyclus",
      description: `Op ${Math.round(hormonalPercentage)}% van de dagen met nieuwe puistjes was je ongesteld. Dit lijkt een grote trigger.`,
      intensity: hormonalPercentage > 75 ? 'high' : 'medium',
      icon: '🩸',
      color: 'bg-red-100 text-red-800'
    });
  }

  // --- 2. Stress Analyse (Dagen ervoor) ---
  const avgStressGlobal = logs.reduce((acc, l) => acc + l.lifestyle.stress, 0) / logs.length;
  const avgStressBeforePimple = causeLogs.reduce((acc, l) => acc + l.lifestyle.stress, 0) / causeLogs.length;

  if (avgStressBeforePimple > 3 && avgStressBeforePimple > avgStressGlobal + 0.5) {
    insights.push({
      title: "Stress Piek",
      description: `In de dagen voor een uitbraak is je stressniveau gemiddeld ${avgStressBeforePimple.toFixed(1)}/5.`,
      intensity: avgStressBeforePimple > 4 ? 'high' : 'medium',
      icon: '🤯',
      color: 'bg-orange-100 text-orange-800'
    });
  }

  // --- 3. Alcohol Analyse (Dagen ervoor) ---
  const alcoholDaysBefore = causeLogs.filter(l => l.alcohol.consumed).length;
  const alcoholPercentage = (alcoholDaysBefore / causeLogs.length) * 100;
  const globalAlcoholPct = (logs.filter(l => l.alcohol.consumed).length / logs.length) * 100;

  if (alcoholPercentage > 30 && alcoholPercentage > globalAlcoholPct + 10) {
    insights.push({
      title: "Alcohol Consumptie",
      description: `Je dronk alcohol in de aanloop naar ${Math.round(alcoholPercentage)}% van je uitbraken.`,
      intensity: alcoholPercentage > 50 ? 'high' : 'medium',
      icon: '🍷',
      color: 'bg-purple-100 text-purple-800'
    });
  }

  // --- 4. Slaap Tekort (Dagen ervoor) ---
  const avgSleepBefore = causeLogs.reduce((acc, l) => acc + l.lifestyle.sleepHours, 0) / causeLogs.length;
  
  if (avgSleepBefore < 6.5) {
    insights.push({
      title: "Slaaptekort",
      description: `Vlak voor een uitbraak slaap je gemiddeld maar ${avgSleepBefore.toFixed(1)} uur.`,
      intensity: avgSleepBefore < 5.5 ? 'high' : 'medium',
      icon: '😴',
      color: 'bg-blue-100 text-blue-800'
    });
  }

  // --- 5. Suiker/Slecht Eten (Simpele keyword check) ---
  // Keywords: choc, snoep, suiker, friet, pizza, vet
  const badFoodKeywords = ['choc', 'snoep', 'suiker', 'friet', 'pizza', 'burger', 'chips', 'koek'];
  let badFoodCount = 0;
  
  causeLogs.forEach(l => {
    const foodStr = (l.food.snacks + ' ' + l.food.dinner).toLowerCase();
    if (badFoodKeywords.some(keyword => foodStr.includes(keyword))) {
      badFoodCount++;
    }
  });
  
  const badFoodPercentage = (badFoodCount / causeLogs.length) * 100;

  if (badFoodPercentage > 40) {
    insights.push({
      title: "Voeding (Suiker/Vet)",
      description: `Op ${Math.round(badFoodPercentage)}% van de dagen voor een puistje at je snacks of vet eten.`,
      intensity: 'medium',
      icon: '🍫',
      color: 'bg-yellow-100 text-yellow-800'
    });
  }
  
  // --- 6. Hygiëne (Kussensloop) ---
  const pillowChangeBefore = causeLogs.filter(l => l.hygiene.pillowCaseChanged).length;
  // Als je bijna nooit je kussen verschoont voor een puistje (minder dan 10% van de tijd) en globaal wel vaker?
  // Dit is lastig statistisch te maken met kleine datasets, dus we houden het simpel:
  // Als er 0 keer verschoond is in de causeLogs set, maar wel puistjes:
  if (causeLogs.length > 5 && pillowChangeBefore === 0) {
      insights.push({
          title: "Kussensloop",
          description: "Je hebt je kussensloop niet verschoond in de dagen voor je uitbraken.",
          intensity: 'low',
          icon: '🛏️',
          color: 'bg-gray-100 text-gray-800'
      });
  }

  return insights;
};