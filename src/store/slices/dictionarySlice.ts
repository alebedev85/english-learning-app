import { IWord } from "@/core/types";
import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { dictionaryMock } from "./mocks";
import { db } from "@/core/firebase";
import { collection, addDoc } from "firebase/firestore";
import { uploadWordImage } from "@/core/supabase";
import { RootState } from "@/store";

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

// Расширяем интерфейсы для поддержки мягкой логики картинок
export interface SaveWordPayload {
  english: string;
  russian: string;
  context: string;
  needImage?: boolean;
}

export interface SaveWordResponse extends IWord {
  isImageFailed: boolean; // Флаг для формы, чтобы сообщить, если Flux упал
}

// 🚀 ДОБАВЛЯЕМ ASYNC THUNK
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

      // 1. Стучимся в наш роут Next.js за картинкой (если запрошена)
      if (payload.needImage) {
        try {
          const response = await fetch("/api/generate-word", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              word: payload.english, 
              needImage: true 
            }),
          });

          if (response.ok) {
            const data = await response.json();
            
            // Если Flux успешно отдал base64, грузим в Supabase
            if (data.imageBase64) {
              const sanitizedFileName = payload.english
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '_');
                
              firestoreImageUrl = await uploadWordImage(data.imageBase64, sanitizedFileName);
            } else {
              isImageFailed = true;
            }
          } else {
            isImageFailed = true;
          }
        } catch (imgError) {
          console.warn("⚠️ Картинка не сгенерировалась, но слово сохраняем:", imgError);
          isImageFailed = true;
        }
      }

      // 2. Формируем объект слова для Firebase (перевод берется из полей формы!)
      const newWordData = {
        userId,
        english: payload.english.trim(),
        russian: payload.russian.trim(),
        context: payload.context.trim(),
        imageUrl: firestoreImageUrl, // Будет пустой строкой, если Flux упал
        progress: 0,
        status: "learning" as const,
        createdAt: new Date().toISOString(),
      };

      // 3. Запись в Firestore
      const docRef = await addDoc(collection(db, 'words'), newWordData);

      // Возвращаем объект в Fulfilled + прокидываем статус картинки
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
      .addCase(saveWordThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveWordThunk.fulfilled, (state, action: PayloadAction<SaveWordResponse>) => {
        state.status = "idle";
        
        // Извлекаем чистый IWord для сохранения в стейте (убираем служебный флаг фронтенда)
        const { isImageFailed, ...pureWord } = action.payload;
        state.words.unshift(pureWord);
      })
      .addCase(saveWordThunk.rejected, (state) => {
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