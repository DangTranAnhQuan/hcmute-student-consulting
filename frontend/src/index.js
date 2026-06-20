import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";
import { RealtimeNotificationProvider } from "./context/RealtimeNotificationContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RealtimeNotificationProvider>
        <App />
      </RealtimeNotificationProvider>
    </Provider>
  </React.StrictMode>,
);
