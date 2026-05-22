import React from "react";

export const Header = ({ title, subtitle, backUrl }) => {
  return (
    <div className="mb-8">
      {backUrl && (
        <a
          href={backUrl}
          className="mb-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
        >
          ← Quay lại
        </a>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-gray-600">{subtitle}</p>}
    </div>
  );
};

export const Input = ({ label, error, className = "", ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-800">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-4 ${
          error
            ? "border-danger focus:border-danger focus:ring-red-100"
            : "border-gray-200 focus:border-primary focus:ring-blue-100"
        } ${className}`}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};

export const Button = ({
  children,
  variant = "primary",
  loading,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-100",
    secondary: "bg-gray-700 hover:bg-gray-800 text-white",
    danger: "bg-danger hover:bg-red-600 text-white",
    outline:
      "bg-white border border-blue-200 text-blue-700 hover:bg-blue-50",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full rounded-xl px-4 py-3 text-sm font-bold transition ${variants[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {loading ? "Đang xử lý..." : children}
    </button>
  );
};

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-6 shadow-xl shadow-slate-200/70 ${className}`}>
      {children}
    </div>
  );
};

export const Alert = ({ type = "info", message }) => {
  const typeStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div className={`rounded-xl border-l-4 p-4 text-sm ${typeStyles[type]}`}>
      {message}
    </div>
  );
};

export const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const Link = ({ to, children, ...props }) => {
  return (
    <a
      href={to}
      {...props}
      className={`text-primary hover:text-primary-dark underline ${props.className || ""}`}
    >
      {children}
    </a>
  );
};
