import { useDispatch } from "react-redux";
import { login, register, getme, updateProfile, logout as logoutApi, updatePassword as updatePasswordApi, resetPassword, forgotPassword } from "../services/auth.api";
import { setUser, setLoading, setError, setAuthChecked, logout as logoutAction } from "../auth.slice";
import { useNavigate } from "react-router-dom";

export function useAuth() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // ================= REGISTER =================
    async function handleRegister({ email, password, username }) {
        try {
            dispatch(setLoading(true));

            if (!email || !password || !username) {
                dispatch(setError("Missing fields"));
                return { success: false };
            }

            const data = await register({
                email: email.trim(),
                username: username.trim(),
                password
            });

            // ✅ If backend sends token (optional)
            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            // ⚠️ IMPORTANT: DON'T assume user is logged in after register
            dispatch(setUser(null)); // or keep pending state

            return { success: true };

        } catch (err) {
            console.log("REGISTER ERROR 👉", err.response?.data);

            dispatch(setError(err.response?.data?.message || "registration failed"));
            dispatch(setUser(null));

            return { success: false };
        } finally {
            dispatch(setLoading(false));
        }
    }




    // ================= LOGIN =================
    // Inside useauth.js -> handleLogin
    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            const data = await login({ email, password });

            if (data.token) {
                localStorage.setItem("token", data.token);
            }

            dispatch(setUser(data.user));

            navigate("/"); // ✅ ADD THIS
            return { success: true };

        } catch (err) {
            dispatch(setError(err.response?.data?.message || "login failed"));
            return { success: false };
        } finally {
            dispatch(setLoading(false));
        }
    }



    
    // ================= GET ME =================
    async function handleGetme() {
        try {
            dispatch(setLoading(true));
            const data = await getme();
            dispatch(setUser(data?.user || null));
        } catch (err) {
            // If 401 happens, we just set user to null
            dispatch(setUser(null));
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
            }
        } finally {
            dispatch(setLoading(false));
            // 🔥 CRITICAL: This must run even if the API fails (401)
            dispatch(setAuthChecked(true));
        }
    }




    async function handleUpdateProfile(updateData) {
        try {
            dispatch(setLoading(true));
            const data = await updateProfile(updateData);

            if (data.user) {
                dispatch(setUser(data.user)); // Update Redux with new name/username
                return { success: true };
            }
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Update failed"));
            return { success: false, error: err.response?.data?.message };
        } finally {
            dispatch(setLoading(false));
        }
    }



    async function handleUpdatePassword({ oldPassword, newPassword }) {
        try {
            // We don't necessarily need a global loading state for this, 
            // but we call the API
            const data = await updatePasswordApi({ oldPassword, newPassword });

            return { success: true, message: data.message };
        } catch (err) {
            console.error("Update Password Error:", err);
            return {
                success: false,
                error: err.response?.data?.message || "Failed to update password"
            };
        }
    }




    const handleLogout = async () => {
        console.log("Logout process started...");
        try {
            // A. Call the API function (the one from services/auth.api)
            await logoutApi();
        } catch (err) {
            console.error("Logout API failed (ignoring and continuing):", err);
        } finally {
            // B. Clear the browser storage
            localStorage.removeItem("token");

            // C. Dispatch the REDUX action (the one from auth.slice)
            // We use the new name 'logoutAction' here
            dispatch(logoutAction());

            // D. Navigate back to login
            navigate("/login");
        }
    };




    async function handleForgotPassword(email) {
        try {
            const data = await forgotPassword(email);
            return { success: true, token: data.token }; // Token returned for testing
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Error" };
        }
    }

    async function handleResetPassword(token, newPassword) {
        try {
            await resetPassword(token, newPassword);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || "Error" };
        }
    }


    return {
        handleRegister,
        handleLogin,
        handleGetme,
        handleUpdateProfile,
        handleLogout,
        handleUpdatePassword,
        handleForgotPassword,
        handleResetPassword
    };
}