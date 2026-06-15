"use client";

import React from "react";
import styles from "./ActionButton.module.scss";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost"; // primary (зеленая), secondary (темная из reset), ghost (без фона)
  fontSize?: "xs" | "sm" | "md";               // разные размеры шрифта (xs = 0.75rem, sm = 0.875rem, md = 1rem)
  className?: string;
}

export default function ActionButton({
  children,
  variant = "primary",
  fontSize = "sm",
  className = "",
  type = "button",
  ...props // Пропсы типа disabled, onClick, и т.д. прокинутся автоматически
}: ActionButtonProps) {
  
  // Динамически собираем классы на основе пропсов
  const buttonClasses = [
    styles.actionBtn,
    styles[variant],
    styles[fontSize],
    className,
  ].join(" ");

  return (
    <button type={type} className={buttonClasses} {...props}>
      {children}
    </button>
  );
}