// @/components/UserProfile/UserProfile.tsx
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { changeProfile, addProfile } from '@/store/slices/dictionarySlice';
import styles from './ProfileManager.module.scss';

export default function ProfileManager() {
  const dispatch = useAppDispatch();
  
  // Достаем плоские данные из стейта по Варианту 1
  const { profiles, currentProfile } = useAppSelector((state) => state.dictionary);
  
  const [newProfileName, setNewProfileName] = useState('');

  const handleSelectProfile = (profileName: string) => {
    dispatch(changeProfile(profileName));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newProfileName.trim();
    
    if (trimmedName) {
      dispatch(addProfile(trimmedName));
      setNewProfileName('');
    }
  };

  return (
    <div className={styles.profileCard}>
      <h2 className={styles.title}>
        <span>👤</span> Профили обучения
      </h2>
      <p className={styles.description}>
        Вы можете переключаться между профилями (например, для разных членов семьи или для разных уровней сложности). 
        Каждому профилю соответствует своя независимая база слов.
      </p>

      <div className={styles.listContainer}>
        <label className={styles.label}>Выберите активный профиль:</label>
        {profiles.map((profile) => (
          <button
            key={profile}
            type="button"
            onClick={() => handleSelectProfile(profile)}
            className={`${styles.profileButton} ${
              currentProfile === profile ? styles.active : styles.inactive
            }`}
          >
            <span>{profile}</span>
            {currentProfile === profile && (
              <span className={styles.activeBadge}>
                Активен
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleCreateProfile} className={styles.form}>
        <label className={styles.label}>Создать новый профиль:</label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            required
            placeholder="Например, Ребенок, Advanced, Разговорный..."
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            className={styles.input}
          />
          <button
            type="submit"
            className={styles.submitButton}
          >
            Создать
          </button>
        </div>
      </form>
    </div>
  );
}