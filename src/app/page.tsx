'use client';

import { useAppDispatch, useAppSelector } from '@/store';
import { useAuth } from '@/hooks/useAuth';

import TrainingManager from '@/components/training/TrainingManager/TrainingManager';
import WordForm from '@/components/dictionary/WordForm/WordForm';
import DictionaryList from '@/components/dictionary/DictionaryList/DictionaryList';
import ProfileManager from '@/components/profiles/ProfileManager/ProfileManager';
// import AuthForm from '@/components/auth/AuthForm';

// Подключение модульного SCSS
import styles from './page.module.scss';
import Loader from '@/components/ui/Loader/Loader';
import { setUser } from '@/store/slices/authSlice';
import { useEffect } from 'react';

export default function HomePage() {
  const dispatch = useAppDispatch();
  // Отказоустойчивый хук авторизации (Firebase + Local Fallback)
  const { user, loading } = useAuth();
  
  // Получаем текущую активную вкладку из Redux UI-слайса
  const activeTab = useAppSelector((state) => state.ui.activeTab);

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    }
  }, [user, dispatch]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.loadingContent}>
          <Loader />
          <p className={styles.loadingText}>Инициализация вашей персональной базы слов...</p>
        </div>
      </div>
    );
  }

  // Если нет сессии Firebase и не отработал локальный режим
  // if (!user) {
  //   return <AuthForm />;
  // }

  //Функция рендеринга контента в зависимости от таба
  const renderContent = (): React.ReactNode => {
    switch (activeTab) {
      case 'learn':
        return <TrainingManager />;
      case 'add':
        return <WordForm />;
      case 'dictionary':
        return <DictionaryList  />;
      case 'profiles':
        return <ProfileManager />;
      default:
        return <TrainingManager />;
    }
  };

  return (
    <main className={styles.mainContainer}>
      {renderContent()}
    </main>
  );
}