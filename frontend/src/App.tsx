import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import AnimalsMapPage from './pages/AnimalsMapPage';
import AnimalSearchPage from './pages/AnimalSearchPage';
import AnimalListPage from './pages/AnimalListPage';
import AnimalDetailPage from './pages/AnimalDetailPage';
import EditAnimalPage from './pages/EditAnimalPage';
import ReportAnimalPage from './pages/ReportAnimalPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CommunityLogsPage from './pages/CommunityLogsPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import VolunteerCareLogsPage from './pages/VolunteerCareLogsPage';
import TestPage from './pages/TestPage';
import { LoadScript } from '@react-google-maps/api';
import { useEffect, useState } from 'react';

function App() {
  const { isLoading, initialize, isAuthenticated } = useAuth();
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    initialize();
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('[App] Loading timeout reached, forcing render');
      setHasTimedOut(true);
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeout);
  }, [initialize]);

  console.log('[App] State:', { isLoading, isAuthenticated, hasTimedOut });

  // Show loading screen only if loading, not authenticated, and haven't timed out
  if (isLoading && !isAuthenticated && !hasTimedOut) {
    console.log('[App] Showing loading screen');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" alt="Kitten Loading" className="w-28 h-28 mb-6 rounded-lg shadow-lg" />
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        <span className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200">Loading StrayLove...</span>
      </div>
    );
  }

  console.log('[App] Rendering main app');

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API}>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<AnimalsMapPage />} />
          <Route path="/search" element={<AnimalSearchPage />} />
          <Route path="/animals" element={<AnimalListPage />} />
          <Route path="/animal/:id" element={<AnimalDetailPage />} />
          <Route path="/edit-animal/:id" element={<EditAnimalPage />} />
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportAnimalPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/community" 
            element={<CommunityLogsPage />} 
          />
          <Route 
            path="/admin/approvals" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminApprovalsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/volunteer/care-logs" 
            element={
              <ProtectedRoute requiredRole={["ADMIN", "VOLUNTEER"]}>
                <VolunteerCareLogsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/test" element={<TestPage />} />
        </Routes>
      </Layout>
    </LoadScript>
  );
}

export default App;
