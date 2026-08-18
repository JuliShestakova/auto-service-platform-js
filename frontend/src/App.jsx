import { useEffect, useState } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import CreateOrderPage from './pages/CreateOrderPage';

import ExecutorsPage from './pages/ExecutorsPage';
import ExecutorDetailsPage from './pages/ExecutorDetailsPage';

import MapPage from './pages/MapPage';

import ExecutorDashboardPage from './pages/ExecutorDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


function App() {
  const [authModal, setAuthModal] = useState(null);


  /* =====================================================
     АВТОРИЗАЦИЯ
  ===================================================== */

  const openLogin = () => {
    setAuthModal('login');
  };


  const openRegister = () => {
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

      <BrowserRouter>

        <Routes>


          {/* =====================================================
              ГЛАВНАЯ СТРАНИЦА
          ===================================================== */}

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
          ===================================================== */}

          <Route
            path="/customer"
            element={
              <HomePage
                section="overview"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          <Route
            path="/customer/orders"
            element={
              <HomePage
                section="orders"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          <Route
            path="/customer/requests"
            element={
              <HomePage
                section="requests"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          <Route
            path="/customer/garage"
            element={
              <HomePage
                section="garage"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          <Route
            path="/customer/settings"
            element={
              <HomePage
                section="settings"
                onLogin={openLogin}
                onRegister={openRegister}
              />
            }
          />


          {/* =====================================================
              СТАРЫЕ АДРЕСА ЗАКАЗЧИКА
          ===================================================== */}

          <Route
            path="/orders"
            element={
              <Navigate
                to="/customer/orders"
                replace
              />
            }
          />


          <Route
            path="/requests"
            element={
              <Navigate
                to="/customer/requests"
                replace
              />
            }
          />


          <Route
            path="/garage"
            element={
              <Navigate
                to="/customer/garage"
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
              СОЗДАНИЕ ЗАКАЗА
          ===================================================== */}

          <Route
            path="/customer/orders/new"
            element={
              <CreateOrderPage />
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
          ===================================================== */}

          <Route
            path="/executors"
            element={
              <ExecutorsPage />
            }
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
              <MapPage />
            }
          />


          {/* =====================================================
              КАБИНЕТ ИСПОЛНИТЕЛЯ

              ВАЖНО:
              /executor/* позволяет ExecutorDashboardPage
              самостоятельно определять текущий раздел:

              /executor
              /executor/requests
              /executor/orders
              /executor/schedule
              /executor/profile
          ===================================================== */}

          <Route
            path="/executor/*"
            element={
              <ExecutorDashboardPage />
            }
          />


          {/* =====================================================
              КАБИНЕТ АДМИНИСТРАТОРА
          ===================================================== */}

          <Route
            path="/admin/*"
            element={
              <AdminDashboardPage />
            }
          />


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
                  onClose={closeAuth}
                  onSwitchToLogin={openLogin}
                />

              )}

            </div>

          </div>

        )}

      </BrowserRouter>

    </AuthProvider>
  );
}


export default App;