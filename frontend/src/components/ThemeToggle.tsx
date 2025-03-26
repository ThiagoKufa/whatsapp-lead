import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '../contexts/theme';
import { useTheme as useMuiTheme } from '@mui/material/styles';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
}

export const ThemeToggle = ({ size = 'medium' }: ThemeToggleProps) => {
  const { mode, toggleColorMode } = useTheme();
  const theme = useMuiTheme();

  return (
    <Tooltip title={mode === 'light' ? 'Modo escuro' : 'Modo claro'}>
      <IconButton
        onClick={toggleColorMode}
        size={size}
        color="inherit"
        aria-label="alternar tema"
        sx={{
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'rotate(30deg)',
          },
        }}
      >
        {mode === 'light' ? (
          <Brightness4Icon
            sx={{
              color: theme.palette.text.primary,
            }}
          />
        ) : (
          <Brightness7Icon
            sx={{
              color: theme.palette.text.primary,
            }}
          />
        )}
      </IconButton>
    </Tooltip>
  );
}; 