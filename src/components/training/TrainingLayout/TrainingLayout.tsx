"use client";

import React, { useState } from "react";
import { useTraining } from "../context/TrainingContext";
import styles from "./TrainingLayout.module.scss";

export default function TrainingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { trainingSession, currentWordIndex, trainingFeedback, stopTraining } =
    useTraining();

  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  if (!trainingSession) return null;

  const handleConfirmAbort = () => {
    setShowAbortConfirm(false);
    stopTraining(); // Вызываем очистку сессии из контекста (уже без window.confirm внутри)
  };

  return (
    <div className={styles.container}>
      {/* Шапка: Текущий Этап */}
      <div className={styles.stageStatusCard}>
        <div className={styles.stageInfo}>
          <div className={styles.stageBadge}>
            Этап {trainingSession.stage} из 4
          </div>
          <span className={styles.stageText}>
            {trainingSession.stage === 1 && "🧠 Карточки: Запоминание"}
            {trainingSession.stage === 2 && "⚡️ Тест: Выбор правильного слова"}
            {trainingSession.stage === 3 && "🧩 Конструктор: Сборка из букв"}
            {trainingSession.stage === 4 && "🎧 Аудирование: Написание на слух"}
          </span>
        </div>

        <div className={styles.stageDots}>
          {[1, 2, 3, 4].map((stg) => (
            <div
              key={stg}
              className={`${styles.stageDot} ${
                trainingSession.stage === stg
                  ? styles.active
                  : trainingSession.stage > stg
                    ? styles.passed
                    : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* Полоски прогресса слов */}
      <div className={styles.progressCard}>
        <span className={styles.progressLabel}>Прогресс текущего этапа:</span>
        <div className={styles.wordBars}>
          {trainingSession.words.map((w, idx) => {
            const passed =
              trainingSession.wordStates[w.id][
                `stage${trainingSession.stage}Passed`
              ];
            const isCurrent = idx === currentWordIndex;
            return (
              <div
                key={w.id}
                className={`${styles.wordBar} ${passed ? styles.passed : isCurrent ? styles.current : ""}`}
                title={w.english}
              />
            );
          })}
        </div>
        <span className={styles.progressCounter}>
          {currentWordIndex + 1}/{trainingSession.words.length}
        </span>
      </div>

      {/* Основной бокс карточки */}
      <div className={styles.mainContentCard}>
        {trainingFeedback && (
          <div
            className={`${styles.feedbackOverlay} ${
              trainingFeedback.type === "success"
                ? styles.success
                : styles.error
            }`}
          >
            <div className={styles.feedbackEmoji}>
              {trainingFeedback.type === "success" ? "🎉" : "❌"}
            </div>
            <h3 className={styles.feedbackMsg}>{trainingFeedback.msg}</h3>

            {trainingFeedback.correct && (
              <div className={styles.correctBlock}>
                <p className={styles.correctLabel}>Правильный ответ:</p>
                <p className={styles.correctWord}>{trainingFeedback.correct}</p>
              </div>
            )}

            {trainingFeedback.type === "error" && !trainingFeedback.correct && (
              <p className={styles.feedbackHint}>
                Слово вернется в начало круга на текущем этапе.
              </p>
            )}
          </div>
        )}

        {/* НАШ НОВЫЙ ОВЕРЛЕЙ: Подтверждение прерывания тренировки */}
        {showAbortConfirm && (
          <div className={`${styles.feedbackOverlay} ${styles.abortOverlay}`}>
            <div className={styles.feedbackEmoji}>🛸</div>
            <h3 className={styles.feedbackMsg}>Прервать тренировку?</h3>
            <p className={styles.feedbackHint}>
              Прогресс текущей сессии будет полностью утерян, и корабль вернется на орбиту.
            </p>
            
            {/* Группа кнопок выбора */}
            <div className={styles.abortActions}>
              <button 
                onClick={handleConfirmAbort} 
                className={`${styles.confirmBtn} ${styles.danger}`}
              >
                Да, прервать
              </button>
              <button 
                onClick={() => setShowAbortConfirm(false)} 
                className={`${styles.confirmBtn} ${styles.secondary}`}
              >
                Остаться
              </button>
            </div>
          </div>
        )}

        {children}
      </div>

      {/* Кнопка прерывания тренировки под основной карточкой */}
      <div className={styles.abortZone}>
        <button onClick={() => setShowAbortConfirm(true)} className={styles.abortBtn}>
          Прервать тренировку
        </button>
      </div>
    </div>
  );
}
