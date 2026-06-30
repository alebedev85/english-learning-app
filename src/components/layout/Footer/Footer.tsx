import React from "react";
import styles from "./Footer.module.scss";

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Левая часть: Копирайт с ИИ-интеграцией */}
        <p className={styles.copyright}>
          © 2026 LinguaBoost. Lebedev Andrey.
        </p>

        {/* Правая часть: Контакты */}
        <div className={styles.socials}>
          {/* Gmail */}
          <a
            href="mailto:alebedev424@gmail.com"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Написать в Gmail"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>

          {/* Telegram */}
          <a
            href="https://t.me/andrei_lebedev"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Написать в Telegram"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </a>

          {/* WhatsApp */}
          <a
            href="https://wa.me/89168779756"
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Написать в WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};