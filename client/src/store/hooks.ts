import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

/**
 * Typed version of `useDispatch` — use this throughout the app instead of
 * the plain `useDispatch` so that dispatch accepts async thunks.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed version of `useSelector` — use this throughout the app instead of
 * the plain `useSelector` so that the state type is always `RootState`.
 */
export const useAppSelector = useSelector.withTypes<RootState>();
