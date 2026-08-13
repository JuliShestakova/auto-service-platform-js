import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import CreateOrderPage from './pages/CreateOrderPage';
import ExecutorsPage from './pages/ExecutorsPage';
import ExecutorDetailsPage from './pages/ExecutorDetailsPage';
import ExecutorDashboardPage from './pages/ExecutorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MapPage from './pages/MapPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Главная */}
          <Route path="/" element={<HomePage />} />

          {/* Авторизация */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Заказчик */}
          <Route path="/customer" element={<CustomerDashboardPage />} />
          <Route
            path="/customer/orders/new"
            element={<CreateOrderPage />}
          />

          {/* Автосервисы */}
          <Route path="/executors" element={<ExecutorsPage />} />
          <Route
            path="/executors/:id"
            element={<ExecutorDetailsPage />}
          />

          {/* Карта */}
          <Route path="/map" element={<MapPage />} />

          {/* Исполнитель */}
          <Route
            path="/executor"
            element={<ExecutorDashboardPage />}
          />

          {/* Администратор */}
          <Route
            path="/admin"
            element={<AdminDashboardPage />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;