import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import SubmissionForm from './components/SubmissionForm';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import TechnicalExpertisePage from './components/TechnicalExpertisePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h1: { color: '#1a237e' },
    h2: { color: '#1a237e' },
    h3: { color: '#1a237e' },
    h4: { color: '#1a237e' },
    h5: { color: '#1a237e' },
    h6: { color: '#1a237e' },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <SubmissionForm />
                  </ProtectedRoute>
                } 
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/expertise" element={<TechnicalExpertisePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Container>
          <Footer />
        </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
