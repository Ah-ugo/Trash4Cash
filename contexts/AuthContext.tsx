"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { apiService } from "../services/api";
import type { ApiUser } from "../types/api";

interface AuthContextType {
  user: ApiUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<ApiUser>) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("auth_token");
      const storedUser = await AsyncStorage.getItem("user_data");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh user data from API
        try {
          const freshUserData = await apiService.getProfile();
          setUser(freshUserData);
          await AsyncStorage.setItem(
            "user_data",
            JSON.stringify(freshUserData)
          );
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);

      setToken(response.token);
      setUser(response.user);

      await AsyncStorage.setItem("auth_token", response.token);
      await AsyncStorage.setItem("user_data", JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);

      setToken(response.token);
      setUser(response.user);

      await AsyncStorage.setItem("auth_token", response.token);
      await AsyncStorage.setItem("user_data", JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user_data");
    router.push("/auth/login");
  };

  const updateUser = (userData: Partial<ApiUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem("user_data", JSON.stringify(updatedUser));
    }
  };

  const refreshUser = async () => {
    try {
      const freshUserData = await apiService.getProfile();
      setUser(freshUserData);
      await AsyncStorage.setItem("user_data", JSON.stringify(freshUserData));
    } catch (error) {
      console.error("Error refreshing user:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
