"use client";

import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch, useAppSelector } from "@/store";

import DictionaryList from "@/components/dictionary/DictionaryList/DictionaryList";
import WordForm from "@/components/dictionary/WordForm/WordForm";
import ProfileManager from "@/components/profiles/ProfileManager/ProfileManager";
import TrainingManager from "@/components/training/TrainingManager/TrainingManager";
import AuthForm from "@/components/auth/AuthForm/AuthForm";
import Loader from "@/components/ui/Loader/Loader";
import styles from "./page.module.scss";

export default function HomePage() {
  const dispatch = useAppDispatch();
  // Отказоустойчивый хук авторизации (Firebase + Local Fallback)
  const { user, loading, error } = useAuth();

  // Получаем текущую активную вкладку из Redux UI-слайса
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <Loader />
          <p className={styles.loadingText}>
            Инициализация вашей персональной базы слов...
          </p>
          {error && <p className="text-red-500 mt-4">Ошибка Firebase: {error}</p>}
        </div>
      </div>
    );
  }

  // Если нет сессии Firebase и не отработал локальный режим
  if (!user) {
    return (
      <div className={styles.authWrapper}>
        <AuthForm />
      </div>
    );
  }

  //Функция рендеринга контента в зависимости от таба
  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case "learn":
        return <TrainingManager />;
      case "add":
        return <WordForm />;
      case "dictionary":
        return <DictionaryList />;
      case "profiles":
        return <ProfileManager />;
      default:
        return <TrainingManager />;
    }
  };

  return <main className={styles.mainContainer}>{renderContent()}</main>;
}
