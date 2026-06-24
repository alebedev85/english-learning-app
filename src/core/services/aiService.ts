import axios from "axios";

interface ApiWordResponse {
  translation: string;
  example: string;
  imageBase64?: string | null;
}

export const aiService = {
  /**
   * Запрашивает автоматический перевод слова и контекст у нашего Next API
   */
  async getTranslationAndContext(word: string): Promise<{ translation: string; example: string }> {
    try {
      const response = await axios.post<ApiWordResponse>("/api/generate-word", {
        word: word.trim(),
        needImage: false,
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
      // Извлекаем реальный текст ошибки, который вернул NextResponse.json из роута
      const serverErrorMessage = error.response?.data?.error;
      
      if (serverErrorMessage) {
        console.error(`🔴 Бэкенд вернул ошибку: ${serverErrorMessage}`);
        // Перезаписываем сообщение, чтобы WordForm получил понятный текст
        error.message = serverErrorMessage;
      } else {
        console.error("🔴 Ошибка внутри aiService.getTranslationAndContext:", error);
      }

      throw error;
    }
  },
};