import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import Spinner from '../components/ui/Spinner';

// Layouts
import Sidebar from '../layouts/Sidebar';
import TopBar from '../layouts/TopBar';
import BottomNav from '../layouts/BottomNav';

// Pages - Lazy loaded for better performance
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ApprovalsList = lazy(() => import('../features/approvals/ApprovalsList'));
const MembersPage = lazy(() => import('../features/members/MembersPage'));
const EmployeesPage = lazy(() => import('../features/employees/EmployeesPage'));
const SurveyFormPage = lazy(() => import('../features/survey/SurveyFormPage'));
const SurveyDashboardPage = lazy(() => import('../features/survey/SurveyDashboardPage'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'));
const CareerPage = lazy(() => import('../features/career/CareerPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const EditRequestsPage = lazy(() => import('../features/members/EditRequestsPage'));
const StaffProfilePage = lazy(() => import('../pages/StaffProfilePage'));
const Login = lazy(() => import('../features/auth/Login'));
const ForceReset = lazy(() => import('../features/auth/ForceReset'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const NotificationCenter = lazy(() => import('../features/system/NotificationCenter'));
const PaymentLogs = lazy(() => import('../features/system/PaymentLogs'));
const DebugPage = lazy(() => import('../pages/DebugPage'));
const PaymentApiPage = lazy(() => import('../pages/PaymentApiPage'));

const AdminLayout = ({ children }) => (
  <div className="admin-root">
    <Sidebar />
    <div className="admin-main">
      <TopBar />
      <main className="page-content">
        {children}
      </main>
      <BottomNav />
    </div>
  </div>
);

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<div className="loading-screen"><Spinner size={40} /></div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Force password reset if it's the first login
  if (user?.firstLogin) {
    return (
      <Suspense fallback={<div className="loading-screen"><Spinner size={40} /></div>}>
        <Routes>
          <Route path="*" element={<ForceReset />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AdminLayout>
      <Suspense fallback={<div className="loading-screen"><Spinner size={40} /></div>}>
        <Routes>
          {/* Owner only route, otherwise redirect to survey */}
          <Route 
            path="/" 
            element={user?.role === 'owner' ? <DashboardPage /> : <Navigate to="/survey" replace />} 
          />
          
          <Route path="/approvals" element={<ApprovalsList />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/employees" element={<EmployeesPage />} />
          <Route path="/survey" element={<SurveyFormPage />} />
          <Route path="/survey-results" element={<SurveyDashboardPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/career" element={<CareerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/requests" element={<EditRequestsPage />} />
          <Route path="/profile" element={<StaffProfilePage />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/payment-logs" element={<PaymentLogs />} />
          <Route path="/logs" element={<DebugPage />} />
          <Route path="/payment-api" element={<PaymentApiPage />} />
          
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </AdminLayout>
  );
};

export default AppRoutes;
