"use client";

import ActionButton from "@/components/ui/ActionButton/ActionButton";
import Notification from "@/components/ui/Notification/Notification";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store";
import { setActiveTab } from "@/store/slices/uiSlice";
import styles from "./Header.module.scss";

export default function Header() {
  const dispatch = useAppDispatch();
  const { logout } = useAuth();

  // Получаем данные из Redux стейтов
  const activeTab = useAppSelector((state) => state.ui.activeTab);
  const words = useAppSelector((state) => state.dictionary.words || []);
  const currentProfile = useAppSelector(
    (state) => state.dictionary.currentProfile || "Основной профиль",
  );
  const {user, loading} = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    logout(); // Сработает очистка Redux + удаление из localStorage
    dispatch(setActiveTab("learn")); // Сброс активной вкладки
    console.log("Выход из системы...");

    // 2. Сбрасываем вкладку на дефолтную для следующей сессии
    dispatch(setActiveTab("learn"));
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Notification />
        {/* Логотип */}
        <div className={styles.logoSection}>
          <div className={styles.logoIconBox}>
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className={styles.logoTitle}>LinguaBoost</h1>
            <p className={styles.logoSubtitle}>
              Умный тренажер английского языка
            </p>
          </div>
        </div>

        {/* Управление и Меню */}
        {!loading ? (
          <div className={styles.controlsSection}>
            <nav className={styles.nav}>
              <button
                className={`${styles.navButton} ${activeTab === "learn" ? styles.active : ""}`}
                onClick={() => dispatch(setActiveTab("learn"))}
              >
                Изучение
              </button>

              <button
                className={`${styles.navButton} ${activeTab === "add" ? styles.active : ""}`}
                onClick={() => dispatch(setActiveTab("add"))}
              >
                + Слово
              </button>

              <button
                className={`${styles.navButton} ${activeTab === "dictionary" ? styles.active : ""}`}
                onClick={() => dispatch(setActiveTab("dictionary"))}
              >
                Словарь ({words.length})
              </button>

              <button
                className={`${styles.navButton} ${styles.profileBtn} ${activeTab === "profiles" ? styles.active : ""}`}
                onClick={() => dispatch(setActiveTab("profiles"))}
              >
                👤 {currentProfile}
              </button>
            </nav>

            {/* Информация о сессии пользователя */}
            <div className={styles.userSection}>
              <div className={styles.userInfo}>
                <span className={styles.userId}>
                  ID: {user ? user.email : "—"}
                </span>
                <span className={styles.userStatus}>
                  {user?.isAnonymous ? "Гостевой профиль" : "Пользователь"}
                </span>
              </div>

              <button className={styles.logoutButton} onClick={handleLogout}>
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <ActionButton
            className={styles.loginButton}
            variant="primary"
            fontSize="sm"
          >
            Войти в аккаунт
          </ActionButton>
        )}
      </div>
    </header>
  );
}
