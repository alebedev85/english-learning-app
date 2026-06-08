import { Timestamp } from 'firebase/firestore';

// Статус изучения слова согласно ТЗ
export type WordStatus = 'new' | 'learning' | 'learned';

// Интерфейс слова в Firestore
export interface IWord {
  id?: string;
  english: string;
  russian: string;
  context: string;
  imageUrl?: string;
  progress: number; // 0-100
  status: WordStatus;
  createdAt: string | Timestamp;
}

// Состояние прохождения этапов конкретным словом внутри сессии
export interface IWordStageState {
  stage1Passed: boolean;
  stage2Passed: boolean;
  stage3Passed: boolean;
  stage4Passed: boolean;
}

// Сессия тренировки (6 слов из ТЗ)
export interface ITrainingSession {
  words: IWord[];
  stage: 1 | 2 | 3 | 4;
  wordStates: {
    [wordId: string]: IWordStageState;
  };
}

// Оверлей обратной связи (Feedback Overlay из ТЗ)
export interface ITrainingFeedback {
  type: 'success' | 'error';
  msg: string;
  correct?: string;
}

// Пользователь в системе
export interface IUser {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
}