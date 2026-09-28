import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

const TOKEN_KEY = "linklyToken";
const USER_KEY = "linklyUser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () =>
      localStorage.getItem(TOKEN_KEY)
  );

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(USER_KEY) ||
          "null"
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result =
          await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Session expired");
        }

        setUser(result.data.user);

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(result.data.user)
        );
      } catch {
        localStorage.removeItem(
          TOKEN_KEY
        );

        localStorage.removeItem(
          USER_KEY
        );

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, [token]);

  const login = async (
    email,
    password
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Unable to login."
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      result.data.token
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(result.data.user)
    );

    setToken(result.data.token);
    setUser(result.data.user);

    return result.data.user;
  };

  const register = async (
    name,
    email,
    password
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      }
    );

    const result =
      await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message ||
          "Unable to create account."
      );
    }

    localStorage.setItem(
      TOKEN_KEY,
      result.data.token
    );

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(result.data.user)
    );

    setToken(result.data.token);
    setUser(result.data.user);

    return result.data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(
          token && user
        ),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}