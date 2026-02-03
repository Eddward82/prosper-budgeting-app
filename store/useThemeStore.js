import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useThemeStore = create((set, get) => ({
  isDarkMode: false,

  initializeTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        set({ isDarkMode: savedTheme === 'true' });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },

  toggleDarkMode: async () => {
    try {
      const newValue = !get().isDarkMode;
      await AsyncStorage.setItem('isDarkMode', newValue.toString());
      set({ isDarkMode: newValue });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },

  setDarkMode: async (value) => {
    try {
      await AsyncStorage.setItem('isDarkMode', value.toString());
      set({ isDarkMode: value });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }
}));

export default useThemeStore;
