"use client";

import { aiService } from "@/core/services/aiService";
import { useAppDispatch } from "@/store";
import { saveWordThunk } from "@/store/slices/dictionarySlice";
import { showNotificationWithTimeout } from "@/store/slices/uiSlice";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import styles from "./WordForm.module.scss";

export interface WordFormInputs {
  english: string;
  russian: string;
  context?: string;
}

export default function WordForm() {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, reset, control, setValue } =
    useForm<WordFormInputs>();

  // Локальные состояния анимаций ИИ
  const [translatingWord, setTranslatingWord] = useState(false);
  const [generatingImg, setGeneratingImg] = useState(false);

  // Следим за изменениями английского поля для работы кнопки перевода
  const currentEnglishValue = useWatch({
    control,
    name: "english",
  });

  // Функция перевода:
  const handleAiTranslate = async () => {
    if (!currentEnglishValue?.trim()) {
      dispatch(
        showNotificationWithTimeout({
          text: "Введите слово на английском для перевода",
          type: "warning",
        }),
      );
      return;
    }

    setTranslatingWord(true);

    try {
      // Чистый, понятный вызов в одну строчку
      const data =
        await aiService.getTranslationAndContext(currentEnglishValue);

      setValue("russian", data.translation);
      setValue("context", data.example);

      dispatch(
        showNotificationWithTimeout({
          text: "Перевод успешно сгенерирован Gemini",
          type: "success",
        }),
      );
    } catch (err) {
      console.error("Translation error:", err);
      dispatch(
        showNotificationWithTimeout({
          text: "Не удалось автоматически перевести. Введите перевод вручную.",
          type: "warning",
        }),
      );
    } finally {
      setTranslatingWord(false);
    }
  };

  // Функция сабмита формы теперь выглядит так:
  const onSubmit = async (data: WordFormInputs) => {
    // 1. Проверяем наличие перевода (если пользователь проигнорировал автоперевод и оставил поле пустым)
    if (!data.russian?.trim()) {
      dispatch(
        showNotificationWithTimeout({
          text: "Добавьте перевод на русский язык перед сохранением",
          type: "warning",
        }),
      );
      return;
    }

    setGeneratingImg(true); // Включаем лоадер "Генерация ИИ-иллюстрации..."

    try {
      // 2. Отправляем в Thunk чистые данные из полей формы
      // Флаг needImage: true говорит танку, что нужно попробовать сгенерировать картинку
      const result = await dispatch(
        saveWordThunk({
          english: data.english.trim(),
          russian: data.russian.trim(),
          context: data.context?.trim() || "",
          needImage: true,
        }),
      ).unwrap();

      // 3. Если всё прошло успешно (слово сохранилось)
      reset(); // Очищаем форму

      // Проверяем, создалась ли картинка на бэкенде, чтобы выдать точное уведомление
      if (result.isImageFailed) {
        dispatch(
          showNotificationWithTimeout({
            text: `Слово "${data.english}" добавлено, но картинку сгенерировать не удалось. Вы можете сделать это позже в словаре.`,
            type: "warning",
          }),
        );
      } else {
        dispatch(
          showNotificationWithTimeout({
            text: `Слово "${data.english}" успешно добавлено с ИИ-иллюстрацией!`,
            type: "success",
          }),
        );
      }
    } catch (err) {
      console.error("Save word error:", err);
      dispatch(
        showNotificationWithTimeout({
          text: "Не удалось добавить слово в словарь. Попробуйте позже.",
          type: "error",
        }),
      );
    } finally {
      setGeneratingImg(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h2 className={styles.heading}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Новое слово в словарь
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles.formGroup}
        noValidate
      >
        {/* Поле: Английское слово */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>Слово на английском *</label>
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="e.g. Dream"
              {...register("english", { required: true })}
              disabled={translatingWord || generatingImg}
              className={styles.inputField}
            />
            <button
              type="button"
              onClick={handleAiTranslate}
              disabled={
                translatingWord || generatingImg || !currentEnglishValue?.trim()
              }
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
            placeholder="Заполнится автоматически через ИИ или введите сами"
            {...register("russian", { required: true })}
            disabled={translatingWord || generatingImg}
            className={styles.inputField}
          />
        </div>

        {/* Поле: Контекст */}
        <div className={styles.fieldWrapper}>
          <label className={styles.label}>
            Контекст использования (опционально)
          </label>
          <textarea
            placeholder="Заполнится автоматически примером или введите свой"
            rows={2}
            {...register("context")}
            disabled={translatingWord || generatingImg}
            className={styles.textareaField}
          />
        </div>

        {/* Блок предупреждения об ИИ-генерации картинок */}
        <div className={styles.infoBlock}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>ИИ Иллюстрация:</strong> Наша система автоматически
            сгенерирует визуальный образ для этого слова с помощью ИИ Imagen,
            чтобы задействовать вашу визуальную память при обучении.
          </span>
        </div>

        {/* Кнопка отправки формы */}
        <button
          type="submit"
          disabled={translatingWord || generatingImg}
          className={styles.submitButton}
        >
          {generatingImg ? (
            <>
              <svg
                className={styles.submitSpinner}
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  style={{ opacity: 0.25 }}
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  style={{ opacity: 0.75 }}
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Генерация ИИ-иллюстрации...
            </>
          ) : (
            "Добавить слово в словарь"
          )}
        </button>
      </form>
    </div>
  );
}
