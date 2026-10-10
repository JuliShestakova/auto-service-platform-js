
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

const AuthContext = createContext(undefined);

const USER_STORAGE_KEY = 'autoServiceUser';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

async function readResponse(response) {
  return response.json().catch(() => ({}));
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshPromiseRef = useRef(null);

  const saveUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(userData),
    );
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  // Обновляем токены. Одновременные запросы используют
  // один общий запрос обновления.
  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const refreshToken = localStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

    if (!refreshToken) {
      clearSession();
      return null;
    }

    const refreshPromise = (async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: refreshToken,
          }),
        });

        const data = await readResponse(response);

        if (
          !response.ok ||
          !data.access_token ||
          !data.refresh_token
        ) {
          clearSession();
          return null;
        }

        // Не перезаписываем токены, если сессия была
        // очищена во время выполнения запроса.
        if (
          localStorage.getItem(REFRESH_TOKEN_KEY) !==
          refreshToken
        ) {
          return null;
        }

        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          data.access_token,
        );
        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          data.refresh_token,
        );

        return data.access_token;
      } catch (error) {
        console.error('Ошибка обновления токена:', error);
        return null;
      }
    })();

    refreshPromiseRef.current = refreshPromise;

    try {
      return await refreshPromise;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, [clearSession]);

  // Единая функция запросов к защищённым endpoint.
  // При 401 обновляет токен и повторяет запрос один раз.
  const authFetch = useCallback(async (url, options = {}) => {
    const makeRequest = (token) => {
      const headers = new Headers(options.headers || {});

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(url, {
        ...options,
        headers,
      });
    };

    let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    let response = await makeRequest(accessToken);

    if (response.status !== 401) {
      return response;
    }

    accessToken = await refreshAccessToken();

    if (!accessToken) {
      clearSession();
      return response;
    }

    response = await makeRequest(accessToken);
    return response;
  }, [refreshAccessToken, clearSession]);

  // Проверяем сохранённую сессию при запуске приложения.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        let accessToken = localStorage.getItem(
          ACCESS_TOKEN_KEY,
        );
        const refreshToken = localStorage.getItem(
          REFRESH_TOKEN_KEY,
        );

        if (!accessToken && !refreshToken) {
          clearSession();
          return;
        }

        if (!accessToken) {
          accessToken = await refreshAccessToken();
        }

        if (!accessToken) {
          clearSession();
          return;
        }

        let response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          accessToken = await refreshAccessToken();

          if (!accessToken) {
            clearSession();
            return;
          }

          response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
        }

        if (!response.ok) {
          clearSession();
          return;
        }

        const meData = await readResponse(response);

        if (!meData.id || cancelled) {
          return;
        }

        saveUser({
          id: meData.id,
          name: meData.name,
          email: meData.email,
          role: meData.role,
          cars: [],
        });
      } catch (error) {
        console.error('Ошибка восстановления сессии:', error);
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession, refreshAccessToken, saveUser]);

  const login = useCallback(async (email, password) => {
    const normalizedEmail = String(email || '')
      .trim()
      .toLowerCase();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await readResponse(response);

      if (
        !response.ok ||
        !data.access_token ||
        !data.refresh_token
      ) {
        return {
          success: false,
          error: data.detail || 'Неверный email или пароль.',
        };
      }

      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        data.access_token,
      );
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        data.refresh_token,
      );

      const meResponse = await authFetch('/api/auth/me');
      const meData = await readResponse(meResponse);

      if (!meResponse.ok) {
        clearSession();

        return {
          success: false,
          error: meData.detail ||
            'Не удалось получить данные пользователя.',
        };
      }

      const loggedUser = {
        id: meData.id,
        name: meData.name,
        email: meData.email,
        role: meData.role,
        cars: [],
      };

      saveUser(loggedUser);

      return {
        success: true,
        user: loggedUser,
      };
    } catch (error) {
      console.error('Ошибка авторизации:', error);

      clearSession();

      return {
        success: false,
        error: 'Не удалось подключиться к серверу.',
      };
    }
  }, [authFetch, clearSession, saveUser]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

    // Сразу очищаем локальную сессию.
    clearSession();

    if (!refreshToken) {
      return;
    }

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      });
    } catch (error) {
      console.error('Ошибка выхода из аккаунта:', error);
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        authFetch,
        isLoading,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};
