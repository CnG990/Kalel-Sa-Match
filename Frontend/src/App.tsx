import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import TerrainLayout from './components/TerrainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import HomePage from './pages/HomePage';
import TerrainsReservationPage from './pages/TerrainsReservationPage';
import TerrainDetailPage from './pages/TerrainDetailPage';
import TerrainInfoPage from './pages/TerrainInfoPage';
import ReservationPage from './pages/ReservationPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterClientPage from './pages/RegisterClientPage';
import RegisterManagerPage from './pages/RegisterManagerPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import PaymentPage from './pages/PaymentPage';
import AbonnementsPage from './pages/AbonnementsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Dashboard Pages (Client uniquement)
import DashboardLayout from './pages/dashboard/DashboardLayout';
import ProfilePage from './pages/dashboard/ProfilePage';
import ReservationsPage from './pages/dashboard/ReservationsPage';
import MapPage from './pages/dashboard/MapPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import SettingsPage from './pages/dashboard/SettingsPage';

// Manager Pages (Gestionnaire)
import ManagerLayout from './pages/manager/ManagerLayout';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerTerrainsPage from './pages/manager/TerrainsPage';
import AddTerrainPage from './pages/manager/AddTerrainPage';
import ManagerReservationsPage from './pages/manager/ReservationsPage';
import PromotionsPage from './pages/manager/PromotionsPage';
import ManagerRevenuePage from './pages/manager/RevenuePage';
import ManagerProfilePage from './pages/manager/ProfilePage';
import ManagerSettingsPage from './pages/manager/SettingsPage';
import QrScannerPage from './pages/manager/QrScannerPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerValidationPage from './pages/admin/ManagerValidationPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageTerrainsPage from './pages/admin/ManageTerrainsPage';
import FinancesPage from './pages/admin/FinancesPage';
import DisputesPage from './pages/admin/DisputesPage';
import SupportPage from './pages/admin/SupportPage';
import CommissionsPage from './pages/admin/CommissionsPage';
import AdminReservationsPage from './pages/admin/ReservationsPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminSettingsPage from './pages/admin/SettingsPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import LogsPage from './pages/admin/LogsPage';
import GeoImportPage from './pages/admin/GeoImportPage';

// Test page
import AdminTestPage from './pages/AdminTestPage';

// Composant de redirection intelligente
const SmartRedirect = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

      if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Redirection selon le rôle après connexion
  if (user && location.pathname === '/') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'gestionnaire') return <Navigate to="/manager" replace />;
    if (user.role === 'client') return <Navigate to="/dashboard" replace />;
  }

  // Redirection depuis /dashboard selon le rôle
  if (user && location.pathname === '/dashboard') {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'gestionnaire') return <Navigate to="/manager" replace />;
  }

  return <HomePage />;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<SmartRedirect />} />
            <Route path="terrains-reservation" element={<TerrainsReservationPage />} />
            <Route path="terrains/:id" element={<TerrainDetailPage />} />
            <Route path="terrain/:id" element={<TerrainInfoPage />} />
            <Route path="reservation/:terrainId" element={<ReservationPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="register/client" element={<RegisterClientPage />} />
            <Route path="register/manager" element={<RegisterManagerPage />} />
            <Route path="register-client" element={<RegisterClientPage />} />
            <Route path="register-manager" element={<RegisterManagerPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="payment" element={<PaymentPage />} />
            <Route path="admin-test" element={<AdminTestPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* Dashboard Routes (Client uniquement) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Routes Users - Accès libre aux terrains */}
          <Route 
            path="/users" 
            element={<TerrainLayout />}
          >
            <Route path="terrain/:id" element={<TerrainDetailPage />} />
            <Route path="abonnements" element={<AbonnementsPage />} />
            <Route path="abonnements/:terrainId" element={<AbonnementsPage />} />
          </Route>

          {/* Manager Routes (Gestionnaire) */}
          <Route 
            path="/manager" 
            element={
              <ProtectedRoute allowedRoles={['gestionnaire']}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="terrains" element={<ManagerTerrainsPage />} />
            <Route path="add-terrain" element={<AddTerrainPage />} />
            <Route path="reservations" element={<ManagerReservationsPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="revenue" element={<ManagerRevenuePage />} />
            <Route path="profile" element={<ManagerProfilePage />} />
            <Route path="settings" element={<ManagerSettingsPage />} />
            <Route path="qr-scanner" element={<QrScannerPage />} />
          </Route>

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="validate-managers" element={<ManagerValidationPage />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="terrains" element={<ManageTerrainsPage />} />
            <Route path="finances" element={<FinancesPage />} />
            <Route path="disputes" element={<DisputesPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="commissions" element={<CommissionsPage />} />
            <Route path="reservations" element={<AdminReservationsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="geo-import" element={<GeoImportPage />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
              <h1 className="text-6xl font-bold text-orange-500">404</h1>
              <p className="text-xl text-gray-700 mt-4">Page non trouvée</p>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
