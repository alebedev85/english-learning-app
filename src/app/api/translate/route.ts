import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function translateWord(word: string) {
  const prompt = `Translate the English word or short phrase "${word}" into Russian. Provide only the most popular Russian translation (1-3 words, no explanations). Also, provide a short natural example sentence using this word in English. Format your answer strictly as a JSON object with keys "translation" and "example". Example output: {"translation": "Мечта", "example": "Follow your dream"}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  // 🛠️ ЛОГГЕР ОШИБОК: Если Google ругается, мы выведем детали в терминал ВС
  if (!response.ok) {
    const errorDetails = await response.text();
    console.error("🔴 ГЕМИНИ РУГАЕТСЯ. Статус:", response.status);
    console.error("🔴 Детали ошибки от Google:", errorDetails);
    throw new Error(`Gemini API failed with status ${response.status}`);
  }

  const result = await response.json();
  const textResponse = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return textResponse ? JSON.parse(textResponse) : null;
}

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word?.trim()) {
      return NextResponse.json({ error: "Слово не указано" }, { status: 400 });
    }

    const aiData = await translateWord(word);

    if (!aiData) {
      return NextResponse.json({ error: "Не удалось распарсить ответ ИИ" }, { status: 500 });
    }

    return NextResponse.json({
      translation: aiData.translation,
      example: aiData.example,
    });
  } catch (error: any) {
    console.error("🔴 [Translate Route Error]:", error);
    return NextResponse.json({ error: error.message || "Ошибка сервера" }, { status: 500 });
  }
}