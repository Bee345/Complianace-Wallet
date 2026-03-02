import { GoogleGenAI } from "@google/genai";

/**
 * Gemini Service for the Street Vendor Compliance Wallet.
 * Handles Pidgin English translation and voice guidance.
 */

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  /**
   * Translates a given text into Pidgin English for market vendors.
   */
  async translateToPidgin(text: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following formal English text into friendly, clear Nigerian Pidgin English suitable for a market vendor in Port Harcourt: "${text}"`,
      config: {
        systemInstruction: "You are a helpful assistant that speaks perfect Nigerian Pidgin English. Your goal is to make formal compliance information easy to understand for micro-sellers.",
      },
    });
    return response.text || text;
  },

  /**
   * Generates a voice-over script or guidance in Pidgin.
   */
  async getVoiceGuidance(screenName: string, context: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, encouraging voice guidance script in Nigerian Pidgin English for the "${screenName}" screen. Context: ${context}`,
      config: {
        systemInstruction: "You are a friendly market guide. Keep your guidance short, clear, and encouraging.",
      },
    });
    return response.text || "Abeg, wait small, I dey load the guide.";
  },
};
