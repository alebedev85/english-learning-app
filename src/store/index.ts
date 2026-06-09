import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dictionaryReducer from './slices/dictionarySlice';
import uiReducer from './slices/uiSlice';
import trainingReducer from './slices/trainingSlice';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';

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

// Экспорт типов для использования в кастомных хуках Редакса
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;