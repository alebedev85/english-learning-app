import { IWord } from "@/core/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { dictionaryMock } from "./mocks";
import { db } from "@/core/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { uploadWordImage } from "@/core/supabase";
import { RootState } from "@/store";
import { aiService } from "@/core/services/aiService";

interface DictionaryState {
  words: IWord[];
  profiles: string[];
  currentProfile: string;
  status: "idle" | "loading" | "failed";
}

interface WordTrainingResult {
  wordId: string;
  action: "upgrade" | "keep" | "downgrade";
}

export interface SaveWordPayload {
  english: string;
  russian: string;
  context: string;
  needImage?: boolean;
}

export interface SaveWordResponse extends IWord {
  isImageFailed: boolean; 
}

// Пейлоуд для генерации картинки к уже существующему слову
export interface GenerateImageForExistingWordPayload {
  wordId: string;
  english: string;
  russian: string;
}

/**
 * 🚀 1. САНК СОХРАНЕНИЯ СЛОВА (с забором данных из полей формы/пейлоуда)
 */
export const saveWordThunk = createAsyncThunk<
  SaveWordResponse,
  SaveWordPayload,
  { state: RootState }
>(
  'dictionary/saveWord',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const userId = state.auth.user?.uid;

      if (!userId) {
        throw new Error("Пользователь не авторизован");
      }

      let firestoreImageUrl = "";
      let isImageFailed = false;

      // 🛠️ Используем наш сервис для получения картинки
      if (payload.needImage) {
        try {
          const base64Data = await aiService.getImageForWord(payload.english, payload.russian);
          
          if (base64Data) {
            const sanitizedFileName = payload.english
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '_');
              
            firestoreImageUrl = await uploadWordImage(base64Data, sanitizedFileName);
          } else {
            isImageFailed = true;
          }
        } catch (imgError) {
          console.warn("⚠️ Картинка не сгенерировалась, но слово сохраняем:", imgError);
          isImageFailed = true;
        }
      }

      const newWordData = {
        userId,
        english: payload.english.trim(),
        russian: payload.russian.trim(),
        context: payload.context.trim(),
        imageUrl: firestoreImageUrl, 
        progress: 0,
        status: "learning" as const,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'words'), newWordData);

      return {
        id: docRef.id,
        ...newWordData,
        isImageFailed,
      };

    } catch (error: any) {
      return rejectWithValue(error.message || "Не удалось сохранить слово");
    }
  }
);

/**
 * 🚀 2. САНК ДЛЯ ГЕНЕРАЦИИ КАРТИНКИ К УЖЕ СУЩЕСТВУЮЩЕМУ СЛОВУ
 */
export const generateAndAttachImageThunk = createAsyncThunk<
  { wordId: string; imageUrl: string },
  GenerateImageForExistingWordPayload,
  { state: RootState }
>(
  'dictionary/generateAndAttachImage',
  async ({ wordId, english, russian }, { rejectWithValue }) => {
    try {
      // 🛠️ Вызываем метод сервиса вместо ручного fetch
      const base64Data = await aiService.getImageForWord(english, russian);

      if (!base64Data) {
        throw new Error("Бэкенд не смог сгенерировать картинку или вернул пустой ответ");
      }

      // Загружаем полученный base64 в Supabase Storage
      const sanitizedFileName = english
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_') + `_${Date.now()}`;

      const firestoreImageUrl = await uploadWordImage(base64Data, sanitizedFileName);

      if (!firestoreImageUrl) {
        throw new Error("Ошибка при загрузке картинки в Supabase");
      }

      // Обновляем поле imageUrl в Firestore
      const wordDocRef = doc(db, 'words', wordId);
      await updateDoc(wordDocRef, {
        imageUrl: firestoreImageUrl
      });

      return { wordId, imageUrl: firestoreImageUrl };

    } catch (error: any) {
      console.error("🔴 Ошибка при добавлении картинки к слову:", error);
      return rejectWithValue(error.message || "Не удалось сгенерировать картинку");
    }
  }
);

const initialState: DictionaryState = {
  words: dictionaryMock,
  profiles: ["Основной профиль"],
  currentProfile: "Основной профиль",
  status: "idle",
};

const dictionarySlice = createSlice({
  name: "dictionary",
  initialState,
  reducers: {
    deleteWord: (state, action: PayloadAction<string | undefined>) => {
      if (!action.payload) return;
      state.words = state.words.filter((word) => word.id !== action.payload);
    },
    toggleWordStatus: (state, action: PayloadAction<string | undefined>) => {
      if (!action.payload) return;
      const word = state.words.find((w) => w.id === action.payload);
      if (word) {
        if (word.status === "learned") {
          word.status = "learning";
          word.progress = 0;
        } else {
          word.status = "learned";
          word.progress = 100;
        }
      }
    },
    addProfile: (state, action: PayloadAction<string>) => {
      const newProfile = action.payload.trim();
      if (newProfile && !state.profiles.includes(newProfile)) {
        state.profiles.push(newProfile);
        state.currentProfile = newProfile;
        state.words = [];
      }
    },
    changeProfile: (state, action: PayloadAction<string>) => {
      state.currentProfile = action.payload;
    },
    finishTrainingWords: (state, action: PayloadAction<WordTrainingResult[]>) => {
      const results = action.payload;
      const resultsMap = new Map(results.map((res) => [res.wordId, res.action]));

      state.words.forEach((word) => {
        if (resultsMap.has(word.id)) {
          const trainingAction = resultsMap.get(word.id);
          const currentProgress = word.progress || 0;
          let newProgress = currentProgress;

          if (trainingAction === "upgrade") {
            newProgress = currentProgress + 25;
          } else if (trainingAction === "downgrade") {
            newProgress = currentProgress - 25;
          }

          word.progress = Math.max(0, Math.min(100, newProgress));
          word.status = word.progress >= 100 ? "learned" : "learning";
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Кейсы для сохранения нового слова
      .addCase(saveWordThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveWordThunk.fulfilled, (state, action: PayloadAction<SaveWordResponse>) => {
        state.status = "idle";
        const { isImageFailed, ...pureWord } = action.payload;
        state.words.unshift(pureWord);
      })
      .addCase(saveWordThunk.rejected, (state) => {
        state.status = "failed";
      })
      
      // 🔥 Кейсы для добавления картинки к существующему слову
      .addCase(generateAndAttachImageThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(generateAndAttachImageThunk.fulfilled, (state, action) => {
        state.status = "idle";
        const { wordId, imageUrl } = action.payload;
        
        // Находим слово локально в стейте и обновляем ему ссылку на картинку
        const word = state.words.find(w => w.id === wordId);
        if (word) {
          word.imageUrl = imageUrl;
        }
      })
      .addCase(generateAndAttachImageThunk.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const {
  deleteWord,
  toggleWordStatus,
  addProfile,
  changeProfile,
  finishTrainingWords,
} = dictionarySlice.actions;

export default dictionarySlice.reducer;