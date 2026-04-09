import { Router } from "express";
import { register, login, getMe, verifyEmail, updateProfile, logout, updatePassword, forgotPassword, resetPassword } from "../controller/authcontroller.js";
import { registerValidator, loginValidator, resetPasswordValidator, forgotPasswordValidator } from "../Validator/auth.validator.js";
import { authUser } from "../middleware/auth.middleware.js";




const authRouter = Router()

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login);

authRouter.get("/getme", authUser, getMe);

authRouter.get("/verify-email", verifyEmail);


authRouter.patch("/update", authUser, updateProfile);

authRouter.get("/logout", logout); 

authRouter.patch("/update-password", authUser, updatePassword);


authRouter.post("/forgot-password", forgotPasswordValidator, forgotPassword);
authRouter.post("/reset-password", resetPasswordValidator, resetPassword);


export default authRouter