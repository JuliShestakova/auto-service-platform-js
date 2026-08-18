import {
  createContext,
  useContext,
  useState,
} from 'react';

const AuthContext = createContext(undefined);

/*
 * =========================================================
 * ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ
 * =========================================================
 *
 * Заказчик:
 * customer@example.com
 * customer123
 *
 * Исполнитель:
 * executor@example.com
 * executor123
 *
 * Администратор:
 * admin@example.com
 * admin123
 */

const testUsers = [
  {
    id: 1,
    name: 'Иван Иванов',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer',

    cars: [
      {
        id: 1,
        brand: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 120000,
        vin: 'XXXXXXXXXXXXXXX',
      },
    ],
  },

  {
    id: 2,
    name: 'Автосервис Мотор',
    email: 'executor@example.com',
    password: 'executor123',
    role: 'executor',

    cars: [],
  },

  {
    id: 3,
    name: 'Администратор',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',

    cars: [],
  },
];


/*
 * =========================================================
 * AUTH PROVIDER
 * =========================================================
 */

function AuthProvider({ children }) {

  /*
   * При запуске приложения пытаемся восстановить
   * пользователя из localStorage.
   */
  const [user, setUser] = useState(() => {

    try {

      const savedUser =
        localStorage.getItem('autoServiceUser');

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);

    } catch (error) {

      console.error(
        'Ошибка восстановления пользователя:',
        error
      );

      localStorage.removeItem(
        'autoServiceUser'
      );

      return null;
    }

  });


  /*
   * =======================================================
   * ВХОД
   * =======================================================
   */

  const login = (email, password) => {

    const normalizedEmail =
      String(email || '')
        .trim()
        .toLowerCase();

    const normalizedPassword =
      String(password || '').trim();


    const foundUser = testUsers.find(
      (testUser) =>
        testUser.email.toLowerCase() ===
          normalizedEmail &&
        testUser.password ===
          normalizedPassword
    );


    /*
     * Пользователь не найден
     */
    if (!foundUser) {

      return {
        success: false,
        error: 'Неверный email или пароль.',
      };

    }


    /*
     * Не сохраняем пароль пользователя.
     */
    const loggedUser = {

      id: foundUser.id,

      name: foundUser.name,

      email: foundUser.email,

      role: foundUser.role,

      cars: foundUser.cars || [],

    };


    /*
     * Сохраняем пользователя
     * в состояние приложения.
     */
    setUser(loggedUser);


    /*
     * Сохраняем пользователя
     * в localStorage.
     *
     * Благодаря этому после F5
     * пользователь останется авторизован.
     */
    localStorage.setItem(
      'autoServiceUser',
      JSON.stringify(loggedUser)
    );


    /*
     * Возвращаем пользователя LoginPage.
     */
    return {

      success: true,

      user: loggedUser,

    };

  };


  /*
   * =======================================================
   * ВЫХОД
   * =======================================================
   */

  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      'autoServiceUser'
    );

  };


  /*
   * =======================================================
   * CONTEXT
   * =======================================================
   */

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


/*
 * =========================================================
 * USE AUTH
 * =========================================================
 */

function useAuth() {

  const context =
    useContext(AuthContext);


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