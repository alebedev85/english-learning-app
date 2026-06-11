import { IWord } from "@/core/types";
import { useAppDispatch } from "@/store";
import { deleteWord, toggleWordStatus } from "@/store/slices/dictionarySlice";
import { showNotificationWithTimeout } from "@/store/slices/uiSlice";
import Image from "next/image";
import { useState } from "react";
import styles from "./WordCard.module.scss";
import AudioPlayButton from "@/components/ui/AudioPlayButton/AudioPlayButton";

interface WordCardProps {
  word: IWord;
}

export default function WordCard({ word }: WordCardProps) {
  const dispatch = useAppDispatch();
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const playWordAudio = (englishText: string, id?: string) => {
    if (!id) return;
    setPlayingAudioId(id);

    // Имитация интеграции синтеза речи (TTS)
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1000);
  };

  // Обработчик изменения статуса (Изучено / Сбросить)
  const handleToggleStatus = () => {
    dispatch(toggleWordStatus(word.id));
    
    const isNowLearned = word.status !== "learned";
    dispatch(
      showNotificationWithTimeout({
        text: isNowLearned 
          ? `Отлично! Слово "${word.english}" перенесено в изученные.` 
          : `Статус слова "${word.english}" сброшен.`,
        type: isNowLearned ? "success" : "info",
      })
    );
  };

  // Обработчик удаления карточки слова
  const handleDeleteWord = () => {
    dispatch(deleteWord(word.id));
    dispatch(
      showNotificationWithTimeout({
        text: `Слово "${word.english}" удалено из словаря`,
        type: "error", // Использует твой rose-600 бордер
      })
    );
  };

  return (
    <div className={styles.wordCard}>
      {/* Прогресс-бар сверху */}
      <div
        className={styles.progressBar}
        style={{ width: `${word.progress || 0}%` }}
      />

      <div className={styles.cardTop}>
        <div className={styles.wordInfo}>
          <div className={styles.wordHeader}>
            <h3 className={styles.englishText}>{word.english}</h3>
            <AudioPlayButton text={word.english} />
          </div>
          <p className={styles.russianText}>{word.russian}</p>
        </div>

        {word.imageUrl && (
          <div className={styles.imageWrapper}>
            <Image
              src={word.imageUrl}
              alt={word.english}
              className={styles.cardImg}
              width={48}
              height={48}
              unoptimized // Добавь, если это внешние URL без настройки next.config
            />
          </div>
        )}
      </div>

      {word.context && (
        <p className={styles.contextBlock}>&quot;{word.context}&quot;</p>
      )}

      {/* Футер карточки с экшенами управления */}
      <div className={styles.cardFooter}>
        <div className={styles.statusIndicator}>
          <span
            className={`${styles.dot} ${
              word.status === "learned"
                ? styles.mastered
                : word.status === "learning"
                  ? styles.learning
                  : styles.new
            }`}
          />
          <span className={styles.statusText}>
            {word.status === "learned" && "Изучено"}
            {word.status === "learning" && `Освоено ${word.progress || 0}%`}
            {word.status === "new" && "Новое слово"}
          </span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`${styles.toggleButton} ${word.status === "learned" ? styles.reset : styles.complete}`}
          >
            {word.status === "learned" ? "Сбросить" : "Уже изучено"}
          </button>
          <button
            type="button"
            onClick={handleDeleteWord}
            className={styles.deleteButton}
            title="Удалить слово"
          >
            <svg
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
