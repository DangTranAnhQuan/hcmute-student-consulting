import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/common/Toast";

const CustomToastContext = createContext();

export const CustomToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <CustomToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[10000] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </CustomToastContext.Provider>
  );
};

export const useCustomToast = () => {
  const context = useContext(CustomToastContext);
  if (!context) {
    throw new Error("useCustomToast must be used within CustomToastProvider");
  }
  return context;
};
