/**
 * Store Slice (Super Admin)
 *
 * Manages store-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch store by ID
 * - Fetch all stores
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   store: Object | null,     // Single store details
 *   stores: Array<Object>,    // All stores list
 *   loading: boolean,         // Loading indicator for async actions
 *   error: string | null      // Error message from API calls
 * }
 *
 * @module storeSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all stores.
 */
export const getAllStores = createAsyncThunk(
  "store/getAllStores",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/store/get-all-stores`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.stores;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Fetch a store by ID.
 */
export const getStoreById = createAsyncThunk(
  "store/getStoreById",
  async (storeId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/store/get-store-by-id/${storeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.store;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const storeSlice = createSlice({
  name: "store",
  initialState: {
    store: null,
    stores: [], // <-- added for all stores
    loading: false,
    error: null,
  },
  reducers: {
    clearStore: (state) => {
      state.store = null;
    },
    clearStores: (state) => {
      state.stores = [];
    },
  },
  extraReducers: (builder) => {
    builder

      // Get All Stores
      .addCase(getAllStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(getAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Store by ID
      .addCase(getStoreById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStoreById.fulfilled, (state, action) => {
        state.loading = false;
        state.store = action.payload;
      })
      .addCase(getStoreById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearStore, clearStores } = storeSlice.actions;

export default storeSlice.reducer;
