import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveTab } from "@/store/slices/uiSlice";
import { useMemo, useState } from "react";
import WordCard from "../WordCard/WordCard";
import styles from "./DictionaryList.module.scss";

// Типизируем возможные состояния фильтра
type FilterType = "all" | "learned" | "learning";

export default function DictionaryList() {
  const dispatch = useAppDispatch();

  // Локальное состояние для активного фильтра
  const [filter, setFilter] = useState<FilterType>("all");

  // Достаем данные словаря из Redux
  const { words, currentProfile } = useAppSelector((state) => state.dictionary);
  // Вычисляем аналитику на лету
  const totalCount = words.length;
  const learnedCount = words.filter((w) => w.status === "learned").length;
  const learningCount = totalCount - learnedCount;

  // Фильтруем список слов на лету в зависимости от выбранного вкладки
  const filteredWords = useMemo(() => {
    return words.filter((word) => {
      if (filter === "learned") return word.status === "learned";
      if (filter === "learning") return word.status !== "learned"; // всё, что не выучено
      return true; // для 'all'
    });
  }, [words, filter]);

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
        {/* Интерактивная строка фильтров */}
        <div className={styles.badgeRow}>
          <button
            type="button"
            onClick={() => setFilter("learned")}
            className={`${styles.badge} ${styles.emerald} ${
              filter === "learned" ? styles.active : ""
            }`}
          >
            Изучено: {learnedCount}
          </button>
          <button
            type="button"
            onClick={() => setFilter("learning")}
            className={`${styles.badge} ${styles.sky} ${
              filter === "learning" ? styles.active : ""
            }`}
          >
            В процессе: {learningCount}
          </button>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`${styles.badge} ${styles.slate} ${
              filter === "all" ? styles.active : ""
            }`}
          >
            Всего: {totalCount}
          </button>
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
      ) : filteredWords.length === 0 ? (
        // Дополнительный дружелюбный Empty State, если слова в словаре есть, но по данному фильтру пусто
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🔍</div>
          <h3 className={styles.emptyTitle}>Нет слов в этой категории</h3>
          <p className={styles.emptyDesc}>
            У вас пока нет слов со статусом{" "}
            {filter === "learned" ? '"Изучено"' : '"В процессе"'}.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {/* Рендерим отфильтрованный массив */}
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
