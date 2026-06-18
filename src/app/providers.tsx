"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/core/firebase";
import { setUser, setLoading } from "@/store/slices/authSlice";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // При холодном старте приложения запускаем один главный лоадер
    store.dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        store.dispatch(setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'Гостевой профиль',
          isAnonymous: firebaseUser.isAnonymous,
        }));
      } else {
        store.dispatch(setUser(null));
      }
      // Выключаем главный лоадер один раз на всё приложение
      store.dispatch(setLoading(false));
    });

    return () => unsubscribe();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}