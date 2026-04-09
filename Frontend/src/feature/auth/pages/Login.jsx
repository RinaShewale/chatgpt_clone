import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useauth";
import { useSelector } from "react-redux";
import { Eye, EyeOff } from "lucide-react"; // 👈 Add icons

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // 👈 Add state
    
    const [isForgotMode, setIsForgotMode] = useState(false);
    const [step, setStep] = useState(1);
    const [token, setToken] = useState(""); 
    const [status, setStatus] = useState({ msg: "", type: "" }); 

    const { handleLogin, handleForgotPassword, handleResetPassword } = useAuth();
    const user = useSelector(state => state.auth?.user);
    const loading = useSelector(state => state.auth?.loading);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setStatus({ msg: "", type: "" });

        if (!isForgotMode) {
            await handleLogin({ email, password });
        } else {
            if (step === 1) {
                const res = await handleForgotPassword(email);
                if (res.success) {
                    setStatus({ msg: "Check your email for the reset token!", type: "success" });
                    setStep(2);
                } else {
                    setStatus({ msg: res.error, type: "error" });
                }
            } else {
                const res = await handleResetPassword(token, password);
                if (res.success) {
                    setStatus({ msg: "Password reset successful!", type: "success" });
                    setTimeout(() => {
                        setIsForgotMode(false);
                        setStep(1);
                        setPassword("");
                        setToken("");
                    }, 2500);
                } else {
                    setStatus({ msg: res.error, type: "error" });
                }
            }
        }
    };

    const toggleMode = () => {
        setIsForgotMode(!isForgotMode);
        setStep(1);
        setStatus({ msg: "", type: "" });
        setToken("");
        setPassword("");
        setShowPassword(false);
    };

    if (!loading && user) return <Navigate to="/" replace />;

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
            <div className="absolute w-[500px] h-[500px] bg-[#31b8c6]/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />
            <div className="absolute w-[400px] h-[400px] bg-[#31b8c6]/10 rounded-full blur-3xl top-[-100px] left-[-100px]" />

            <form
                onSubmit={handleFormSubmit}
                className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(49,184,198,0.15)]"
            >
                <h2 className="text-2xl font-semibold text-white text-center mb-6">
                    {isForgotMode ? (step === 1 ? "Forgot Password" : "Reset Password") : "Login"}
                </h2>

                {status.msg && (
                    <div className={`mb-4 text-center text-sm p-3 rounded-lg border ${status.type === 'error' ? 'text-red-400 border-red-400/20 bg-red-400/5' : 'text-green-400 border-green-400/20 bg-green-400/5'}`}>
                        {status.msg}
                    </div>
                )}

                <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isForgotMode && step === 2}
                    className="w-full mb-4 p-3 rounded-lg bg-white/5 text-white border border-white/10 outline-none focus:border-[#31b8c6] transition disabled:opacity-50"
                    required
                />

                {isForgotMode && step === 2 && (
                    <input
                        type="text"
                        placeholder="Enter Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full mb-4 p-3 rounded-lg bg-white/5 text-white border border-white/10 outline-none focus:border-[#31b8c6]"
                        required
                    />
                )}

                {(!isForgotMode || step === 2) && (
                    <div className="relative mb-2">
                        <input
                            type={showPassword ? "text" : "password"} // 👈 Toggle type
                            placeholder={isForgotMode ? "New Password" : "Password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-white/5 text-white border border-white/10 outline-none focus:border-[#31b8c6]"
                            required
                        />
                        {/* 👈 Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                )}

                {!isForgotMode && (
                    <div className="text-right mb-6">
                        <button type="button" onClick={toggleMode} className="text-xs text-gray-400 hover:text-[#31b8c6] transition">
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 mt-4 rounded-lg text-white font-semibold bg-[#31b8c6] hover:bg-[#2aa3b0] transition active:scale-95 disabled:opacity-50"
                >
                    {loading ? "Processing..." : (isForgotMode ? (step === 1 ? "Send Reset Token" : "Update Password") : "Login")}
                </button>

                <p className="text-gray-400 text-center mt-6">
                    {isForgotMode ? (
                        <button type="button" onClick={toggleMode} className="text-[#31b8c6] hover:underline font-medium">Back to Login</button>
                    ) : (
                        <>Don’t have an account? <Link to="/register" className="text-[#31b8c6] hover:underline font-medium">Register</Link></>
                    )}
                </p>
            </form>
        </div>
    );
}