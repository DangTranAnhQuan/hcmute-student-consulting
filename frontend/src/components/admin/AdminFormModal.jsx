import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, createItem, updateItem } from "../../redux/adminSlice";

const fieldsByModule = {
  articles: ["title", "topic", "status", "author"],
  topics: ["name", "status"],
  faqs: ["question", "category", "status"],
  schedules: ["title", "counselor", "format", "status"],
  notifications: ["title", "type", "status"],
};

const makeInitial = (moduleKey, editingItem) => {
  const fields = fieldsByModule[moduleKey] || [];
  const base = {};
  fields.forEach((key) => {
    base[key] = editingItem?.[key] || "";
  });
  return base;
};

const AdminFormModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, modalMode, activeModule, editingItem } = useSelector(
    (state) => state.admin
  );

  const [formData, setFormData] = React.useState(
    makeInitial(activeModule, editingItem)
  );

  React.useEffect(() => {
    if (isModalOpen) {
      setFormData(makeInitial(activeModule, editingItem));
    }
  }, [isModalOpen, activeModule, editingItem]);

  if (!isModalOpen) return null;

  const fields = fieldsByModule[activeModule] || [];

  const onSubmit = (event) => {
    event.preventDefault();
    if (modalMode === "edit") {
      dispatch(updateItem({ ...editingItem, ...formData }));
      return;
    }
    dispatch(createItem(formData));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => dispatch(closeModal())} />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-xl bg-white rounded-xl shadow-xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {modalMode === "edit" ? "Edit" : "Create"} {activeModule}
          </h3>
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {fields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              value={formData[field] || ""}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, [field]: event.target.value }))
              }
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
          >
            {modalMode === "edit" ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFormModal;

