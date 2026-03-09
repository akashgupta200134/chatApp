"use client";
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useAppData, user_service } from "../context/AppContext";
import Loading from "../components/loading";
import toast from "react-hot-toast";

export default function ChatApp() {
  const [email, setEmail] = useState<string>("");
  const [loading, SetLoading] = useState<boolean>(false);

  const {isAuth , loading:userLoading} = useAppData();

  const router = useRouter();

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    SetLoading(true);

    try {
      const { data } = await axios.post(`${user_service}/api/v1/login`, {
        email,
      });

      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error("Server not responding");
      } else {
        toast.error(error.message);
      }
    } finally {
      SetLoading(false);
    }
  };

  if(userLoading) {
    return (
      <Loading/>
    ) 
  }

  if(isAuth){
    return (
       redirect("/chat")
    )
  }
  return (
    <div className=" min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className=" max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className=" mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Welcome To ChatApp
            </h1>
            <p className="text-gray-300 text-lg">
              Enter your Email to continue your journey
            </p>
          </div>
          <form action="" className=" space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-4 bg-gray-700 border  border-gray-600 rounded-lg
                         text-white placeholder-gray-400"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed "
              disabled={loading}
            >
              {loading ? (
                <div className=" flex items-center justify-center gap-2">
                  <Loader2 className=" w-5 h-5" />
                  Sending otp to your email
                </div>
              ) : (
                <div className="flex items-center justify-center text-md gap-2 ">
                  <span> Send Verifcation Code </span>
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
