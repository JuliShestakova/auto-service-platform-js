import {
  createContext,
  useContext,
  useState,
} from 'react';

const AuthContext = createContext(undefined);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (role) => {
    const testUsers = {
      customer: {
        id: 1,
        name: 'Иван Иванов',
        email: 'customer@example.com',
        role: 'customer',
      },

      executor: {
        id: 2,
        name: 'Автосервис Мотор',
        email: 'executor@example.com',
        role: 'executor',
      },

      admin: {
        id: 3,
        name: 'Администратор',
        email: 'admin@example.com',
        role: 'admin',
      },
    };

    setUser(testUsers[role]);
  };

  const logout = () => {
    setUser(null);
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

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider',
    );
  }

  return context;
}

export { AuthProvider, useAuth };