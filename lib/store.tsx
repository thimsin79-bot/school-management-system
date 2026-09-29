"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { AppState } from "./types";

export const STORAGE_KEY = "sms_full_app_v1";

const EMPTY_STATE: AppState = {
  teachers: [],
  students: [],
  parents: [],
  subjects: [],
  classRooms: [],
  schedule: [],
  attendance: [],
  exams: [],
  examResults: [],
  users: [],
  notices: [],
};

function normalize(raw: unknown): AppState {
  const parsed = (raw ?? {}) as Partial<AppState>;
  const state = { ...EMPTY_STATE };
  for (const key of Object.keys(EMPTY_STATE) as Array<keyof AppState>) {
    const value = parsed[key];
    if (Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (state as any)[key] = value;
    }
  }
  return state;
}

const listeners = new Set<() => void>();
let cache: AppState | null = null;
let storageBound = false;

function read(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    /* missing or malformed payload — start from an empty state */
  }
  return EMPTY_STATE;
}

function getSnapshot(): AppState {
  if (cache === null) cache = read();
  return cache;
}

function getServerSnapshot(): AppState {
  return EMPTY_STATE;
}

function emit() {
  for (const listener of listeners) listener();
}

function bindStorageEvent() {
  if (storageBound) return;
  storageBound = true;
  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY || event.newValue == null) return;
    try {
      cache = normalize(JSON.parse(event.newValue));
      emit();
    } catch {
      /* ignore malformed payloads from other tabs */
    }
  });
}

function subscribe(listener: () => void) {
  bindStorageEvent();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function mutate(recipe: (draft: AppState) => void) {
  const draft = structuredClone(getSnapshot());
  recipe(draft);
  cache = draft;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* storage unavailable — state stays in memory */
  }
  emit();
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  update: (recipe: (draft: AppState) => void) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const update = useCallback((recipe: (draft: AppState) => void) => {
    mutate(recipe);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({ state, hydrated, update }),
    [state, hydrated, update],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function useHydrated(): boolean {
  return useApp().hydrated;
}
