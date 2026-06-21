import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";
import { RealtimeNotificationProvider } from "./context/RealtimeNotificationContext";
import { CustomToastProvider } from "./context/CustomToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomToastProvider>
        <RealtimeNotificationProvider>
          <App />
        </RealtimeNotificationProvider>
      </CustomToastProvider>
    </Provider>
  </React.StrictMode>,
);
