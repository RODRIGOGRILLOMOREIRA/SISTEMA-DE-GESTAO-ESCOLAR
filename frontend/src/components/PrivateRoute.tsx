import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isAuthenticated, token } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log para debug
    console.log('PrivateRoute check:', {
      isAuthenticated,
      hasToken: !!token,
      path: location.pathname
    });
  }, [isAuthenticated, token, location.pathname]);

  // Verificar se está autenticado
  if (!isAuthenticated || !token) {
    console.warn('PrivateRoute: Não autenticado, redirecionando para /login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
