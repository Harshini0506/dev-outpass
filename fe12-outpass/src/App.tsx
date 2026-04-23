import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { Layout } from './components/Layout';
import { RequireRole } from './components/RequireRole';
import { Toaster } from './components/ui/sonner';
import Home from './pages/Home';
import GatePassForm from './pages/GatePassForm';
import StudentStatus from './pages/StudentStatus';
import MentorRequests from './pages/MentorRequests';
import SecurityScan from './pages/SecurityScan';
import HodPanel from './pages/HodPanel';
import ContactAdmin from './pages/ContactAdmin';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/apply"
            element={
              <RequireRole roles={['STUDENT']}>
                <GatePassForm />
              </RequireRole>
            }
          />
          <Route
            path="/student/status"
            element={
              <RequireRole roles={['STUDENT']}>
                <StudentStatus />
              </RequireRole>
            }
          />
          <Route
            path="/mentor"
            element={
              <RequireRole roles={['MENTOR']}>
                <MentorRequests />
              </RequireRole>
            }
          />
          <Route
            path="/security"
            element={
              <RequireRole roles={['SECURITY']}>
                <SecurityScan />
              </RequireRole>
            }
          />
          <Route
            path="/hod"
            element={
              <RequireRole roles={['HOD']}>
                <HodPanel />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={['HOD']}>
                <AdminPanel />
              </RequireRole>
            }
          />
          <Route path="/contact-admin" element={<ContactAdmin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
