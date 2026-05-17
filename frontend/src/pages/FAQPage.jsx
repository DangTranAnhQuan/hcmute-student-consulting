import React from "react";
import FAQSearch from "../components/faq/FAQSearch";
import FAQAccordion from "../components/faq/FAQAccordion";
import LibraryList from "../components/faq/LibraryList";

const FAQPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          FAQ & Library
        </h1>
        <p className="text-gray-600">
          Tong hop cau hoi thuong gap va thu vien mau tai lieu de ban su dung nhanh.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FAQSearch />
          <FAQAccordion />
        </div>

        <div className="space-y-6">
          <LibraryList />
        </div>
      </div>
    </div>
  );
};

export default FAQPage;

