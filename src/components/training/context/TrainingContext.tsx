"use client";

import React, { createContext, useContext, useState } from "react";
import { IWord, ITrainingSession, ITrainingFeedback } from "@/core/types"; 

/**
 * Описание интерфейса контекста тренировки.
 * Определяет, какие данные и методы будут доступны всем дочерним компонентам на любой глубине.
 */
interface TrainingContextType {
  trainingSession: ITrainingSession | null; // Текущая сессия (данные этапа, список слов, прогресс каждого слова)
  currentWordIndex: number;                 // Индекс (ID позиции) текущего тестируемого слова в массиве сессии
  trainingFeedback: ITrainingFeedback | null; // Состояние оверлея обратной связи (успех/ошибка, правильный ответ)
  currentWord: IWord | null;                // Вычисляемый геттер для быстрого доступа к текущему слову
  startTraining: (words: IWord[]) => void;  // Метод инициализации и старта тренировочной сессии
  stopTraining: () => void; // Метод для принудительной остановки сессии (например, при выходе из вкладки)
  handleAnswer: (isCorrect: boolean, correctAnswer?: string) => void; // Метод обработки ответа пользователя
}

// Создаем изолированный контекст. Дефолтное значение undefined защищает от использования контекста вне провайдера.
const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

/**
 * Провайдер состояния тренировки (Управляющий компонент архитектуры).
 * Инкапсулирует в себе всю бизнес-логику шагов, таймеров и валидации ответов.
 */
export function TrainingProvider({ children }: { children: React.ReactNode }) {
  // Основные реактивные состояния сессии
  const [trainingSession, setTrainingSession] = useState<ITrainingSession | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [trainingFeedback, setTrainingFeedback] = useState<ITrainingFeedback | null>(null);

  /**
   * Запуск новой сессии тренировки.
   * Принимает отфильтрованный пакет слов (например, 6 штук из Redux / Firestore).
   */
  const startTraining = (wordsToTrain: IWord[]) => {
    const initialWordStates: ITrainingSession["wordStates"] = {};
    
    // Формируем чистую карту прохождения этапов для каждого слова сессии
    wordsToTrain.forEach((w) => {
      initialWordStates[w.id] = {
        stage1Passed: false,
        stage2Passed: false,
        stage3Passed: false,
        stage4Passed: false,
      };
    });

    // Записываем сессию в стейт: сбрасываем на 1 этап и передаем подготовленные данные
    setTrainingSession({
      stage: 1,
      words: wordsToTrain,
      wordStates: initialWordStates,
    });
    
    // Сбрасываем указатель текущего слова на начало массива
    setCurrentWordIndex(0);
  };

  // Метод для принудительной остановки тренировки (например, при выходе пользователя из вкладки или по кнопке "Прервать")
  const stopTraining = () => {
  if (window.confirm("Вы уверены, что хотите прервать тренировку? Прогресс текущей сессии будет утерян.")) {
    setTrainingSession(null);
  }
};

  /**
   * Универсальный обработчик ответа пользователя (для всех типов тренировок Stage*).
   * @param isCorrect - зафиксирован ли правильный ответ/успешное запоминание
   * @param correctAnswer - опциональная строка с правильным ответом (нужна для вывода работы над ошибками)
   */
  const handleAnswer = (isCorrect: boolean, correctAnswer?: string) => {
    if (!trainingSession) return;

    // Определяем текущее слово и динамический ключ текущего этапа (например, 'stage1Passed')
    const currentWord = trainingSession.words[currentWordIndex];
    const stageKey = `stage${trainingSession.stage}Passed` as keyof typeof trainingSession.wordStates[string];

    // Иммутабельно обновляем состояние прохождения текущего этапа для конкретного слова
    const updatedWordStates = {
      ...trainingSession.wordStates,
      [currentWord.id]: {
        ...trainingSession.wordStates[currentWord.id],
        [stageKey]: isCorrect,
      },
    };

    // Сохраняем обновленную карту прогресса слов в стейт сессии
    setTrainingSession({
      ...trainingSession,
      wordStates: updatedWordStates,
    });

    // Включаем полноэкранный оверлей фидбека (компонент Layout поймает это состояние и покажет плашку)
    setTrainingFeedback(
      isCorrect
        ? { type: "success", msg: "Отлично запомнили!" }
        : { type: "error", msg: "Ничего, повторим еще раз!", correct: correctAnswer }
    );

    // Запускаем искусственную задержку в 1.2 сек, чтобы пользователь успел считать фидбек
    setTimeout(() => {
      // Гасим оверлей обратной связи
      setTrainingFeedback(null);

      // 1. Берем актуальное состояние wordStates (учитывая только что зафиксированный ответ)
      const currentWords = trainingSession.words;
      const stageKey = `stage${trainingSession.stage}Passed` as keyof typeof updatedWordStates[string];

      // 2. Ищем индекс следующего не пройденного слова, начиная со следующей позиции
      let nextIndex = -1;
      const totalWords = currentWords.length;

      for (let i = 1; i <= totalWords; i++) {
        // Вычисляем индекс с цикличным сдвигом (если вышли за пределы длины — начнем с 0)
        const checkIndex = (currentWordIndex + i) % totalWords;
        const wordId = currentWords[checkIndex].id;
        
        // Если у этого слова текущий этап еще не отмечен как true — мы нашли следующую цель
        if (!updatedWordStates[wordId][stageKey]) {
          nextIndex = checkIndex;
          break;
        }
      }

      // 3. Анализируем результат поиска
      if (nextIndex !== -1) {
        // Если нашли слово, которое пользователь еще не зафиксировал на этом этапе — переключаемся на него
        setCurrentWordIndex(nextIndex);
      } else {
        // Если не пройденных слов больше нет на ТЕКУЩЕМ этапе
        if (trainingSession.stage < 4) {
          // ПЕРЕХОД НА СЛЕДУЮЩИЙ ЭТАП
          const nextStage = (trainingSession.stage + 1) as 1 | 2 | 3 | 4;
          
          setTrainingSession({
            ...trainingSession,
            stage: nextStage,
            wordStates: updatedWordStates, // Сохраняем накопленную историю прохождения
          });
          
          // На новом этапе начинаем с самого первого слова в массиве
          setCurrentWordIndex(0);
        } else {
          // ВСЯ ТРЕНИРОВКА ИЗ 4 ЭТАПОВ ПОЛНОСТЬЮ ЗАВЕРШЕНА
          alert("Поздравляем! Вы успешно прошли все 4 этапа тренировки для этого набора слов! 🎉");
          
          // TODO: Здесь в будущем будет вызов диспатча в Redux/Firebase для обновления прогресса слов (0-100%)
          
          setTrainingSession(null); // Закрываем сессию, возвращаемся на экран Welcome
        }
      }
    }, 1200);
  };

  // Вычисляемое свойство (производный стейт). Избавляет дочерние компоненты от ручного поиска текущего слова по индексу.
  const currentWord = trainingSession ? trainingSession.words[currentWordIndex] : null;

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

/**
 * Кастомный хук для безопасного доступа к контексту тренировки.
 * Избавляет от необходимости писать useContext(TrainingContext) в каждом компоненте.
 */
export function useTraining() {
  const context = useContext(TrainingContext);
  // Если хук вызван вне дерева <TrainingProvider>, TypeScript сразу выбросит понятную ошибку в рантайме
  if (!context) {
    throw new Error("useTraining должен использоваться внутри TrainingProvider");
  }
  return context;
}