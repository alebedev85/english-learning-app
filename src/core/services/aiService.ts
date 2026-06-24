import axios from "axios";

interface ApiWordResponse {
  translation: string;
  example: string;
}

interface ApiImageResponse {
  imageBase64: string | null;
}

export const aiService = {
  /**
   * Запрашивает автоматический перевод слова и контекст у нашего Next API (/api/translate)
   */
  async getTranslationAndContext(word: string): Promise<{ translation: string; example: string }> {
    try {
      const response = await axios.post<ApiWordResponse>("/api/translate", {
        word: word.trim(),
      });

      console.log("🍏 Ответ от бэкенда перевода:", response.data);

      if (!response.data || !response.data.translation) {
        throw new Error("Бэкенд вернул пустой перевод");
      }

      return {
        translation: response.data.translation,
        example: response.data.example || "",
      };
    } catch (error: any) {
      const serverErrorMessage = error.response?.data?.error;
      
      if (serverErrorMessage) {
        console.error(`🔴 Бэкенд перевода вернул ошибку: ${serverErrorMessage}`);
        error.message = serverErrorMessage;
      } else {
        console.error("🔴 Ошибка внутри aiService.getTranslationAndContext:", error);
      }

      throw error;
    }
  },

  /**
   * Запрашивает фоновую генерацию изображения у нашего Next API (/api/generate-image)
   * Возвращает готовую Base64 строку или null в случае неудачи
   */
  async getImageForWord(word: string, translation: string): Promise<string | null> {
    try {
      const response = await axios.post<ApiImageResponse>("/api/generate-image", {
        word: word.trim(),
        translation: translation.trim(),
      });

      console.log("🎨 Ответ от бэкенда генерации картинок:", response.data);

      return response.data?.imageBase64 || null;
    } catch (error: any) {
      const serverErrorMessage = error.response?.data?.error;
      
      if (serverErrorMessage) {
        console.error(`⚠️ Бэкенд генерации картинок вернул ошибку: ${serverErrorMessage}`);
      } else {
        console.error("⚠️ Ошибка внутри aiService.getImageForWord:", error);
      }
      
      // Не роняем приложение, если упала только картинка
      return null;
    }
  },
};