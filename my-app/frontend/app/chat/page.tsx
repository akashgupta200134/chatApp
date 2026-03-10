"use client";

import { useEffect, useState } from "react";
import { chat_service, useAppData, User } from "../context/AppContext";
import { useRouter } from "next/navigation";
import Loading from "../components/loading";
import Chatsidebar from "../components/chatSidebar";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import axios from "axios";
import ChatHeader from "../components/chatHeader";
import ChatMessages from "../components/chatMessages";

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
    FetchChats,
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
    null,
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



async function fetchChat(){

  try {

      const token = Cookies.get("token");
      const { data } = await axios.get(
        `${chat_service}/api/v1/message/${selecteduser}`,
       
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
            
      setMessage(data.message);
      setUser(data.user);
      await FetchChats();
    } catch (error: any) {
  console.log("Backend error:", error.response?.data);
  toast.error(error.response?.data?.message || "  failed to start chat");
}
  }
   
  



  async function createChat(u: User) {
    try {
      const token = Cookies.get("token");
console.log("loggedInUser:", loggedInUser);
console.log("other user:", u);
console.log("token:", token);
      const { data } = await axios.post(
        `${chat_service}/api/v1/chat/new`,
        {
          userId: loggedInUser?._id,
          otheruserId: u._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSelecteduser(data.chatId);
      setShowAllUsers(false);
      await FetchChats();
    } catch (error: any) {
  console.log("Backend error:", error.response?.data);
  toast.error(error.response?.data?.message || "Chat creation failed");
}
  }

  useEffect(() => {
    if(selecteduser){
      fetchChat();

    }
  },[selecteduser])

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
        createChat={createChat}
      />

      <div className="flex-1  flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-white/10 ">
      <ChatHeader user={user} setSidebarOpen={setSidebaropen} isTyping={isTyping}/>

   

 <ChatMessages selecteduser={selecteduser} messages={messages} loggedInUser={loggedInUser}/>

      </div>
      
    </div>
  );
};

export default ChatApp;
