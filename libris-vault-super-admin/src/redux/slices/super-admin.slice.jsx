/**
 * Super Admin Slice
 *
 * Manages super admin data state, including fetching and storing
 * super admin information for profile management and details display.
 *
 * Features:
 * - Get Super Admin: Fetches super admin details by Super Admin ID
 * - Clear Error: Clears any existing error state
 * - Clear Super Admin: Removes stored super admin data
 *
 * State Shape:
 * {
 *   superAdmin: { id, email, userName, ... } | null,
 *   loading: boolean,
 *   error: { message: string, success: boolean, status: number } | null
 * }
 */

import axios from "axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

/**
 * Get Super Admin by ID
 *
 * @param {string} superAdminId - The ID of the super admin to retrieve
 * @returns {Promise<Object>} Super admin data with success message
 */
export const getSuperAdmin = createAsyncThunk(
  "superAdmin/getSuperAdmin",
  async (superAdminId, { rejectWithValue }) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      return rejectWithValue({
        message: "Admin is not authenticated",
        success: false,
        status: 401,
      });
    }

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/get-super-admin-by-id/${superAdminId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Get Super Admin response:", response.data);

      const { superAdmin, message, success } = response.data;

      if (!success || !superAdmin) {
        throw new Error("Invalid super admin response format");
      }

      return { superAdmin, message };
    } catch (error) {
      console.error(
        "Get Super Admin Error:",
        error.response?.data || error.message
      );

      const backendError = error.response?.data;

      if (backendError) {
        return rejectWithValue({
          message: backendError.message || "Failed to fetch super admin",
          success: backendError.success || false,
          status: error.response?.status,
        });
      }

      return rejectWithValue({
        message: error.message || "Network error occurred",
        success: false,
        status: 0,
      });
    }
  }
);

/**
 * Super Admin slice managing super admin data state
 */
const superAdminSlice = createSlice({
  name: "superAdmin",
  initialState: {
    superAdmin: null,
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Clear super admin data
     */
    clearSuperAdmin: (state) => {
      state.superAdmin = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSuperAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSuperAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.superAdmin = action.payload.superAdmin;
      })
      .addCase(getSuperAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuperAdmin } = superAdminSlice.actions;
export default superAdminSlice.reducer;
