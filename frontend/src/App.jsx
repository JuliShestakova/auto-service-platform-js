import { useEffect, useState } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { CityProvider, useCity } from './contexts/CityContext';
import { LocationProvider } from './contexts/LocationContext';
import { DEFAULT_CITY } from './data/cities';
import MapPage from './pages/MapPage';

function CitySearchRedirect() {
  const { city } = useCity();
  return (
    <Navigate
      to={`/search?city=${encodeURIComponent(city || DEFAULT_CITY)}`}
      replace
    />
  );
}

import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import CustomerDashboardPage from './pages/CustomerDashboardPage';

import ExecutorDetailsPage from './pages/ExecutorDetailsPage';

import ExecutorDashboardPage from './pages/ExecutorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import ProtectedRoute from './contexts/ProtectedRoute';


function App() {
  const [authModal, setAuthModal] = useState(null);
  const [registerRole, setRegisterRole] = useState('customer');


  /* =====================================================
     АВТОРИЗАЦИЯ
     ===================================================== */

  const openLogin = () => {
    setAuthModal('login');
  };


  const openRegister = (role = 'customer') => {
    setRegisterRole(role === 'executor' ? 'executor' : 'customer');
    setAuthModal('register');
  };


  const closeAuth = () => {
    setAuthModal(null);
  };


  /* =====================================================
     ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ПО ESC
     ===================================================== */

  useEffect(() => {
    if (!authModal) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeAuth();
      }
    };

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );

      document.body.style.overflow = '';
    };
  }, [authModal]);


  return (
    <AuthProvider>
      <CityProvider>
      <LocationProvider>

      <BrowserRouter>

        <Routes>


          {/* =====================================================
              ГЛАВНАЯ СТРАНИЦА
              ===================================================== */}

          <Route
            path="/search"
            element={
              <SearchPage
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />

          <Route
            path="/"
            element={
              <HomePage
                section="overview"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          {/* =====================================================
              КАБИНЕТ ЗАКАЗЧИКА
              ДОСТУП ТОЛЬКО ДЛЯ CUSTOMER
              ===================================================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={['customer']}
              />
            }
          >

            <Route
              path="/customer"
              element={<CustomerDashboardPage section="overview" />}
            />

            <Route
              path="/customer/settings"
              element={<CustomerDashboardPage section="settings" />}
            />

          </Route>


          {/* =====================================================
              СТАРЫЕ АДРЕСА ЗАКАЗЧИКА
              ===================================================== */}

          <Route
            path="/customer/bookings"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/customer/requests"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/orders"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/customer/orders"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/customer/orders/new"
            element={
              <Navigate
                to="/search"
                replace
              />
            }
          />

          <Route
            path="/requests"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/garage"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/customer/garage"
            element={
              <Navigate
                to="/customer"
                replace
              />
            }
          />

          <Route
            path="/settings"
            element={
              <Navigate
                to="/customer/settings"
                replace
              />
            }
          />


          {/* =====================================================
              АВТОРИЗАЦИЯ
              ===================================================== */}

          <Route
            path="/login"
            element={
              <LoginPage />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage />
            }
          />


          {/* =====================================================
              АВТОСЕРВИСЫ
              ПУБЛИЧНЫЕ СТРАНИЦЫ
              ===================================================== */}

          <Route
            path="/executors"
            element={<CitySearchRedirect />}
          />

          <Route
            path="/executors/:id"
            element={
              <ExecutorDetailsPage />
            }
          />


          {/* =====================================================
              КАРТА
              ===================================================== */}

          <Route
            path="/map"
            element={
              <MapPage
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          {/* =====================================================
              КАБИНЕТ ИСПОЛНИТЕЛЯ
              ДОСТУП ТОЛЬКО ДЛЯ EXECUTOR
              ===================================================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={['executor']}
              />
            }
          >

            <Route
              path="/executor/*"
              element={
                <ExecutorDashboardPage />
              }
            />

          </Route>


          {/* =====================================================
              КАБИНЕТ АДМИНИСТРАТОРА
              ДОСТУП ТОЛЬКО ДЛЯ ADMIN
              ===================================================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={['admin']}
              />
            }
          >

            <Route
              path="/admin/*"
              element={
                <AdminDashboardPage />
              }
            />

          </Route>


          {/* =====================================================
              НЕИЗВЕСТНЫЙ АДРЕС
              ===================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>


        {/* =====================================================
            МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ
            ===================================================== */}

        {authModal && (

          <div
            className="auth-modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeAuth();
              }
            }}
          >

            <div
              className="auth-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
            >

              <button
                type="button"
                className="auth-modal-close"
                onClick={closeAuth}
                aria-label="Закрыть"
              >
                ×
              </button>


              {authModal === 'login' ? (

                <LoginPage
                  isModal
                  onClose={closeAuth}
                  onSwitchToRegister={openRegister}
                />

              ) : (

                <RegisterPage
                  isModal
                  initialRole={registerRole}
                  onClose={closeAuth}
                  onSwitchToLogin={openLogin}
                />

              )}

            </div>

          </div>

        )}

      </BrowserRouter>

      </LocationProvider>
      </CityProvider>
    </AuthProvider>
  );
}


export default App;