/**
 * Book Slice (Super Admin)
 *
 * Manages book-related state and async actions in the Redux store.
 *
 * Super Admin Permissions:
 * - Fetch all books
 * - Fetch book by ID
 * - Delete a book
 *
 * Integrates with a backend API using Axios, with authentication
 * handled via Bearer token stored in localStorage.
 *
 * State Shape:
 * {
 *   books: Array<Object>,      // List of books
 *   loading: boolean,          // Loading indicator for async actions
 *   error: string | null       // Error message from API calls
 * }
 *
 * @module bookSlice
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import CONFIG from "../config/Config.config";

const { BACKEND_API_URL } = CONFIG;

const getToken = () => localStorage.getItem("authToken");

/**
 * Fetch all books.
 */
export const getAllBooks = createAsyncThunk(
  "books/getAllBooks",
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/inventory/book/get-all-books`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.books;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Fetch a single book by ID.
 */
export const getBookById = createAsyncThunk(
  "books/getBookById",
  async (bookId, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      const response = await axios.get(
        `${BACKEND_API_URL}/inventory/get-book-by-id/${bookId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.book;
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

/**
 * Delete a book by ID.
 */
export const deleteBook = createAsyncThunk(
  "books/deleteBook",
  async (bookId, { getState, rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue("Admin is not authenticated.");

    try {
      await axios.delete(`${BACKEND_API_URL}/inventory/delete-book/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { books } = getState().books;
      return books.filter((book) => book._id !== bookId);
    } catch (error) {
      return rejectWithValue(error.response?.data || "An error occurred.");
    }
  }
);

const bookSlice = createSlice({
  name: "books",
  initialState: {
    books: [],
    loading: false,
    error: null,
  },
  reducers: {
    setBooks: (state, action) => {
      state.books = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(getAllBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getBookById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookById.fulfilled, (state, action) => {
        state.loading = false;
        state.books = action.payload;
      })
      .addCase(getBookById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.books = action.payload;
        state.loading = false;
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setBooks } = bookSlice.actions;

export default bookSlice.reducer;
