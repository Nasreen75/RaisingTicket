import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import RaiseComplaint from './pages/RaiseComplaint';
import MyComplaints from './pages/MyComplaints';
import AdminComplaints from './pages/AdminComplaints';
import Unauthorized from './pages/Unauthorized';
import ComplaintDetail from './pages/ComplaintDetail';
import DepartmentComplaints from './pages/DepartmentComplaints';
import FAQ from './pages/FAQ';
import Reports from './pages/Reports';
import Chatbot from './components/Chatbot';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/raise-complaint"
            element={
              <ProtectedRoute>
                <RaiseComplaint />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-complaints"
            element={
              <ProtectedRoute>
                <MyComplaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-complaints"
            element={
              <ProtectedRoute>
                <DepartmentComplaints />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hod']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['admin', 'hod']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />


        </Routes>
        <Chatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;