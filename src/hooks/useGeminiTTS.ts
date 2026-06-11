import { useState, useCallback } from "react";

// Вспомогательная функция сборки WAV-файла из сырых PCM-данных, которые присылает Gemini
function pcmToWavUrl(base64Audio: string, sampleRate = 24000): string {
  const byteCharacters = atob(base64Audio);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const buffer = new Uint8Array(byteNumbers).buffer;
  
  // Формируем стандартный заголовк WAV (RIFF)
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  view.setUint32(0, 0x46464952, true); // "RIFF"
  view.setUint32(4, 36 + buffer.byteLength, true);
  view.setUint32(8, 0x45564157, true); // "WAVE"
  view.setUint32(12, 0x20746d66, true); // "fmt "
  view.setUint32(16, 16, true); // Размер подблока
  view.setUint16(20, 1, true); // Аудио-формат (PCM = 1)
  view.setUint16(22, 1, true); // Количество каналов (Моно)
  view.setUint32(24, sampleRate, true); // Частота дискретизации
  view.setUint32(28, sampleRate * 2, true); // Байт в секунду
  view.setUint16(32, 2, true); // Выравнивание блока
  view.setUint16(34, 16, true); // Глубина звука (16 бит)
  view.setUint32(36, 0x61746164, true); // "data"
  view.setUint32(40, buffer.byteLength, true);

  const blob = new Blob([header, buffer], { type: "audio/wav" });
  return URL.createObjectURL(blob);
}

export function useGeminiTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Забираем ключ из .env (NEXT_PUBLIC_GEMINI_API_KEY)
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const speak = useCallback(async (text: string) => {
    if (!text || !apiKey || isPlaying) return;

    try {
      setIsPlaying(true);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{ parts: [{ text: `Say clearly in a professional British English accent: ${text}` }] }],
        generationConfig: { 
          responseModalities: ["AUDIO"], 
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: "Kore" } // Приятный дефолтный голос от Google
            } 
          } 
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      const base64Audio = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

      if (base64Audio) {
        const wavUrl = pcmToWavUrl(base64Audio, 24000);
        const audio = new Audio(wavUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(wavUrl);
        };

        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Gemini TTS Error:", err);
      setIsPlaying(false);
    }
  }, [apiKey, isPlaying]);

  return { speak, isPlaying };
}