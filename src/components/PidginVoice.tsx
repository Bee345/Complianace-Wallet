import React, { useState } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { Volume2, VolumeX, Loader2 } from 'lucide-react';

interface PidginVoiceProps {
  text: string;
  context?: string;
}

export const PidginVoice: React.FC<PidginVoiceProps> = ({ text, context }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const playGuidance = async () => {
    if (audio) {
      audio.play();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Translate this text to clear, helpful Nigerian Pidgin English for a street vendor. 
      Context: ${context || 'General app guidance'}.
      Text: ${text}
      Only return the Pidgin translation.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully in Pidgin: ${prompt}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
        const newAudio = new Audio(audioUrl);
        newAudio.onended = () => setIsPlaying(false);
        setAudio(newAudio);
        newAudio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('TTS Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopGuidance = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={isPlaying ? stopGuidance : playGuidance}
      disabled={isLoading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        isPlaying 
          ? 'bg-[#141414] text-white border-[#141414]' 
          : 'bg-white text-[#141414] border-[#141414] hover:bg-[#f5f5f5]'
      }`}
    >
      {isLoading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : isPlaying ? (
        <VolumeX size={14} />
      ) : (
        <Volume2 size={14} />
      )}
      <span className="text-[10px] font-mono uppercase font-bold tracking-widest">
        {isLoading ? 'Loading...' : isPlaying ? 'Stop Voice' : 'Listen (Pidgin)'}
      </span>
    </button>
  );
};
