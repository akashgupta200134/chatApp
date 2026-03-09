"use client";

import { useEffect, useState } from "react";
import { useAppData, User } from "../context/AppContext";
import { useRouter } from "next/navigation";
import Loading from "../components/loading";
import Chatsidebar from "../components/chatSidebar";

export interface Message {
  _id: string;
  chatId: string;
  sender: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: string;
  createdAt: string;
}

const ChatApp = () => {
  const {
    isAuth,
    loading,
    LogoutUser,
    chats,
    user: loggedInUser,
    allusers,
  } = useAppData();

  const [selecteduser, setSelecteduser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sidebaropen, setSidebaropen] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  const [messages, setMessages] = useState<Message[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeOut] = useState<NodeJS.Timeout | null>(
    null
  );

  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [loading, isAuth, router]);

  const handleLogout = () => {
    LogoutUser();
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <Chatsidebar
        sidebarOpen={sidebaropen}
        setSideBarOpen={setSidebaropen}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        users={allusers}
        loggedInUser={loggedInUser}
        chats={chats}
        Selecteduser={selecteduser}
        setSelectedUser={setSelecteduser}
        handleLogout={handleLogout}
      />
    </div>
  );
};

export default ChatApp;