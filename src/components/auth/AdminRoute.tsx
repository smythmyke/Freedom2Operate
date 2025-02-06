import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: JSX.Element;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
