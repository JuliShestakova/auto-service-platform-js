import {
  createContext,
  useContext,
  useState,
} from 'react';

const AuthContext = createContext(undefined);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('autoServiceUser');

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        'Ошибка восстановления пользователя:',
        error
      );

      localStorage.removeItem('autoServiceUser');

      return null;
    }
  });

  const login = async (email, password) => {
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

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error:
            data.detail ||
            'Неверный email или пароль.',
        };
      }

      const {
        access_token,
        refresh_token,
      } = data;

      localStorage.setItem(
        'accessToken',
        access_token
      );

      localStorage.setItem(
        'refreshToken',
        refresh_token
      );

      /*
       * Получаем информацию о текущем пользователе
       * через защищённый endpoint /auth/me.
       */
      const meResponse = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const meData = await meResponse.json();

      if (!meResponse.ok) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        return {
          success: false,
          error: 'Не удалось получить данные пользователя.',
        };
      }

      const loggedUser = {
        id: meData.id,
        name: meData.name,
        email: meData.email,
        role: meData.role,
        cars: [],
      };

      setUser(loggedUser);

      localStorage.setItem(
        'autoServiceUser',
        JSON.stringify(loggedUser)
      );

      return {
        success: true,
        user: loggedUser,
      };
    } catch (error) {
      console.error(
        'Ошибка авторизации:',
        error
      );

      return {
        success: false,
        error:
          'Не удалось подключиться к серверу.',
      };
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem(
      'autoServiceUser'
    );

    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'refreshToken'
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
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
      'useAuth must be used inside AuthProvider'
    );
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};