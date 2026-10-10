
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { user, isLoading } = useAuth();

  // Ждём, пока AuthContext восстановит сессию.
  if (isLoading) {
    return (
      <div className="auth-loading">
        Проверяем авторизацию...
      </div>
    );
  }

  // Перенаправляем только после завершения проверки.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Если роль не подходит, отправляем в кабинет пользователя.
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }

    if (user.role === 'executor') {
      return <Navigate to="/executor" replace />;
    }

    if (user.role === 'customer') {
      return <Navigate to="/customer" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
