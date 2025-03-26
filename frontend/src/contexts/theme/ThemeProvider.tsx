import { createContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import { getDesignTokens } from './themeTokens';

// Tipo do contexto
export type ThemeContextType = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

// Criando o contexto
export const ThemeContext = createContext<ThemeContextType | null>(null);

// Provedor do tema
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Verificar se há uma preferência salva
  const savedMode = localStorage.getItem('themeMode') as PaletteMode | null;
  
  // Estado para controlar o modo do tema
  const [mode, setMode] = useState<PaletteMode>(savedMode || 'light');

  // Alternar entre modos claro e escuro
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // Ouvir por mudanças na preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Se não há preferência salva, usar a do sistema
    if (!localStorage.getItem('themeMode')) {
      setMode(mediaQuery.matches ? 'dark' : 'light');
    }
    
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Gerar o tema de acordo com o modo
  const theme = responsiveFontSizes(createTheme(getDesignTokens(mode)));

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}; 