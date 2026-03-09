"use client";
import axios from "axios";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, Loader2, Lock } from "lucide-react";
import { useAppData, user_service } from "../context/AppContext";
import Loading from "./loading";
import toast from "react-hot-toast";

export default function VerifyOtp() {

const { isAuth, setIsAuth, setUser, loading: UserLoading , FetchAllusers , FetchChats} = useAppData();
 
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendloading, setResendloading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter valid code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${user_service}/api/v1/verify`, {
        email,
        otp: otpString,
      });

      toast.success(data.message);

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      FetchAllusers();
      FetchChats();

      //   router.push("/dashboard");
    } catch (error: any) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendloading(true);
    setError("");

    try {
      const {data} =  await axios.post(`${user_service}/api/v1/login`, {
        email,
      });

      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(error?.response?.data?.message || "Something went wrong");
    } finally {
      setResendloading(false);
    }
  };

  if(UserLoading){
    return <Loading/>;
  }

  if(isAuth) {
    redirect("/chat");

  }
  
return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8 relative">
            <button onClick={ () => router.push("/login")} className=" absolute top-0 left-0 p-2 text-gray-200 hover:text-white border border-gray-500 rounded-lg">
                <ChevronLeft className="h-8 w-8"/>
            </button>
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-3">
              Verify Your Email
            </h1>

            <p className="text-gray-400 text-lg">
              We have sent a 6 digit code to
            </p>
            <p className="text-white">{email}</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter your 6 digit OTP here
              </label>

              <div className="flex justify-center space-x-3">
                {otp.map((element, index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={element}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-white text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-800 border-red-600 rounded-lg p-3">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying
                </div>
              ) : (
                <div className="flex items-center justify-center text-md gap-2">
                  <span>Verify</span>
                  <ArrowRight className="h-6 w-6" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">
              Didn't receive the code?
            </p>

            {timer > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend Code in {timer} seconds
              </p>
            ) : (
              <button
                className="text-blue-500 hover:text-blue-300 font-medium text-sm disabled:opacity-50"
                disabled={resendloading}
                onClick={handleResendOtp}
              >
                {resendloading ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
