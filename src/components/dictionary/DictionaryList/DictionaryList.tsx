import { useAppDispatch, useAppSelector } from "@/store";
import { deleteWord, toggleWordStatus } from "@/store/slices/dictionarySlice";
import { setActiveTab } from "@/store/slices/uiSlice";
import Image from "next/image";
import { useState } from "react";
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
            <div key={word.id} className={styles.wordCard}>
              {/* Прогресс-бар сверху */}
              <div
                className={styles.progressBar}
                style={{ width: `${word.progress || 0}%` }}
              />

              <div className={styles.cardTop}>
                <div className={styles.wordInfo}>
                  <div className={styles.wordHeader}>
                    <h3 className={styles.englishText}>{word.english}</h3>
                    <button
                      onClick={() => playWordAudio(word.english, word.id)}
                      disabled={playingAudioId === word.id}
                      className={styles.audioButton}
                      title="Прослушать произношение"
                    >
                      {playingAudioId === word.id ? (
                        <span className={styles.spinner} />
                      ) : (
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
                            strokeWidth={2}
                            d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className={styles.russianText}>{word.russian}</p>
                </div>

                {word.imageUrl && (
                  <Image
                    src={word.imageUrl}
                    alt={word.english}
                    className={styles.cardImg}
                  />
                )}
              </div>

              {word.context && (
                <p className={styles.contextBlock}>
                  &quot;{word.context}&quot;
                </p>
              )}

              {/* Футер карточки с экшенами управления */}
              <div className={styles.cardFooter}>
                <div className={styles.statusIndicator}>
                  <span
                    className={`${styles.dot} ${word.status === "learned" ? styles.mastered : styles.learning}`}
                  />
                  <span className={styles.statusText}>
                    {word.status === "learned"
                      ? "Изучено"
                      : `Освоено ${word.progress || 0}%`}
                  </span>
                </div>

                <div className={styles.actions}>
                  <button
                    onClick={() => dispatch(toggleWordStatus(word.id))}
                    className={`${styles.toggleButton} ${word.status === "learned" ? styles.reset : styles.complete}`}
                  >
                    {word.status === "learned" ? "Сбросить" : "Изучено"}
                  </button>
                  <button
                    onClick={() => dispatch(deleteWord(word.id))}
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
          ))}
        </div>
      )}
    </div>
  );
}
