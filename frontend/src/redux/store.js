import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import dashboardReducer from "./dashboardSlice";
import newsReducer from "./newsSlice";
import searchReducer from "./searchSlice";
import faqReducer from "./faqSlice";
import adminReducer from "./adminSlice";
import forumReducer from "./forumSlice";
import scheduleReducer from "./scheduleSlice";
import adminUserReducer from "./adminUserSlice";
import systemSettingsReducer from "./systemSettingsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    news: newsReducer,
    search: searchReducer,
    faq: faqReducer,
    admin: adminReducer,
    forum: forumReducer,
    schedule: scheduleReducer,
    adminUser: adminUserReducer,
    systemSettings: systemSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Tắt kiểm tra serializable
    }),
});

export default store;
