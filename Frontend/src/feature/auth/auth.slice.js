import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        loading: false,
        error: null,
        isAuthChecked: false 
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setAuthChecked: (state, action) => {
            state.isAuthChecked = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.error = null;
            state.loading = false;
            state.isAuthChecked = true; // Set to true so Protected routes don't hang
        }
    }
});

export const { setUser, setLoading, setError, setAuthChecked, logout } = authSlice.actions;
export default authSlice.reducer;