import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveTab } from "@/store/slices/uiSlice";
import { useState } from "react";
import WordCard from "../WordCard/WordCard";
import styles from "./DictionaryList.module.scss";

export default function DictionaryList() {
  const dispatch = useAppDispatch();

  // Достаем данные словаря из Redux
  const { words, currentProfile } = useAppSelector((state) => state.dictionary);

  // Локальный стейт для имитации озвучки текста
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Вычисляем аналитику на лету
  const totalCount = words.length;
  const learnedCount = words.filter((w) => w.status === "learned").length;
  const learningCount = totalCount - learnedCount;

  // Имитация озвучки слова (интеграция с ИИ Gemini в будущем)
  const playWordAudio = (text: string, id: string | undefined) => {
    if (!id) return;
    setPlayingAudioId(id);

    // В будущем тут будет реальный вызов Edge TTS или Gemini Audio API
    setTimeout(() => {
      setPlayingAudioId(null);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      {/* Шапка компонента */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.title}>Ваш персональный словарь</h2>
          <p className={styles.subtitle}>
            База профиля: <strong>{currentProfile}</strong>
          </p>
        </div>
        <div className={styles.badgeRow}>
          <span className={`${styles.badge} ${styles.emerald}`}>
            Изучено: {learnedCount}
          </span>
          <span className={`${styles.badge} ${styles.sky}`}>
            В процессе: {learningCount}
          </span>
          <span className={`${styles.badge} ${styles.slate}`}>
            Всего: {totalCount}
          </span>
        </div>
      </div>

      {/* Основной контент */}
      {words.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📚</div>
          <h3 className={styles.emptyTitle}>Ваш словарь пока пуст</h3>
          <p className={styles.emptyDesc}>
            Добавьте свои первые слова на английском с переводом в профиль
            &quot;{currentProfile}&quot;, чтобы начать тренировки.
          </p>
          <button
            onClick={() => dispatch(setActiveTab("add"))}
            className={styles.addFirstButton}
          >
            Добавить первое слово
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {words.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
