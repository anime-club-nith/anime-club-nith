import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  bg: string;
  cardBg: string;
  text: string;
  subText: string;
  border: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  bg: '#f2f2f7',
  cardBg: '#ffffff',
  text: '#000000',
  subText: '#8e8e93',
  border: '#e5e5ea',
  accent: '#E56DB1',
  accentHover: '#f09dce',
  accentLight: '#fff0f8',
  shadow: '#c8c8c8',
};

export const darkColors: ThemeColors = {
  bg: '#000000',
  cardBg: '#1c1c1e',
  text: '#ffffff',
  subText: '#8e8e93',
  border: '#38383a',
  accent: '#E56DB1',
  accentHover: '#f09dce',
  accentLight: '#2d1a26',
  shadow: '#3a3a3c',
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeMode>(systemScheme === 'dark' ? 'dark' : 'light');
  const [hasManualPreference, setHasManualPreference] = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') {
          setTheme(storedTheme);
          setHasManualPreference(true);
        } else {
          setTheme(systemScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (e) {
        console.error('Failed to load theme from AsyncStorage', e);
      } finally {
        setThemeLoaded(true);
      }
    };
    loadTheme();
  }, [systemScheme]);

  // Sync with system theme updates if the user has not configured a manual preference
  useEffect(() => {
    if (!hasManualPreference) {
      setTheme(systemScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemScheme, hasManualPreference]);

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    setHasManualPreference(true);
    try {
      await AsyncStorage.setItem('theme', nextTheme);
    } catch (e) {
      console.error('Failed to save theme to AsyncStorage', e);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  if (!themeLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#000000' : '#f2f2f7', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#E56DB1" />
      </View>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
