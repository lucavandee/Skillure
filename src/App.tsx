import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RadarPage from './pages/RadarPage';
import DashboardPage from './pages/DashboardPage';
import PipelinePage from './pages/dashboard/PipelinePage';
import ImportPage from './pages/ImportPage';
import VacancyFormPage from './pages/VacancyFormPage';
import VacancyDetailPage from './pages/VacancyDetailPage';
import ProfilePage from './pages/ProfilePage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import AboutPage from './pages/AboutPage';
import GratisProefperiodePage from './pages/GratisProefperiodePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FAQPage from './pages/FAQPage';
import TechBranchPage from './pages/branches/TechBranchPage';
import HealthcareBranchPage from './pages/branches/HealthcareBranchPage';
import FinanceBranchPage from './pages/branches/FinanceBranchPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="gratis-proefperiode" element={<GratisProefperiodePage />} />
            <Route path="faq" element={<FAQPage />} />
            <Route path="vacature/:id" element={<VacancyDetailPage />} />
            <Route path="unauthorized" element={<UnauthorizedPage />} />
            <Route path="branches">
              <Route path="tech" element={<TechBranchPage />} />
              <Route path="healthcare" element={<HealthcareBranchPage />} />
              <Route path="finance" element={<FinanceBranchPage />} />
            </Route>
            
            {/* Protected Routes */}
            <Route path="search" element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="radar" element={
              <ProtectedRoute>
                <RadarPage />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="dashboard/pipeline" element={
              <ProtectedRoute>
                <PipelinePage />
              </ProtectedRoute>
            } />
            
            {/* Role-specific Protected Routes */}
            <Route path="import" element={
              <ProtectedRoute requiredRole="recruiter">
                <ImportPage />
              </ProtectedRoute>
            } />
            <Route path="vacancies/new" element={
              <ProtectedRoute requiredRole="recruiter">
                <VacancyFormPage />
              </ProtectedRoute>
            } />
            
            {/* Profile Routes */}
            <Route path="profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="profile/company" element={
              <ProtectedRoute>
                <CompanyProfilePage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;