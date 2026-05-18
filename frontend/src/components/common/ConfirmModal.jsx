import React from 'react';

const ConfirmModal = ({ open, title = 'Confirm', description = '', onCancel, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg bg-danger text-white">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

