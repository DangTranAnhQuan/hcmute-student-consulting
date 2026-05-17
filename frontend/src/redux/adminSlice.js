import { createSlice } from "@reduxjs/toolkit";
import { mockCMSData } from "../utils/mockData";

const moduleOrder = ["articles", "topics", "faqs", "schedules", "notifications"];

const initialState = {
  moduleOrder,
  activeModule: "articles",
  searchQuery: "",
  data: mockCMSData,
  isModalOpen: false,
  modalMode: "create",
  editingItem: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setActiveModule: (state, action) => {
      state.activeModule = action.payload;
      state.searchQuery = "";
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    openCreateModal: (state) => {
      state.modalMode = "create";
      state.editingItem = null;
      state.isModalOpen = true;
    },
    openEditModal: (state, action) => {
      state.modalMode = "edit";
      state.editingItem = action.payload;
      state.isModalOpen = true;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.editingItem = null;
    },
    createItem: (state, action) => {
      const key = state.activeModule;
      const newItem = {
        ...action.payload,
        id: `${key.slice(0, 1)}-${Date.now()}`,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      state.data[key] = [newItem, ...state.data[key]];
      state.isModalOpen = false;
    },
    updateItem: (state, action) => {
      const key = state.activeModule;
      state.data[key] = state.data[key].map((item) =>
        item.id === action.payload.id
          ? { ...item, ...action.payload, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      );
      state.isModalOpen = false;
      state.editingItem = null;
    },
    deleteItem: (state, action) => {
      const key = state.activeModule;
      state.data[key] = state.data[key].filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  setActiveModule,
  setSearchQuery,
  openCreateModal,
  openEditModal,
  closeModal,
  createItem,
  updateItem,
  deleteItem,
} = adminSlice.actions;

export default adminSlice.reducer;

