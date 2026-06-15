import { IWord } from "@/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dictionaryMock } from "./mocks";

interface DictionaryState {
  words: IWord[];
  profiles: string[];
  currentProfile: string;
  status: "idle" | "loading" | "failed";
}

// Описываем новый тип для передачи результатов из контекста в Redux
interface WordTrainingResult {
  wordId: string;
  action: "upgrade" | "keep" | "downgrade";
}

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
    addWord: (
      state,
      action: PayloadAction<
        Omit<IWord, "id" | "progress" | "status" | "createdAt">
      >,
    ) => {
      const newWordItem: IWord = {
        ...action.payload,
        id: crypto.randomUUID(),
        progress: 0,
        status: "learning",
        createdAt: new Date().toISOString(),
      };
      state.words.push(newWordItem);
    },
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
        state.words = []; // Для абсолютно нового профиля список слов изначально пуст
      }
    },
    changeProfile: (state, action: PayloadAction<string>) => {
      state.currentProfile = action.payload;
    },
    finishTrainingWords: (
      state,
      action: PayloadAction<WordTrainingResult[]>,
    ) => {
      const results = action.payload;
      const resultsMap = new Map(
        results.map((res) => [res.wordId, res.action]),
      );

      state.words.forEach((word) => {
        if (resultsMap.has(word.id)) {
          const trainingAction = resultsMap.get(word.id);
          const currentProgress = word.progress || 0;
          let newProgress = currentProgress;

          if (trainingAction === "upgrade") {
            newProgress = currentProgress + 25; // Повышаем статус
          } else if (trainingAction === "downgrade") {
            newProgress = currentProgress - 25; // Понижаем статус (можешь поставить -10% или -25% по вкусу)
          }
          // Если "keep" — newProgress остается равным currentProgress, ничего не делаем!

          // Защита границ от 0% до 100%
          word.progress = Math.max(0, Math.min(100, newProgress));
          word.status = word.progress >= 100 ? "learned" : "learning";
        }
      });
    },
  },
});

export const {
  addWord,
  deleteWord,
  toggleWordStatus,
  addProfile,
  changeProfile,
  finishTrainingWords,
} = dictionarySlice.actions;
export default dictionarySlice.reducer;
