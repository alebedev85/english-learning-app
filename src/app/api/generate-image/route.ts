import { NextResponse } from "next/server";

// Замени переменную в .env на HF_TOKEN (берется в настройках Hugging Face -> Access Tokens)
const HF_TOKEN = process.env.HF_TOKEN;

async function generateImage(word: string, translation: string) {
  // Формируем чистый и строгий промпт с фокусом на типографику и смысл
  const prompt = `A clean clear vector educational illustration '${word}' for kids`;
  // 🔥 Обновленный актуальный URL шлюза Hugging Face Inference
  const url =
    "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`, // 🛠️ Убрали синтаксическую ошибку
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("🔴 Ошибка Hugging Face API. Статус:", response.status);
      console.error("🔴 Детали:", errText);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    return base64Data || null;
  } catch (error) {
    console.error("🔴 Исключение при генерации картинки на HF:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { word, translation } = await req.json();

    if (!word?.trim() || !translation?.trim()) {
      return NextResponse.json(
        { error: "Не передано слово или перевод" },
        { status: 400 },
      );
    }

    if (!HF_TOKEN) {
      console.error("🔴 Ошибка: Не задан HF_TOKEN в переменных окружения");
      return NextResponse.json(
        { error: "Конфигурация сервера не завершена" },
        { status: 500 },
      );
    }

    const imageBase64 = await generateImage(word, translation);

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Не удалось сгенерировать изображение" },
        { status: 500 },
      );
    }

    return NextResponse.json({ imageBase64 });
  } catch (error: any) {
    console.error("🔴 [Image Route Error]:", error);
    return NextResponse.json(
      { error: error.message || "Ошибка сервера" },
      { status: 500 },
    );
  }
}
