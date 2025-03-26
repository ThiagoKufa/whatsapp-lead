import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Container,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tab,
  Tabs,
  useTheme,
  Avatar,
  AppBar,
  Toolbar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ExitToApp as LogoutIcon,
  Email as EmailIcon,
  VpnKey as KeyIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Login as LoginIcon,
  AppRegistration as RegisterIcon,
  Timer as TimerIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para o teste de autenticação
interface TestLog {
  action: string;
  status: 'success' | 'error' | 'info';
  timestamp: Date;
  message: string;
}

// Componente estilizado para o container de log
const LogContainer = styled(Paper)(({ theme }) => ({
  height: '300px',
  overflowY: 'auto',
  padding: theme.spacing(2),
  background: theme.palette.mode === 'dark' 
    ? '#1a2027' 
    : '#f5f5f5',
  border: `1px solid ${theme.palette.divider}`,
}));

// Componente para exibir uma entrada de log formatada
const LogEntry = ({ log }: { log: TestLog }) => {
  const theme = useTheme();
  
  const getStatusColor = () => {
    switch (log.status) {
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      case 'info':
        return theme.palette.info.main;
      default:
        return theme.palette.text.primary;
    }
  };

  const getStatusIcon = () => {
    switch (log.status) {
      case 'success':
        return <CheckIcon fontSize="small" />;
      case 'error':
        return <ErrorIcon fontSize="small" />;
      case 'info':
        return <InfoIcon fontSize="small" />;
      default:
        return null;
    }
  };

  return (
    <Box 
      sx={{ 
        mb: 1, 
        p: 1, 
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      <Avatar 
        sx={{ 
          width: 24, 
          height: 24, 
          bgcolor: getStatusColor(),
          mr: 1,
        }}
      >
        {getStatusIcon()}
      </Avatar>
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {log.action}
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            {format(log.timestamp, 'HH:mm:ss', { locale: ptBR })}
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {log.message}
        </Typography>
      </Box>
    </Box>
  );
};

// Componente para formulário de teste de login
const LoginTestForm = ({ onTest }: { onTest: (email: string, password: string) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onTest(email, password);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
        }}
        required
      />
      <TextField
        fullWidth
        label="Senha"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          ),
        }}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
        sx={{ mt: 2 }}
      >
        Testar Login
      </Button>
    </Box>
  );
};

// Componente para formulário de teste de registro
const RegisterTestForm = ({ onTest }: { onTest: (name: string, email: string, password: string) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }
    setError('');
    setLoading(true);
    onTest(name, email, password);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        fullWidth
        label="Nome"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
        }}
        required
      />
      <TextField
        fullWidth
        label="Email"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
        }}
        required
      />
      <TextField
        fullWidth
        label="Senha"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
        InputProps={{
          startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
            </IconButton>
          ),
        }}
        required
      />
      <TextField
        fullWidth
        label="Confirmar Senha"
        variant="outlined"
        type={showPassword ? 'text' : 'password'}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        margin="normal"
        error={password !== confirmPassword && confirmPassword !== ''}
        helperText={
          password !== confirmPassword && confirmPassword !== ''
            ? 'As senhas não conferem'
            : ''
        }
        InputProps={{
          startAdornment: <KeyIcon color="action" sx={{ mr: 1 }} />,
        }}
        required
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
        sx={{ mt: 2 }}
      >
        Testar Registro
      </Button>
    </Box>
  );
};

// Dashboard principal para testes de autenticação
export const AuthTestDashboard = () => {
  const theme = useTheme();
  const { login, register, logout, isAuthenticated, user, token, refreshToken, expiresIn } = useAuth();
  const [logs, setLogs] = useState<TestLog[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });
  const [activeTab, setActiveTab] = useState(0);

  // Adicionar uma entrada de log
  const addLog = (log: TestLog) => {
    setLogs(prev => [log, ...prev]);
  };

  // Limpar logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Mostrar snackbar
  const showSnackbar = (message: string, severity: 'info' | 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fechar snackbar
  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Testar login
  const handleLoginTest = async (email: string, password: string) => {
    try {
      addLog({
        action: 'TENTATIVA DE LOGIN',
        status: 'info',
        timestamp: new Date(),
        message: `Tentando login com email: ${email}`,
      });

      await login({ email, password });

      addLog({
        action: 'LOGIN BEM-SUCEDIDO',
        status: 'success',
        timestamp: new Date(),
        message: 'Autenticação realizada com sucesso.',
      });

      showSnackbar('Login realizado com sucesso!', 'success');
    } catch (error) {
      addLog({
        action: 'ERRO DE LOGIN',
        status: 'error',
        timestamp: new Date(),
        message: `Falha na autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      showSnackbar('Falha ao realizar login.', 'error');
    }
  };

  // Testar registro
  const handleRegisterTest = async (name: string, email: string, password: string) => {
    try {
      addLog({
        action: 'TENTATIVA DE REGISTRO',
        status: 'info',
        timestamp: new Date(),
        message: `Tentando registrar com email: ${email} e nome: ${name}`,
      });

      await register({ name, email, password });

      addLog({
        action: 'REGISTRO BEM-SUCEDIDO',
        status: 'success',
        timestamp: new Date(),
        message: 'Usuário registrado com sucesso.',
      });

      showSnackbar('Registro realizado com sucesso!', 'success');
    } catch (error) {
      addLog({
        action: 'ERRO DE REGISTRO',
        status: 'error',
        timestamp: new Date(),
        message: `Falha no registro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      showSnackbar('Falha ao realizar registro.', 'error');
    }
  };

  // Testar logout
  const handleLogoutTest = async () => {
    try {
      addLog({
        action: 'TENTATIVA DE LOGOUT',
        status: 'info',
        timestamp: new Date(),
        message: 'Tentando realizar logout...',
      });

      await logout();

      addLog({
        action: 'LOGOUT BEM-SUCEDIDO',
        status: 'success',
        timestamp: new Date(),
        message: 'Sessão encerrada com sucesso.',
      });

      showSnackbar('Logout realizado com sucesso!', 'success');
    } catch (error) {
      addLog({
        action: 'ERRO DE LOGOUT',
        status: 'error',
        timestamp: new Date(),
        message: `Falha ao realizar logout: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });

      showSnackbar('Falha ao realizar logout.', 'error');
    }
  };

  // Componente para exibir informações do token
  const TokenInfo = () => {
    if (!token) return <Typography color="text.secondary">Nenhum token disponível</Typography>;

    // Função para formatar a data de expiração
    const formatExpiry = () => {
      if (!expiresIn) return 'Desconhecido';
      
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);
      
      return format(expiryDate, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    };

    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Informações do Token
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Token de Acesso:</Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '#f5f5f5',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  mb: 2,
                  maxHeight: '60px',
                  overflow: 'auto',
                }}
              >
                {token}
              </Box>
              
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Token de Atualização:</Typography>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  backgroundColor: theme.palette.mode === 'dark' ? '#1a2027' : '#f5f5f5',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  mb: 2,
                  maxHeight: '60px',
                  overflow: 'auto',
                }}
              >
                {refreshToken || 'Nenhum refresh token disponível'}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TimerIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                <Typography variant="subtitle2">
                  Expira em: {formatExpiry()}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <AppBar position="static" color="primary" elevation={3}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Dashboard de Teste de Autenticação
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              label={isAuthenticated ? 'Autenticado' : 'Não Autenticado'} 
              color={isAuthenticated ? 'success' : 'error'}
              variant="outlined"
              sx={{ mr: 2, fontWeight: 'bold' }}
            />
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Painel de Status */}
          <Grid item xs={12}>
            <Paper 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(to right, #1a2027, #2c3e50)'
                  : 'linear-gradient(to right, #e0e0e0, #f5f5f5)'
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    Status da Autenticação
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {isAuthenticated 
                      ? 'Você está autenticado e pode testar as funcionalidades.'
                      : 'Você não está autenticado. Faça login para testar todas as funcionalidades.'}
                  </Typography>
                  {isAuthenticated && user && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {user.name || 'Usuário'}
                        </Typography>
                        <Typography variant="body2">
                          {user.email || 'email@exemplo.com'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {isAuthenticated ? (
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogoutTest}
                      sx={{ minWidth: 150 }}
                    >
                      Fazer Logout
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Use os formulários abaixo para testar a autenticação
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Área de Testes */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2, 
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader
                title="Testar Autenticação"
                titleTypographyProps={{ variant: 'h6' }}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, newValue) => setActiveTab(newValue)}
                  variant="fullWidth"
                  sx={{ mb: 2 }}
                >
                  <Tab label="Login" icon={<LoginIcon />} iconPosition="start" />
                  <Tab label="Registro" icon={<RegisterIcon />} iconPosition="start" />
                </Tabs>

                {activeTab === 0 && (
                  <LoginTestForm onTest={handleLoginTest} />
                )}

                {activeTab === 1 && (
                  <RegisterTestForm onTest={handleRegisterTest} />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Área de Logs */}
          <Grid item xs={12} md={6}>
            <Card sx={{ 
              borderRadius: 2,
              boxShadow: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <CardHeader
                title="Logs de Eventos"
                titleTypographyProps={{ variant: 'h6' }}
                action={
                  <Button
                    variant="text"
                    color="inherit"
                    size="small"
                    onClick={clearLogs}
                  >
                    Limpar
                  </Button>
                }
                sx={{
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                }}
              />
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <LogContainer>
                  {logs.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%' 
                    }}>
                      <Typography color="text.secondary">
                        Nenhum evento registrado
                      </Typography>
                    </Box>
                  ) : (
                    logs.map((log, index) => (
                      <LogEntry key={index} log={log} />
                    ))
                  )}
                </LogContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Área de Informações do Token */}
          {isAuthenticated && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                <CardHeader
                  title="Informações da Sessão"
                  titleTypographyProps={{ variant: 'h6' }}
                  sx={{
                    backgroundColor: theme.palette.info.main,
                    color: theme.palette.info.contrastText,
                  }}
                />
                <CardContent>
                  <TokenInfo />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 