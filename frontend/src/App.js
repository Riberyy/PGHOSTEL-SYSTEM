import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

// Auth
import Login    from './pages/Login';
import Register from './pages/Register';

// Student
import StudentLayout     from './components/student/StudentLayout';
import StudentDashboard  from './pages/student/Dashboard';
import SearchProperties  from './pages/student/SearchProperties';
import PropertyDetail    from './pages/student/PropertyDetail';
import MyBookings        from './pages/student/MyBookings';
import MyPayments        from './pages/student/MyPayments';
import MyComplaints      from './pages/student/MyComplaints';
import Wishlist          from './pages/student/Wishlist';
import StudentProfile    from './pages/student/Profile';

// Owner
import OwnerLayout       from './components/owner/OwnerLayout';
import OwnerDashboard    from './pages/owner/Dashboard';
import MyProperties      from './pages/owner/MyProperties';
import AddProperty       from './pages/owner/AddProperty';
import EditProperty      from './pages/owner/EditProperty';
import OwnerBookings     from './pages/owner/OwnerBookings';
import OwnerPayments     from './pages/owner/OwnerPayments';
import OwnerComplaints   from './pages/owner/OwnerComplaints';

// Admin
import AdminLayout       from './components/admin/AdminLayout';
import AdminDashboard    from './pages/admin/Dashboard';
import ManageUsers       from './pages/admin/ManageUsers';
import ManageProperties  from './pages/admin/ManageProperties';
import AdminBookings     from './pages/admin/AdminBookings';
import AdminComplaints   from './pages/admin/AdminComplaints';

// ─── Guards ────────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner-wrap"><div className="spinner"/></div>;
  if (user) {
    if (user.role === 'admin')   return <Navigate to="/admin" replace />;
    if (user.role === 'owner')   return <Navigate to="/owner" replace />;
    return <Navigate to="/student" replace />;
  }
  return children;
};

// ─── App ───────────────────────────────────────────────────────────────────
const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Auth */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Student */}
        <Route path="/student" element={<PrivateRoute roles={['student']}><StudentLayout /></PrivateRoute>}>
          <Route index              element={<StudentDashboard />} />
          <Route path="search"      element={<SearchProperties />} />
          <Route path="property/:id" element={<PropertyDetail />} />
          <Route path="bookings"    element={<MyBookings />} />
          <Route path="payments"    element={<MyPayments />} />
          <Route path="complaints"  element={<MyComplaints />} />
          <Route path="wishlist"    element={<Wishlist />} />
          <Route path="profile"     element={<StudentProfile />} />
        </Route>

        {/* Owner */}
        <Route path="/owner" element={<PrivateRoute roles={['owner']}><OwnerLayout /></PrivateRoute>}>
          <Route index               element={<OwnerDashboard />} />
          <Route path="properties"   element={<MyProperties />} />
          <Route path="properties/add" element={<AddProperty />} />
          <Route path="properties/edit/:id" element={<EditProperty />} />
          <Route path="bookings"     element={<OwnerBookings />} />
          <Route path="payments"     element={<OwnerPayments />} />
          <Route path="complaints"   element={<OwnerComplaints />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminLayout /></PrivateRoute>}>
          <Route index                element={<AdminDashboard />} />
          <Route path="users"         element={<ManageUsers />} />
          <Route path="properties"    element={<ManageProperties />} />
          <Route path="bookings"      element={<AdminBookings />} />
          <Route path="complaints"    element={<AdminComplaints />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
