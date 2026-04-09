// AppRouter.js
import { createBrowserRouter } from "react-router-dom";
import Login from "../feature/auth/pages/Login";
import Register from "../feature/auth/pages/Register";
import Dashboard from "../feature/chat/pages/Dashboard";
import Protected from "../feature/auth/component/Protected";

import RootLayout from "./RootLayout"; 
import VerifyEmail from "../feature/auth/pages/VerifyEmail";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />, 
        children: [
            {
                path: "/",
                element: <Protected><Dashboard /></Protected>
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            },
            {
                path: "/verify-email", // 2. Add this route
                element: <VerifyEmail />
            },
        ]
    }
])