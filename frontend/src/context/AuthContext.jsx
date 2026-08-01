import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const USER_KEY = 'fitit_user';
const TOKEN_KEY = 'fitit_tokens';

function loadStored(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function fetchProfile(accessToken) {
  const res = await fetch('/api/auth/profile/', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('profile failed');
  return res.json();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadStored(USER_KEY));
  const [tokens, setTokens] = useState(() => loadStored(TOKEN_KEY));

  useEffect(() => {
    if (tokens?.access) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const interceptor = axios.interceptors.response.use(
      r => r,
      err => {
        if (err.response?.status === 401) {
          localStorage.removeItem('fitit_user');
          localStorage.removeItem('fitit_tokens');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
          setTokens(null);
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [tokens]);

  const _saveSession = (userInfo, tokenData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokenData));
    setUser(userInfo);
    setTokens(tokenData);
  };

  const login = async ({ email, password }) => {
    try {
      const tokenRes = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      if (!tokenRes.ok) {
        return { success: false, error: 'Invalid email or password.' };
      }
      const tokenData = await tokenRes.json();
      const profile = await fetchProfile(tokenData.access);
      _saveSession(
        { firstName: profile.first_name, lastName: profile.last_name, email: profile.email },
        tokenData,
      );
      return { success: true };
    } catch {
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  const register = async ({ firstName, lastName, email, password }) => {
    try {
      const res = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }
      return login({ email, password });
    } catch {
      return { success: false, error: 'Something went wrong. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setTokens(null);
  };

  const updateProfile = (fields) => {
    const updated = { ...user, ...fields };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
