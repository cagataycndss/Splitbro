import React, { createContext, useState, useEffect } from "react";
import {
  getToken,
  saveToken,
  deleteToken,
  getUserId,
  saveUserId,
  deleteUserId,
} from "../utils/token";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      const storedUserId = await getUserId();
      if (token && storedUserId) {
        setUserToken(token);
        setUserId(storedUserId);
      }
      setIsLoading(false);
    };
    checkToken();
  }, []);

  const login = async (token, id) => {
    await saveToken(token);
    await saveUserId(id);
    setUserToken(token);
    setUserId(id);
  };

  const logout = async () => {
    await deleteToken();
    await deleteUserId();
    setUserToken(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userId, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
