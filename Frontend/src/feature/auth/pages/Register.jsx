import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useauth";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const submitForm = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await handleRegister({ username, email, password });

      if (res?.success) {
        // ✅ direct login page (no reload needed)
        navigate("/login", { replace: true });
      } else {
        setError(res?.message || "Registration failed");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#31b8c6]/20 rounded-full blur-3xl bottom-[-100px] right-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-[#31b8c6]/10 rounded-full blur-3xl top-[-100px] left-[-100px]" />

      <form
        onSubmit={submitForm}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(49,184,198,0.15)]"
      >
        <h2 className="text-2xl font-semibold text-white text-center mb-6">
          Create Account
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center mb-3">{error}</p>
        )}

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-transparent text-white border border-white/10 focus:outline-none focus:border-[#31b8c6]"
          required
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 rounded-lg bg-transparent text-white border border-white/10 focus:outline-none focus:border-[#31b8c6]"
          required
        />

        {/* Password */}
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-lg bg-transparent text-white border border-white/10 focus:outline-none focus:border-[#31b8c6]"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold bg-[#31b8c6] hover:bg-[#2aa3b0] transition active:scale-95 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        {/* Login link */}
        <p className="text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#31b8c6] hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}