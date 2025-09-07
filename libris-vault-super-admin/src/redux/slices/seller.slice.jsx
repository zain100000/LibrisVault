/**
 * Seller Slice (Super Admin)
 *
 * Manages seller-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all sellers
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   sellers: Array<Object>,  // List of sellers
 *   loading: boolean,        // Loading indicator for async actions
 *   error: string | null     // Error message from API calls
 * }
 *
 * @module sellerSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all sellers.
 */
export const getSellers = createAsyncThunk(
  "sellers/getSellers",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/super-admin/get-all-sellers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.sellers;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const sellerSlice = createSlice({
  name: "sellers",
  initialState: {
    sellers: [],
    loading: false,
    error: null,
  },
  reducers: {
    setSellers: (state, action) => {
      state.sellers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload;
      })
      .addCase(getSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSellers } = sellerSlice.actions;

export default sellerSlice.reducer;
