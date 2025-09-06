/**
 * Authentication Slice
 *
 * Manages authentication state for the Super Admin, including
 * registration, login, and logout flows.
 *
 * Features:
 * - Register: Creates a new Super Admin account
 * - Login: Authenticates an existing Super Admin
 * - Logout: Ends the current session
 *
 * State Shape:
 * {
 *   user: { id, email, userName } | null,
 *   token: string | null,
 *   loading: boolean,
 *   error: any
 * }
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

/**
 * Register a new Super Admin.
 *
 * @param {Object} formData - Registration form data.
 * @returns {Promise<{ user: Object, token: string }>} User info and JWT token.
 */
export const register = createAsyncThunk(
  "super-admin/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/signup-super-admin`,
        formData
      );

      const { token, superAdmin } = response.data;

      if (!superAdmin || !token) {
        throw new Error("Invalid register response format");
      }

      const user = {
        id: superAdmin.id,
        email: superAdmin.email,
        userName: superAdmin.userName,
      };

      localStorage.setItem("authToken", token);

      return { user, token };
    } catch (error) {
      console.error("Register Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Login an existing Super Admin.
 *
 * @param {Object} loginData - Login credentials.
 * @returns {Promise<{ user: Object, token: string }>} User info and JWT token.
 */
export const login = createAsyncThunk(
  "super-admin/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/signin-super-admin`,
        loginData
      );

      console.log("Login response:", response.data);

      const { token, superAdmin } = response.data;

      if (!superAdmin || !token) {
        throw new Error("Invalid login response format");
      }

      const user = {
        id: superAdmin.id,
        email: superAdmin.email,
        userName: superAdmin.userName,
      };

      localStorage.setItem("authToken", token);

      return { user, token };
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { error: error.message });
    }
  }
);

/**
 * Logout the current Super Admin.
 *
 * @returns {Promise<any>} API response data.
 */
export const logout = createAsyncThunk(
  "super-admin/logout",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");

      const response = await axios.post(
        `${BACKEND_API_URL}/super-admin/logout-super-admin`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data || { message: "Unknown error occurred." }
      );
    }
  }
);

/**
 * Auth slice managing user and token state with async thunks.
 */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("authToken");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
