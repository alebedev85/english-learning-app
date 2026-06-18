"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { auth } from '@/core/firebase';
import { onAuthStateChanged, signInAnonymously, signOut, User as FirebaseUser } from 'firebase/auth';
import { setUser, setLoading, setError } from '@/store/slices/authSlice';
import { IUser } from '@/core/types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Слушаем авторизацию. Этот эффект сработает один раз для каждого компонента,
    // но теперь он НЕ переключает loading в true бездумно.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData: IUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'Гостевой профиль',
          isAnonymous: firebaseUser.isAnonymous,
        };
        dispatch(setUser(userData));
      } else {
        dispatch(setUser(null));
      }
    }, (err) => {
      console.error("Firebase Auth Error:", err);
      dispatch(setError(err.message));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const loginAsGuest = async () => {
    try {
      dispatch(setLoading(true));
      await signInAnonymously(auth);
    } catch (err: any) {
      dispatch(setError(err.message || "Не удалось войти в гостевом режиме"));
    }
  };

  const logout = async () => {
    try {
      dispatch(setLoading(true));
      await signOut(auth);
    } catch (err: any) {
      console.error("Ошибка выхода:", err);
    }
  };

  return { user, loading, error, loginAsGuest, logout };
};