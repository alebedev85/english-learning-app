"use client";

import React, { useMemo } from "react";
import { useTraining } from "../context/TrainingContext";
import styles from "./StageSelect.module.scss";

// Выносим функцию перемешивания ЗА ПРЕДЕЛЫ компонента.
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function StageSelect() {
  const { trainingSession, currentWord, handleAnswer } = useTraining();

  // Собираем варианты ответов
  const options = useMemo(() => {
    if (!currentWord || !trainingSession) return [];

    const correct = currentWord.english;

    // Сначала просто фильтруем и мапим (это чистые операции)
    const distractors = trainingSession.words
      .filter((w) => w.id !== currentWord.id)
      .map((w) => w.english);

    const combined = [correct, ...distractors];

    // Перемешиваем через внешнюю функцию
    return shuffleArray(combined);
  }, [currentWord, trainingSession]);

  if (!currentWord) return null;

  return (
    <div className={styles.innerWrapper}>
      <div className={styles.header}>
        <span className={styles.label}>Выберите правильный перевод для:</span>
        <h3 className={styles.russianWord}>{currentWord.russian}</h3>
        {currentWord.context && (
          <p className={styles.contextText}>Контекст: &quot;{currentWord.context}&quot;</p>
        )}
      </div>

      <div className={styles.optionsGrid}>
        {options.map((option, idx) => (
          <button
            key={idx}
            className={styles.optionBtn}
            onClick={() => handleAnswer(option === currentWord.english, currentWord.english)}
          >
            <span className={styles.optionText}>{option}</span>
            <span className={styles.optionBadge}>Option {idx + 1}</span>
          </button>
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.audioHintBtn} title="Прослушать слово">
          🔊 Подсказка (прослушать)
        </button>
      </div>
    </div>
  );
}