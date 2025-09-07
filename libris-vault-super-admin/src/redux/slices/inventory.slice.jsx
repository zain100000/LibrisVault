/**
 * Inventory Slice (Super Admin)
 *
 * Manages inventory-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all inventories
 * - Fetch inventory by ID
 * - Delete a inventory
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   inventories: Array<Object>,      // List of inventories
 *   loading: boolean,          // Loading indicator for async actions
 *   error: string | null       // Error message from API calls
 * }
 *
 * @module inventorySlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all inventory items.
 */
export const getAllInventory = createAsyncThunk(
  "inventory/getAllInventory",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/inventory/get-all-inventory`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.inventory;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Fetch a single inventory item by ID.
 */
export const getInventoryById = createAsyncThunk(
  "inventory/getInventoryById",
  async (inventoryId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/inventory/get-inventory-by-id/${inventoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.inventory;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Delete an inventory item by ID.
 */
export const deleteInventory = createAsyncThunk(
  "inventory/deleteInventory",
  async (inventoryId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      await axios.delete(
        `${BACKEND_API_URL}/inventory/delete-inventory/${inventoryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { inventory } = getState().inventory;
      return inventory.filter((item) => item._id !== inventoryId);
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    inventory: [],
    loading: false,
    error: null,
  },
  reducers: {
    setInventory: (state, action) => {
      state.inventory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(getAllInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getInventoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInventoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(getInventoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
        state.loading = false;
      })
      .addCase(deleteInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setInventory } = inventorySlice.actions;

export default inventorySlice.reducer;
