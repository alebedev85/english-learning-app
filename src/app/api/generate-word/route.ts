import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Запрос перевода к стабильной Gemini.
 */
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

/**
 * Генерация изображения Nano Banana 2.
 */
async function generateImage(word: string, translation: string) {
  const prompt = `A clean clear vector educational illustration of '${word}' (${translation}) for kids, white background, minimalist style`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`;

  const payload = {
    instances: [{ prompt: prompt }],
    parameters: { sampleCount: 1 },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("🔴 Ошибка Nano Banana API. Статус:", response.status);
      console.error("🔴 Детали:", errText);
      return null;
    }

    const result = await response.json();

    // Вытаскиваем base64 из нативного формата генерации медиафайлов Google
    const base64Data =
      result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    return base64Data || null;
  } catch (error) {
    console.error("🔴 Исключение при генерации картинки:", error);
    return null;
  }
}

/**
 * Главный обработчик API-роута POST /api/generate-word
 */
export async function POST(req: Request) {
  try {
    const { word, needImage } = await req.json();

    if (!word?.trim()) {
      return NextResponse.json({ error: "Слово не указано" }, { status: 400 });
    }

    // 1. Получаем структурированный перевод
    const aiData = await translateWord(word);

    // 2. Генерируем картинку через Imagen
    let imageBase64 = null;
    if (needImage && aiData?.translation) {
      try {
        imageBase64 = await generateImage(word, aiData.translation);
      } catch (imgError: any) {
        console.warn(
          "⚠️ Не удалось сгенерировать изображение:",
          imgError.message,
        );
      }
    }

    return NextResponse.json({
      translation: aiData.translation,
      example: aiData.example,
      imageBase64: imageBase64,
    });
  } catch (error: any) {
    console.error("🔴 [API Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
