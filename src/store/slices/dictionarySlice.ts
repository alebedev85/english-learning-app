// @/core/store/dictionarySlice.ts
import { IWord } from "@/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { dictionaryMock } from "./mock";

interface DictionaryState {
  words: IWord[];
  profiles: string[];
  currentProfile: string;
  status: "idle" | "loading" | "failed";
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
  },
});

export const {
  addWord,
  deleteWord,
  toggleWordStatus,
  addProfile,
  changeProfile,
} = dictionarySlice.actions;
export default dictionarySlice.reducer;
