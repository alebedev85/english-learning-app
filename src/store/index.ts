import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dictionaryReducer from './slices/dictionarySlice';
import uiReducer from './slices/uiSlice';
import trainingReducer from './slices/trainingSlice';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { showNotificationWithTimeout } from './slices/uiSlice'; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dictionary: dictionaryReducer,
    ui: uiReducer,
    training: trainingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

/**
 * Реактивные уведомления на вход и выход
 */
let previousUserId: string | null = null;
let isFirstLoad = true; // Защита от спама уведомлением при обновлении страницы F5

store.subscribe(() => {
  if (typeof window === 'undefined') return;

  const state = store.getState();
  const currentUser = state.auth.user;
  const currentUserId = currentUser?.uid || null;

  // Проверяем, действительно ли изменился ID пользователя
  if (previousUserId !== currentUserId) {
    const oldUserId = previousUserId;
    previousUserId = currentUserId; // Лочим состояние ДО диспатча, чтобы разорвать рекурсию

    if (!isFirstLoad) {
      if (currentUser) {
        store.dispatch(
          showNotificationWithTimeout({
            text: `👋 Добро пожаловать! Вы вошли как ${currentUser.isAnonymous ? 'Гость' : currentUser.email}`,
            type: 'success',
          })
        );
      } else if (oldUserId !== null) {
        store.dispatch(
          showNotificationWithTimeout({
            text: '🚪 Вы успешно вышли из профиля',
            type: 'info',
          })
        );
      }
    }
    isFirstLoad = false;
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;