// @/components/WordForm/WordForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addWord } from '@/store/slices/dictionarySlice';
import styles from './WordForm.module.scss';

export interface WordFormInputs {
  english: string;
  russian: string;
  context?: string;
}

export default function WordForm() {
  const dispatch = useDispatch();
  const { register, handleSubmit, reset, watch } = useForm<WordFormInputs>();
  
  // Локальные состояния анимаций ИИ
  const [translatingWord, setTranslatingWord] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);

  const currentEnglishValue = watch('english');

  // Фейковый автоматический перевод (имитация работы Gemini ИИ)
  const handleAiTranslate = () => {
    if (!currentEnglishValue?.trim()) return;
    
    setTranslatingWord(true);
    setTimeout(() => {
      // Здесь в будущем будет реальный запрос к API
      setTranslatingWord(false);
    }, 1200);
  };

  const onSubmit = (data: WordFormInputs) => {
    setGeneratingImg(true);

    // Имитируем генерацию картинки через Imagen, затем сохраняем в стор
    setTimeout(() => {
      dispatch(addWord({
        english: data.english,
        russian: data.russian,
        context: data.context || '',
      }));
      
      setGeneratingImg(false);
      reset(); // Очищаем форму после успешного добавления
    }, 1500);
  };

  return (
    <div className={styles.formCard}>
      <h2 className={styles.heading}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Новое слово в словарь
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.formGroup}>
        {/* Поле: Английское слово */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Слово на английском *</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              required
              placeholder="e.g. Dream"
              {...register('english', { required: true })}
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={handleAiTranslate}
              disabled={translatingWord || !currentEnglishValue?.trim()}
              className={styles.translateButton}
            >
              {translatingWord ? (
                <span className={styles.spinner} />
              ) : (
                <>🤖 ИИ Перевод</>
              )}
            </button>
          </div>
        </div>

        {/* Поле: Русский перевод */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Перевод на русский *</label>
          <input
            type="text"
            required
            placeholder="Заполнится автоматически через ИИ или введите сами"
            {...register('russian', { required: true })}
            className={styles.inputField}
          />
        </div>

        {/* Поле: Контекст */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Контекст использования (опционально)</label>
          <textarea
            placeholder="Заполнится автоматически примером или введите свой"
            rows={2}
            {...register('context')}
            className={styles.textareaField}
          />
        </div>

        {/* Блок предупреждения об ИИ-генерации картинок */}
        <div className={styles.infoBlock}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>ИИ Иллюстрация:</strong> Наша система автоматически сгенерирует визуальный образ для этого слова с помощью ИИ Imagen, чтобы задействовать вашу визуальную память при обучении.
          </span>
        </div>

        {/* Кнопка отправки формы */}
        <button type="submit" disabled={generatingImg} className={styles.submitButton}>
          {generatingImg ? (
            <>
              <svg className={styles.submitSpinner} fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Генерация ИИ-иллюстрации...
            </>
          ) : (
            'Добавить слово в словарь'
          )}
        </button>
      </form>
    </div>
  );
}