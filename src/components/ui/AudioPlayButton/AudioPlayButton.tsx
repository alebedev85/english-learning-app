"use client";

import React from "react";
import { useGeminiTTS } from "@/hooks/useGeminiTTS";
import styles from "./AudioPlayButton.module.scss";

interface AudioPlayButtonProps {
  text: string;
  variant?: "filled" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode; // <-- Добавляем слот для текста внутри кнопки
}

export default function AudioPlayButton({
  text,
  variant = "ghost",
  size = "md",
  className = "",
  children,
}: AudioPlayButtonProps) {
  const { speak, isPlaying } = useGeminiTTS();

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const currentIconSize = iconSizes[size];

  // Если передан текст, кнопка должна менять форму с круглой на вытянутую (inline-flex)
  const buttonClasses = [
    styles.audioBtn,
    styles[variant],
    styles[size],
    children ? styles.withText : styles.iconOnly, // Динамический класс формы
    className,
  ].join(" ");

  return (
    <button
      type="button"
      onClick={() => speak(text)}
      disabled={isPlaying}
      className={buttonClasses}
      title={typeof children === "string" ? children : "Прослушать произношение"}
    >
      {/* Иконка или Спиннер */}
      {isPlaying ? (
        <span 
          className={styles.spinner} 
          style={{ width: currentIconSize, height: currentIconSize }} 
        />
      ) : (
        <svg
          width={currentIconSize}
          height={currentIconSize}
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

      {/* Выводим текст, если он передан */}
      {children && <span className={styles.btnText}>{children}</span>}
    </button>
  );
}