import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Check, 
  X, 
  Loader2, 
  Brain, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle 
} from "lucide-react";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing from the URL.");
        return;
      }

      try {
        // Ensure this matches your backend PORT
        const response = await axios.get(
          `https://perplexity-58ov.onrender.com/api/auth/verify-email?token=${token}`
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
        }
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Verification failed. The link may have expired."
        );
      }
    };

    // Small delay to prevent layout flicker
    const timeout = setTimeout(verifyToken, 1000);
    return () => clearTimeout(timeout);
  }, [token]);

  return (
    <div className="flex h-screen bg-[#212121] text-[#ececec] items-center justify-center font-sans px-4">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#19c37d]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full bg-[#171717] border border-white/10 rounded-[26px] p-8 md:p-10 shadow-2xl relative z-10 text-center">
        
        {/* LOGO AREA */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-white">
            <Brain size={32} />
          </div>
        </div>

        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-center">
              <Loader2 className="w-10 h-10 text-[#19c37d] animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Verifying Identity</h2>
              <p className="text-gray-400 text-sm md:text-base px-4">
                Please wait while we secure your account access...
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-[#19c37d]/10 rounded-full flex items-center justify-center border border-[#19c37d]/30">
                <ShieldCheck className="w-8 h-8 text-[#19c37d]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Email Verified</h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                {message || "Your account is now fully activated and ready to use."}
              </p>
            </div>
            <Link
              to="/login"
              className="group flex items-center justify-center gap-2 w-full bg-white text-black font-semibold py-3.5 rounded-xl hover:bg-[#ececec] transition-all active:scale-[0.98]"
            >
              Continue to Login
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-semibold text-white">Verification Failed</h2>
              <p className="text-gray-400 text-sm px-2">
                {message}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <Link
                to="/register"
                className="flex items-center justify-center w-full bg-[#2f2f2f] hover:bg-[#3f3f3f] text-white font-medium py-3 rounded-xl transition-all border border-white/5"
              >
                Return to Register
              </Link>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">
                Or try checking your spam folder
              </p>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .zoom-in-95 { animation-name: zoom-in; }
      `}</style>
    </div>
  );
};

export default VerifyEmail;