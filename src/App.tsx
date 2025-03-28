import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from './config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect } from 'react';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Quests from './pages/Quests';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const THEME_COLORS = [
  { name: 'Emerald', value: '#4ADE80', hoverValue: '#22C55E' },
  { name: 'Purple', value: '#A855F7', hoverValue: '#9333EA' },
  { name: 'Gold', value: '#F59E0B', hoverValue: '#D97706' },
  { name: 'Blue', value: '#3B82F6', hoverValue: '#2563EB' },
  { name: 'Rose', value: '#F43F5E', hoverValue: '#E11D48' },
  { name: 'Cyan', value: '#06B6D4', hoverValue: '#0891B2' }
];

const applyThemeColor = (color: string, borderColor?: string, showBorders?: boolean) => {
  const root = document.documentElement;
  const theme = THEME_COLORS.find(t => t.value === color);
  if (!theme) return;

  // Set CSS variables
  root.style.setProperty('--color-primary', theme.value);
  root.style.setProperty('--color-primary-hover', theme.hoverValue);
  root.style.setProperty('--color-border', borderColor || theme.value);
  
  // Update button styles
  const style = document.createElement('style');
  style.textContent = `
    .btn-primary {
      background-color: ${theme.value};
    }
    .btn-primary:hover {
      background-color: ${theme.hoverValue};
    }
    .text-primary {
      color: ${theme.value};
    }
    .bg-primary {
      background-color: ${theme.value};
    }
    .border-primary {
      border-color: ${borderColor || theme.value} !important;
    }
    .card {
      border: ${showBorders ? `2px solid ${borderColor || theme.value}` : 'none'} !important;
    }
    .panel {
      border: ${showBorders ? `2px solid ${borderColor || theme.value}` : 'none'} !important;
    }
    .section {
      border: ${showBorders ? `2px solid ${borderColor || theme.value}` : 'none'} !important;
    }
  `;
  
  // Remove any previous dynamic styles
  const existingStyle = document.getElementById('theme-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  style.id = 'theme-styles';
  document.head.appendChild(style);
};

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [user, loading] = useAuthState(auth);

  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        applyThemeColor(
          data.themeColor || THEME_COLORS[0].value,
          data.borderColor,
          data.showBorders ?? true
        );
      }
    };
    loadUserTheme();
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="quests" element={<Quests />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
