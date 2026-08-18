// ============================================================
// APP STORE - Global Application State
// ============================================================
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User } from '../types/user.types';
import type { ToastMessage } from '../types/common.types';

interface AppState {
  // User & Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  
  // Theme
  themeMode: 'light' | 'dark';
  
  // Navigation
  sidebarCollapsed: boolean;
  activePage: string;
  
  // Notifications
  unreadNotificationCount: number;
  
  // Toasts
  toasts: ToastMessage[];
  
  // Loading
  globalLoading: boolean;
  globalLoadingText?: string;
  
  // App Config
  environmentUrl: string;
  enableAI: boolean;
}

interface AppActions {
  setCurrentUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActivePage: (page: string) => void;
  setUnreadNotificationCount: (count: number) => void;
  incrementUnreadNotifications: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setGlobalLoading: (loading: boolean, text?: string) => void;
  setEnvironmentUrl: (url: string) => void;
  setEnableAI: (enabled: boolean) => void;
  reset: () => void;
}

type AppStore = AppState & AppActions;

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  themeMode: 'light',
  sidebarCollapsed: false,
  activePage: '/dashboard',
  unreadNotificationCount: 0,
  toasts: [],
  globalLoading: false,
  environmentUrl: '',
  enableAI: false,
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, _get) => ({
        ...initialState,

        setCurrentUser: (user) => set((state) => { state.currentUser = user; }),
        setAuthenticated: (isAuthenticated) => set((state) => { state.isAuthenticated = isAuthenticated; }),
        
        toggleTheme: () =>
          set((state) => {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
          }),
        setThemeMode: (mode) => set((state) => { state.themeMode = mode; }),
        
        toggleSidebar: () =>
          set((state) => { state.sidebarCollapsed = !state.sidebarCollapsed; }),
        setSidebarCollapsed: (collapsed) =>
          set((state) => { state.sidebarCollapsed = collapsed; }),
        
        setActivePage: (page) => set((state) => { state.activePage = page; }),
        
        setUnreadNotificationCount: (count) =>
          set((state) => { state.unreadNotificationCount = count; }),
        incrementUnreadNotifications: () =>
          set((state) => { state.unreadNotificationCount += 1; }),
        
        addToast: (toast) =>
          set((state) => {
            const id = `toast-${Date.now()}-${Math.random()}`;
            state.toasts.push({ ...toast, id });
            // Auto-remove after duration
          }),
        removeToast: (id) =>
          set((state) => {
            state.toasts = state.toasts.filter((t) => t.id !== id);
          }),
        clearToasts: () => set((state) => { state.toasts = []; }),
        
        setGlobalLoading: (loading, text) =>
          set((state) => {
            state.globalLoading = loading;
            state.globalLoadingText = text;
          }),
        
        setEnvironmentUrl: (url) => set((state) => { state.environmentUrl = url; }),
        setEnableAI: (enabled) => set((state) => { state.enableAI = enabled; }),
        
        reset: () => set(initialState),
      })),
      {
        name: 'psrd-app-store',
        partialize: (state) => ({
          themeMode: state.themeMode,
          sidebarCollapsed: state.sidebarCollapsed,
        }),
      }
    ),
    { name: 'PSRD-AppStore' }
  )
);

// Selector hooks for performance optimization
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useThemeMode = () => useAppStore((state) => state.themeMode);
export const useSidebarCollapsed = () => useAppStore((state) => state.sidebarCollapsed);
export const useToasts = () => useAppStore((state) => state.toasts);
export const useGlobalLoading = () => useAppStore((state) => ({
  loading: state.globalLoading,
  text: state.globalLoadingText,
}));
