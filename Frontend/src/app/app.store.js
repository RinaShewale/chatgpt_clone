import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../feature/auth/auth.slice"
import chatReducer from "../feature/chat/chat.slice"



export const store= configureStore({
    reducer:{
           auth: authReducer,
           chat: chatReducer
    }
    
})