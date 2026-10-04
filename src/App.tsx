import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Payments from './pages/Payments';
import Receipts from './pages/Receipts';
import Incidents from './pages/Incidents';
import Documents from './pages/Documents';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import './styles/tenant.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('tenant_token');
  const userStr = localStorage.getItem('tenant_user');

  if (!token || !userStr) {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (!user || !user.role || !['tenant', 'admin', 'manager', 'owner', 'super_admin'].includes(user.role)) {
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_user');
      return <Navigate to="/login" replace />;
    }
  } catch {
    localStorage.removeItem('tenant_token');
    localStorage.removeItem('tenant_user');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/receipts" element={<Receipts />} />
                  <Route path="/incidents" element={<Incidents />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
