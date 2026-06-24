import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function generateImage(word: string, translation: string) {
  const prompt = `A clean clear vector educational illustration of '${word}' (${translation}) for kids, white background, minimalist style`;
  
  // ⚡️ Переключаемся на бесплатную и стабильную модель Nano Banana 2
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("🔴 Ошибка Nano Banana API. Статус:", response.status);
      console.error("🔴 Детали:", errText);
      return null;
    }

    const result = await response.json();
    
    // Вытаскиваем base64 из нативного формата генерации медиафайлов Google
    const base64Data = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    return base64Data || null;
  } catch (error) {
    console.error("🔴 Исключение при генерации картинки:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { word, translation } = await req.json();

    if (!word?.trim() || !translation?.trim()) {
      return NextResponse.json({ error: "Не передано слово или перевод" }, { status: 400 });
    }

    const imageBase64 = await generateImage(word, translation);

    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error("🔴 [Image Route Error]:", error);
    return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
  }
}