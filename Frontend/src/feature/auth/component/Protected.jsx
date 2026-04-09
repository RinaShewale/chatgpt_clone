import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const Protected = ({ children }) => {
    const { user, loading, isAuthChecked } = useSelector(state => state.auth);
    const location = useLocation();

    // 1. If we are still fetching the user for the first time, show loading
    // This prevents the "flash" of the login page
    if (!isAuthChecked || loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div>Loading authentication...</div>
            </div>
        );
    }

    // 2. If check is done and there is no user, redirect to login
    if (!user) {
        // We save the current location so we can redirect back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. If there is a user, render the Dashboard
    return children;
};

export default Protected;