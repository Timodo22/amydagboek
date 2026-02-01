export interface FoodEntry {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  drinks: string;
}

export interface AlcoholEntry {
  consumed: boolean;
  details: string;
}

export interface MakeupEntry {
  worn: boolean;
  details: string;
}

export interface SkincareEntry {
  am: string;
  pm: string;
}

export interface HygieneEntry {
  showered: boolean;
  pillowCaseChanged: boolean;
}

export interface LifestyleEntry {
  stress: number; // 0-5
  sleepHours: number;
  sleepQuality: 'Slecht' | 'Redelijk' | 'Goed';
  exercise: boolean;
  faceWashedAfterSweat: boolean | null; // null if no exercise
  faceTouching: boolean;
  sunExposure: boolean;
  spfUsed: boolean | null; // null if no sun
}

export interface SkinEntry {
  newPimple: boolean;
  newPimpleLocation: string;
  oldPimple: boolean;
  oldPimpleStatus: string; // rood, pijnlijk, genezend
}

export interface MenstruationEntry {
  active: boolean;
  symptoms: string[]; // Buikpijn, Hoofdpijn, Hormonaal, etc.
  other: string;
}

export interface DailyLog {
  id: string;
  date: string;
  activities: string;
  food: FoodEntry;
  alcohol: AlcoholEntry;
  makeup: MakeupEntry;
  skincare: SkincareEntry;
  hygiene: HygieneEntry;
  lifestyle: LifestyleEntry;
  skin: SkinEntry;
  menstruation: MenstruationEntry;
  notes: string;
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'ENTRY_FORM';