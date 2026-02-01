import { GoogleGenAI } from "@google/genai";
import { DailyLog } from "../types";

const getAiClient = () => {
  // Using the API key from environment as mandated
  if (!process.env.API_KEY) {
    console.error("API Key not found via process.env.API_KEY");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeSkinTrends = async (logs: DailyLog[]): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Geen API sleutel gevonden. Kan geen AI analyse uitvoeren.";

  // Simplify data for the prompt to save tokens
  const simpleData = logs.map(l => ({
    date: l.date,
    food: l.food.snacks + ' ' + l.food.dinner,
    stress: l.lifestyle.stress,
    sleep: l.lifestyle.sleepHours,
    pimple: l.skin.newPimple,
    cycle: l.menstruation.active
  }));

  const prompt = `
    Je bent een dermatologische data-analist. Ik geef je logboekdata van de afgelopen dagen.
    Analyseer patronen tussen voeding, stress, slaap, menstruatie en het ontstaan van puistjes.
    
    Data (JSON): ${JSON.stringify(simpleData)}
    
    Geef een korte, vriendelijke samenvatting (max 100 woorden) in het Nederlands. 
    Focus op mogelijke verbanden. Als er geen duidelijk verband is, zeg dat dan eerlijk.
    Gebruik emojis. Spreek de gebruiker aan met "je".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Kon geen analyse genereren.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Er is een fout opgetreden bij het ophalen van de analyse. Probeer het later opnieuw.";
  }
};