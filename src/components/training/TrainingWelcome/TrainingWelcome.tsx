import React from 'react';
import styles from './TrainingWelcome.module.scss';

interface TrainingWelcomeProps {
  currentProfile: string;
  startTraining: () => void;
}

export default function TrainingWelcome({ currentProfile, startTraining }: TrainingWelcomeProps) {
  return (
    <div className={styles.welcomeCard}>
      {/* Декоративные блюр-окружения */}
      <div className={styles.blurTopLeft} />
      <div className={styles.blurBottomRight} />

      <div className={styles.contentWrapper}>
        <div className={styles.rocketBadge}>
          🚀
        </div>
        
        <h2 className={styles.title}>
          Интерактивная тренировка памяти
        </h2>
        
        <p className={styles.profileInfo}>
          Текущий профиль: {currentProfile}
        </p>
        
        <p className={styles.description}>
          Наша научно обоснованная методика задействует сразу 3 вида памяти:{' '}
          <span className={styles.highlight}>Визуальную</span> (ИИ-образы),{' '}
          <span className={styles.highlight}>Слуховую</span> (Gemini озвучка) и{' '}
          <span className={styles.highlight}>Моторную</span> (интерактивный конструктор слов и диктант).
        </p>

        {/* Сетка четырех этапов обучения */}
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={`${styles.stepTitle} ${styles.emerald}`}>
              Этап 1: Слово-Перевод
            </span>
            <p className={styles.stepDesc}>
              Визуальная связь образа с английским оригиналом и произношением.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={`${styles.stepTitle} ${styles.teal}`}>
              Этап 2: Тест выбора
            </span>
            <p className={styles.stepDesc}>
              Распознавание правильного слова среди альтернатив на скорость.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={`${styles.stepTitle} ${styles.sky}`}>
              Этап 3: &quot;Конструктор&quot;
            </span>
            <p className={styles.stepDesc}>
              Моторная сборка слова из предложенных букв по памяти.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={`${styles.stepTitle} ${styles.violet}`}>
              Этап 4: &quot;Аудирование&quot;
            </span>
            <p className={styles.stepDesc}>
              Восприятие слова на слух и его ручной ввод без подсказок.
            </p>
          </div>
        </div>

        {/* Зона действия */}
        <div className={styles.actionBlock}>
          <button onClick={startTraining} className={styles.startButton}>
            Начать тренировку (6 слов)
          </button>
          <p className={styles.hintText}>
            Система автоматически выберет неизученные слова из вашего активного профиля.
          </p>
        </div>
      </div>
    </div>
  );
}