import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');
  if (token) {
      return <Outlet />;
  }
  // If not authenticated, redirect to login
  return <Navigate to="/login" />;
}
