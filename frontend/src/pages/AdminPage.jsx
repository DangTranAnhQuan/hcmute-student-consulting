import React from "react";
import AdminTabs from "../components/admin/AdminTabs";
import AdminToolbar from "../components/admin/AdminToolbar";
import AdminDataTable from "../components/admin/AdminDataTable";
import AdminFormModal from "../components/admin/AdminFormModal";

const AdminPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Admin CMS
        </h1>
        <p className="text-gray-600">
          Manage Articles, Topics, FAQs, Counseling Schedules, and Notifications.
        </p>
      </div>

      <AdminTabs />
      <AdminToolbar />
      <AdminDataTable />
      <AdminFormModal />
    </div>
  );
};

export default AdminPage;

