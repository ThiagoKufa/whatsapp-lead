import { useContext } from 'react';
import { ThemeContext, ThemeContextType } from './ThemeProvider';

// Hook para uso do contexto
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}; 