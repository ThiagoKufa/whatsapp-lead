import { PaletteMode } from '@mui/material';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';
// Paletas de cores para os modos claro e escuro
const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Paleta para modo claro
          primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
            contrastText: '#fff',
          },
          background: {
            default: '#fafafa',
            paper: '#fff',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Paleta para modo escuro
          primary: {
            main: '#757de8',
            light: '#a4adff',
            dark: '#4251b5',
            contrastText: '#fff',
          },
          secondary: {
            main: '#ff4081',
            light: '#ff79b0',
            dark: '#c60055',
            contrastText: '#fff',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }),
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none' as TextTransform,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          boxShadow: mode === 'light' ? '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)' : 'none',
          transition: 'all 0.15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: mode === 'light' ? '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)' : 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            transition: 'all 0.15s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
            : '0 4px 6px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.25)',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)'
            : '0 4px 6px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.25)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)'
            : '0 7px 14px rgba(0, 0, 0, 0.25), 0 3px 6px rgba(0, 0, 0, 0.22)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Criando temas responsivos para modos claro e escuro
export const getAppTheme = (mode: PaletteMode) => {
  let theme = createTheme(getDesignTokens(mode));
  theme = responsiveFontSizes(theme);
  return theme;
};

// Tema padrão (modo claro)
const theme = getAppTheme('light');
export default theme; 