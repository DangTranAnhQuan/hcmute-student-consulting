import React from "react";

export const Badge = ({ children, variant = "primary", size = "md" }) => {
  const variants = {
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs font-semibold rounded",
    md: "px-3 py-1 text-sm font-semibold rounded",
    lg: "px-4 py-2 text-base font-semibold rounded-lg",
  };

  return (
    <span className={`${variants[variant]} ${sizes[size]} inline-block`}>
      {children}
    </span>
  );
};

export const Chip = ({ label, onClose, variant = "secondary" }) => {
  const variants = {
    primary: "bg-blue-50 text-blue-700 border border-blue-200",
    secondary: "bg-gray-50 text-gray-700 border border-gray-200",
    success: "bg-green-50 text-green-700 border border-green-200",
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${variants[variant]}`}>
      <span className="text-sm font-medium">{label}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs hover:opacity-70 ml-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const Accordion = ({ items }) => {
  const [expanded, setExpanded] = React.useState(0);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === idx ? -1 : idx)}
            className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center"
          >
            <span className="font-semibold text-gray-900">{item.title}</span>
            <span className={`transition-transform ${expanded === idx ? "rotate-180" : ""}`}>
              ▼
            </span>
          </button>
          {expanded === idx && (
            <div className="px-4 py-3 bg-white text-gray-700">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`relative bg-white rounded-lg shadow-lg ${sizes[size]} mx-4`}>
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
      >
        ← Trước
      </button>

      {currentPage > 3 && (
        <>
          <button onClick={() => onPageChange(1)} className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100">
            1
          </button>
          {currentPage > 4 && <span className="px-2">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-2 rounded ${currentPage === page ? "bg-primary text-white" : "border border-gray-300 hover:bg-gray-100"}`}
        >
          {page}
        </button>
      ))}

      {currentPage < totalPages - 2 && (
        <>
          {currentPage < totalPages - 3 && <span className="px-2">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-100">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 border border-gray-300 rounded disabled:opacity-50"
      >
        Tiếp →
      </button>
    </div>
  );
};

export const Tag = ({ label, variant = "default", closable = false, onClose }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };

  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-sm font-medium ${variants[variant]}`}>
      {label}
      {closable && (
        <button onClick={onClose} className="hover:opacity-70">
          ✕
        </button>
      )}
    </span>
  );
};

export default {
  Badge,
  Chip,
  Accordion,
  Modal,
  Pagination,
  Tag,
};

