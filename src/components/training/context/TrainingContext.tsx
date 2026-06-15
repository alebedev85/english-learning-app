"use client";

import { ITrainingFeedback, ITrainingSession, IWord } from "@/core/types";
import { finishTrainingWords } from "@/store/slices/dictionarySlice";
import { showNotificationWithTimeout } from "@/store/slices/uiSlice";
import React, { createContext, useContext, useState } from "react";
import { useDispatch } from "react-redux";

/**
 * Расширяем локальный интерфейс сессии, чтобы хранить агрегированные ошибки.
 * Это внутреннее состояние провайдера, не завязанное на внешние типы.
 */
interface ExtendedTrainingSession extends Omit<ITrainingSession, "wordStates"> {
  wordStates: {
    [wordId: string]: {
      stage1Passed: boolean;
      stage2Passed: boolean;
      stage3Passed: boolean;
      stage4Passed: boolean;
    };
  };
  // Счетчик ошибок за ВСЮ сессию тренировки (ключ — id слова, значение — количество ошибок)
  errorCounts: { [wordId: string]: number };
}

interface TrainingContextType {
  trainingSession: ExtendedTrainingSession | null;
  currentWordIndex: number;
  trainingFeedback: ITrainingFeedback | null;
  currentWord: IWord | null;
  startTraining: (words: IWord[]) => void;
  stopTraining: () => void;
  handleAnswer: (isCorrect: boolean, correctAnswer?: string) => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(
  undefined,
);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch(); // Инициализируем хук диспатча Redux

  const [trainingSession, setTrainingSession] =
    useState<ExtendedTrainingSession | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [trainingFeedback, setTrainingFeedback] =
    useState<ITrainingFeedback | null>(null);

  /**
   * Инициализация и запуск тренировочной сессии
   */
  const startTraining = (wordsToTrain: IWord[]) => {
    const initialWordStates: ExtendedTrainingSession["wordStates"] = {};
    const initialErrorCounts: ExtendedTrainingSession["errorCounts"] = {};

    wordsToTrain.forEach((w) => {
      initialWordStates[w.id] = {
        stage1Passed: false,
        stage2Passed: false,
        stage3Passed: false,
        stage4Passed: false,
      };
      initialErrorCounts[w.id] = 0; // Изначально у каждого слова 0 ошибок
    });

    setTrainingSession({
      stage: 1,
      words: wordsToTrain,
      wordStates: initialWordStates,
      errorCounts: initialErrorCounts,
    });

    setCurrentWordIndex(0);
  };

  const stopTraining = () => {
    setTrainingSession(null);
  };

  /**
   * Универсальный обработчик ответа пользователя с игровой логикой удержания на этапе при ошибках
   */
  const handleAnswer = (isCorrect: boolean, correctAnswer?: string) => {
    if (!trainingSession) return;

    const currentWord = trainingSession.words[currentWordIndex];
    const stageKey =
      `stage${trainingSession.stage}Passed` as keyof (typeof trainingSession.wordStates)[string];

    // 1. Фиксируем, пройдено ли слово на текущем этапе (только если ответ верный)
    const updatedWordStates = {
      ...trainingSession.wordStates,
      [currentWord.id]: {
        ...trainingSession.wordStates[currentWord.id],
        [stageKey]: isCorrect, // Будет true только при правильном ответе
      },
    };

    // 2. Если ответ неверный, инкрементируем счетчик ошибок для этого слова
    const updatedErrorCounts = {
      ...trainingSession.errorCounts,
      [currentWord.id]: isCorrect
        ? trainingSession.errorCounts[currentWord.id]
        : trainingSession.errorCounts[currentWord.id] + 1,
    };

    // Сохраняем промежуточные изменения в стейт
    setTrainingSession({
      ...trainingSession,
      wordStates: updatedWordStates,
      errorCounts: updatedErrorCounts,
    });

    // Показываем оверлей успеха/ошибки
    setTrainingFeedback(
      isCorrect
        ? { type: "success", msg: "Отлично запомнили!" }
        : {
            type: "error",
            msg: "Неверно, слово вернется на повтор!",
            correct: correctAnswer,
          },
    );

    // Тайм-аут для демонстрации плашки обратной связи (1.2 сек)
    setTimeout(() => {
      setTrainingFeedback(null);

      const currentWords = trainingSession.words;
      const totalWords = currentWords.length;
      let nextIndex = -1;

      /**
       * Ищем следующее не пройденное слово на ТЕКУЩЕМ этапе.
       * Если пользователь ошибся, то `updatedWordStates[wordId][stageKey]` осталось `false`.
       * Значит, это же слово (или другие ошибочные) снова попадутся в цикле, пока их не ответят верно!
       */
      for (let i = 1; i <= totalWords; i++) {
        const checkIndex = (currentWordIndex + i) % totalWords;
        const wordId = currentWords[checkIndex].id;

        // Слово пойдет на повтор, если текущий этап для него равен false
        if (!updatedWordStates[wordId][stageKey]) {
          nextIndex = checkIndex;
          break;
        }
      }

      if (nextIndex !== -1) {
        // Нашли слово для повторения/продолжения на текущем этапе
        setCurrentWordIndex(nextIndex);
      } else {
        // На текущем этапе ВСЕ слова успешно закрыты (все получили true)
        if (trainingSession.stage < 4) {
          // Переходим на следующий этап, сбрасывая индекс на начало массива
          const nextStage = (trainingSession.stage + 1) as 1 | 2 | 3 | 4;

          setTrainingSession({
            ...trainingSession,
            stage: nextStage,
            wordStates: updatedWordStates,
            errorCounts: updatedErrorCounts,
          });

          setCurrentWordIndex(0);
        } else {
          /**
           * ФИНАЛ ВСЕЙ ТРЕНИРОВКИ (Успешно закрыт 4 этап для всех слов)
           * Рассчитываем итоги по на основе накопленных ошибок в `updatedErrorCounts`.
           */
          const finalPayload = currentWords.map((word) => {
            const errors = updatedErrorCounts[word.id] || 0;
            let action: "upgrade" | "keep" | "downgrade" = "keep";

            if (errors === 0) {
              action = "upgrade"; // 0 ошибок -> статус повышается
            } else if (errors > 1) {
              action = "downgrade"; // Больше 1 ошибки -> статус понижается
            }
            // Если ровно 1 ошибка -> останется "keep" (без изменений)

            return {
              wordId: word.id,
              action,
            };
          });

          // Отправляем массив результатов в Redux Store для обновления прогресса слов
          dispatch(finishTrainingWords(finalPayload));

          dispatch(
            showNotificationWithTimeout({
              text: "Тренировка завершена! Прогресс обновлен.",
              type: "success",
            }) as any,
          ); // Приводим к any из-за несовпадения типов санки, можно улучшить типизацию при необходимости

          // Закрываем сессию и возвращаем пользователя на базовый экран
          setTrainingSession(null);
        }
      }
    }, 1200);
  };

  const currentWord = trainingSession
    ? trainingSession.words[currentWordIndex]
    : null;

  return (
    <TrainingContext.Provider
      value={{
        trainingSession,
        currentWordIndex,
        trainingFeedback,
        currentWord,
        startTraining,
        stopTraining,
        handleAnswer,
      }}
    >
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error(
      "useTraining должен использоваться внутри TrainingProvider",
    );
  }
  return context;
}
