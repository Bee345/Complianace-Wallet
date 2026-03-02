import { IPidginService } from "../../types";
import { GoogleGenAI } from "@google/genai";

/**
 * Implementation of the Pidgin Service using Gemini AI.
 * Handles translations and voice guidance scripts.
 */
export class GeminiPidginServiceImpl implements IPidginService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async translate(text: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following formal English text into friendly, clear Nigerian Pidgin English suitable for a market vendor in Port Harcourt: "${text}"`,
      config: {
        systemInstruction: "You are a helpful assistant that speaks perfect Nigerian Pidgin English. Your goal is to make formal compliance information easy to understand for micro-sellers.",
      },
    });
    return response.text || text;
  }

  async getVoiceGuidance(screenName: string, context: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, encouraging voice guidance script in Nigerian Pidgin English for the "${screenName}" screen. Context: ${context}`,
      config: {
        systemInstruction: "You are a friendly market guide. Keep your guidance short, clear, and encouraging.",
      },
    });
    return response.text || "Abeg, wait small, I dey load the guide.";
  }
}
