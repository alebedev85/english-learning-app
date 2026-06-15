"use client";

import ActionButton from "@/components/ui/ActionButton/ActionButton";
import { useMemo, useState } from "react";
import { useTraining } from "../context/TrainingContext";
import styles from "./StageConstructor.module.scss";

/**
 * Интерфейс для представления отдельной буквы изучаемого слова.
 * Использование объектов вместо простых строк необходимо для корректной обработки
 * повторяющихся букв в слове (например, две буквы "e" в слове "meet" будут иметь разные id).
 */
interface LetterObject {
  id: string; // Уникальный идентификатор вида `${char}-${index}`
  char: string; // Символ буквы
}

/**
 * Чистая внешняя функция для декомпозиции слова на массив объектов-букв и их перемешивания.
 * Вынесена за пределы компонента, чтобы исключить генерацию случайных чисел (Math.random)
 * во время рендеринга, обеспечивая детерминированность UI.
 */
function generateShuffledLetters(word: string): LetterObject[] {
  return word
    .split("") // Разбиваем строку на массив одиночных символов
    .map((char, index) => ({ id: `${char}-${index}`, char })) // Навешиваем уникальные ID
    .sort(() => Math.random() - 0.5); // Случайным образом перемешиваем массив
}

export default function StageConstructor() {
  // Извлекаем из контекста данные текущего слова и метод отправки ответа
  const { currentWord, handleAnswer } = useTraining();

  /**
   * Единственное реактивное состояние компонента.
   * Хранит массив объектов-букв, которые пользователь уже кликнул и переместил в верхнее поле сборки.
   */
  const [selectedLetters, setSelectedLetters] = useState<LetterObject[]>([]);

  /**
   * Исходный полный пул перемешанных букв для текущего слова.
   * Кешируется с помощью useMemo и пересчитывается строго при изменении ID изучаемого слова.
   * Это предотвращает повторное случайное перемешивание букв при обычных рендерах (например, при клике на букву).
   */
  const allLetters = useMemo(() => {
    if (!currentWord) return [];
    return generateShuffledLetters(currentWord.english);
  }, [currentWord?.id]);

  /**
   * Вычисляемое состояние доступных букв (нижний пул).
   * Реализовано через паттерн производного состояния (Derived State) без использования useEffect.
   * На лету отфильтровывает из полного пула те буквы, идентификаторы которых уже находятся в selectedLetters.
   */
  const availableLetters = useMemo(() => {
    // Создаем Set из ID выбранных букв для O(1) скорости поиска внутри filter
    const selectedIds = new Set(selectedLetters.map((l) => l.id));
    return allLetters.filter((letter) => !selectedIds.has(letter.id));
  }, [allLetters, selectedLetters]);

  // Защитный хард-гард: если сессия завершилась или слово отсутствует, не рендерим интерфейс
  if (!currentWord) return null;

  /**
   * Обработчик клика по букве в нижнем (доступном) пуле.
   * Перемещает букву наверх, добавляя её в массив выбранных.
   */
  const handleSelectLetter = (letter: LetterObject) => {
    setSelectedLetters((prev) => [...prev, letter]);
  };

  /**
   * Обработчик клика по букве в верхнем поле сборки (отмена выбора).
   * Исключает букву из массива выбранных, вследствие чего она автоматически возвращается вниз.
   */
  const handleDeselectLetter = (letter: LetterObject) => {
    setSelectedLetters((prev) => prev.filter((l) => l.id !== letter.id));
  };

  /**
   * Сброс текущей сборки. Очищает массив выбранных букв,
   * возвращая все элементы в исходный перемешанный пул.
   */
  const handleReset = () => {
    setSelectedLetters([]);
  };

  /**
   * Финальная проверка собранной конструкции.
   * Склеивает буквы в строку, валидирует результат с оригиналом и отправляет ответ в контекст.
   */
  const handleCheck = () => {
    const assembledWord = selectedLetters.map((l) => l.char).join("");
    const isCorrect =
      assembledWord.toLowerCase() === currentWord.english.toLowerCase();

    // Очищаем локальный стейт сборщика перед переходом к следующему слову
    setSelectedLetters([]);
    // Передаем вердикт и правильный вариант ответа в глобальный движок тренировки
    handleAnswer(isCorrect, currentWord.english);
  };

  // Валидация доступности кнопки проверки: активна только при полной укомплектованности слова
  const isCheckDisabled = selectedLetters.length !== currentWord.english.length;

  return (
    <div className={styles.innerWrapper}>
      <div className={styles.container}>
        {/* Шапка карточки шага: задание, перевод и контекстный пример */}
        <div className={styles.header}>
          <span className={styles.label}>Соберите слово из букв:</span>
          <h3 className={styles.russianWord}>{currentWord.russian}</h3>
          {currentWord.context && (
            // Кавычки заменены на безопасные HTML-мнемоники для прохождения строгих линтеров
            <p className={styles.contextText}>
              &laquo;{currentWord.context}&raquo;
            </p>
          )}
        </div>

        {/* Зона сборки (Верхний слот) */}
        <div className={styles.assemblyZone}>
          {selectedLetters.length === 0 ? (
            <span className={styles.placeholder}>Нажимайте на буквы внизу</span>
          ) : (
            <div className={styles.lettersRow}>
              {selectedLetters.map((letter) => (
                <button
                  key={`selected-${letter.id}`} // Префикс гарантирует уникальность ключей в DOM-дереве
                  className={styles.letterBtn}
                  onClick={() => handleDeselectLetter(letter)}
                >
                  {letter.char}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Пул доступных для выбора букв (Нижний слот) */}
        <div className={styles.poolZone}>
          <div className={styles.lettersRow}>
            {availableLetters.map((letter) => (
              <button
                key={`available-${letter.id}`} // Изолированный префикс для нижнего списка
                className={styles.letterBtn}
                onClick={() => handleSelectLetter(letter)}
              >
                {letter.char}
              </button>
            ))}
          </div>
        </div>

        {/* Панель управления действиями */}
        <div className={styles.actions}>
          <ActionButton
            variant="secondary"
            fontSize="sm"
            onClick={handleReset}
            disabled={selectedLetters.length === 0}
          >
            Сбросить
          </ActionButton>

          <ActionButton
            variant="primary"
            fontSize="sm"
            onClick={handleCheck}
            disabled={isCheckDisabled}
          >
            Проверить слово
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
