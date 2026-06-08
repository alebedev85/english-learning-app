// @/core/store/dictionarySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IWord, WordStatus } from "@/core/types";

interface DictionaryState {
  words: IWord[];
  profiles: string[];
  currentProfile: string;
  status: "idle" | "loading" | "failed";
}

// 6 слов-заглушек, полностью соответствующих интерфейсу IWord
const initialMockWords: IWord[] = [
  {
    id: "1",
    english: "Dream",
    russian: "Мечта / Сон",
    context: "Follow your dream.",
    progress: 0,
    status: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    english: "Breeze",
    russian: "Легкий ветерок",
    context: "A warm sea breeze.",
    progress: 25,
    status: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    english: "Clarity",
    russian: "Ясность / Четкость",
    context: "He spoke with great clarity.",
    progress: 50,
    status: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    english: "Glow",
    russian: "Свечение",
    context: "The warm glow of the sunset.",
    progress: 75,
    status: "learning",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    english: "Gravity",
    russian: "Гравитация",
    context: "Newton discovered gravity.",
    progress: 100,
    status: "learned",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    english: "Echo",
    russian: "Эхо",
    context: "An echo bounced off the walls.",
    progress: 0,
    status: "learning",
    createdAt: new Date().toISOString(),
  },
];

const initialState: DictionaryState = {
  words: initialMockWords,
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
    setProfilesData: (
      state,
      action: PayloadAction<{ list: string[]; current: string }>,
    ) => {
      state.profiles = action.payload.list;
      state.currentProfile = action.payload.current;
    },
    changeProfile: (state, action: PayloadAction<string>) => {
      state.currentProfile = action.payload;
    },
  },
});

export const { addWord, deleteWord, toggleWordStatus, setProfilesData, changeProfile } =
  dictionarySlice.actions;
export default dictionarySlice.reducer;
