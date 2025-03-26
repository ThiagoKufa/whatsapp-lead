import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  ExitToApp,
  AccountCircle,
  Notifications,
  Menu as MenuIcon,
  Person,
  Settings,
  DarkMode,
  LightMode,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTheme } from '../contexts/theme/useTheme';

export const HomePage = () => {
  const { user, logout } = useAuth();
  const { mode } = useTheme();
  const theme = useMuiTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Depuração para verificar se os dados do usuário estão corretos
  console.log('Dados do usuário na HomePage:', user);

  const handleLogout = async () => {
    await logout();
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Lista de contatos de exemplo
  const contacts = [
    { id: 1, name: 'Alice Silva', online: true, lastSeen: 'Agora', avatar: null },
    { id: 2, name: 'Bruno Costa', online: false, lastSeen: '10 min atrás', avatar: null },
    { id: 3, name: 'Carla Oliveira', online: true, lastSeen: 'Agora', avatar: null },
    { id: 4, name: 'Daniel Santos', online: false, lastSeen: '1 hora atrás', avatar: null },
    { id: 5, name: 'Eduarda Lima', online: true, lastSeen: 'Agora', avatar: null },
  ];

  const userInfo = (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Avatar
        sx={{
          width: 100,
          height: 100,
          mx: 'auto',
          mb: 2,
          bgcolor: theme.palette.primary.main,
          fontSize: '2.5rem',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        {user?.name ? getInitials(user.name) : 'U'}
      </Avatar>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        {user?.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        {user?.email}
      </Typography>

      <Button
        variant="outlined"
        color="error"
        startIcon={<ExitToApp />}
        onClick={handleLogout}
        sx={{ mt: 1 }}
      >
        Sair
      </Button>
    </Box>
  );

  const drawer = (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? drawerOpen : true}
      onClose={toggleDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar />
      {userInfo}
      <Divider sx={{ my: 2 }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Configurações" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              {mode === 'light' ? <DarkMode /> : <LightMode />}
            </ListItemIcon>
            <ListItemText primary={`Modo ${mode === 'light' ? 'escuro' : 'claro'}`} />
            <ThemeToggle size="small" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            WhatsApp Web
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {drawer}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: theme.palette.mode === 'light' 
            ? 'grey.50' 
            : 'grey.900',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            fontWeight="bold"
            sx={{ mt: 2, mb: 4 }}
          >
            Olá, {user?.name?.split(' ')[0]}!
          </Typography>

          <Paper 
            elevation={2} 
            sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Contatos recentes
            </Typography>
            <List>
              {contacts.map((contact) => (
                <Card 
                  key={contact.id} 
                  sx={{ 
                    mb: 1, 
                    borderRadius: 1,
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out',
                    },
                  }}
                >
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: contact.online 
                              ? theme.palette.success.main 
                              : theme.palette.grey[500]
                          }}
                        >
                          {getInitials(contact.name)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={contact.name} 
                        secondary={
                          <Box 
                            component="span" 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              color: contact.online 
                                ? theme.palette.success.main 
                                : theme.palette.text.secondary,
                            }}
                          >
                            <Box 
                              component="span" 
                              sx={{ 
                                display: 'inline-block',
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                mr: 0.5,
                                bgcolor: contact.online 
                                  ? theme.palette.success.main 
                                  : theme.palette.grey[500],
                              }} 
                            />
                            {contact.online ? 'Online' : contact.lastSeen}
                          </Box>
                        }
                      />
                      <Button 
                        variant="contained" 
                        size="small"
                        sx={{ 
                          minWidth: 0, 
                          borderRadius: 8,
                          px: 2,
                        }}
                      >
                        Conversar
                      </Button>
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}; 