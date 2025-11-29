import { create } from 'zustand';

export const useLoadingStore = create((set) => ({
    isLoading: false,
    message: 'Loading...',
    showLoading: (message = 'Loading...') => set({ isLoading: true, message }),
    hideLoading: () => set({ isLoading: false, message: 'Loading...' }),
}));
