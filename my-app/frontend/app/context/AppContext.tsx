"use client";

import { ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { createContext } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export const AppContext = createContext<AppContextType | null>(null);

export const user_service = "http://localhost:5000";
export const chat_service = "http://localhost:5002";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: string;
  updatedAt: string;
  unseenCount?: number;
}

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  LogoutUser: () => Promise<void>;
  FetchAllusers: () => Promise<void>;
  FetchChats: () => Promise<void>;

  chats: Chats[] | null;
  allusers: User[] | null;

  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const token = Cookies.get("token");

      if (!token) return;

      const { data } = await axios.get(`${user_service}/api/v1/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // console.log(data);

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function LogoutUser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    setChats(null);
    setAllUsers(null);
    toast.success("User Logged Out");
  }

  const [chats, setChats] = useState<Chats[] | null>(null);

  async function FetchChats() {
    const token = Cookies.get("token");
    if (!token) return;
    try {
      const { data } = await axios.get(`${chat_service}/api/v1/chat/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats(data.chats);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching the chats");
    }
  }

  const [allusers, setAllUsers] = useState<User[] | null>(null);

  async function FetchAllusers() {
    const token = Cookies.get("token");

    try {
      const { data } = await axios.get(`${user_service}/api/v1/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAllUsers(data);
      // setAllUsers(data.users);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching All the users");
    }
  }

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      fetchUser();
      FetchChats();
      FetchAllusers();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuth,
        setIsAuth,
        loading,
        LogoutUser,
        FetchChats,
        FetchAllusers,
        chats,
        allusers,
        setChats,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useappdata must be used within AppProvider");
  }
  return context;
};
