import React from "react";
import { useDispatch, useSelector } from "react-redux";
import FAQSearch from "../components/faq/FAQSearch";
import FAQAccordion from "../components/faq/FAQAccordion";
import LibraryList from "../components/faq/LibraryList";
import { fetchFAQs } from "../redux/faqSlice";

const FAQPage = () => {
  const dispatch = useDispatch();
  const { selectedCategory, query, error } = useSelector((state) => state.faq);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchFAQs({ category: selectedCategory, q: query }));
    }, 250);

    return () => clearTimeout(timer);
  }, [dispatch, selectedCategory, query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Câu hỏi thường gặp
        </h1>
        <p className="text-gray-600">
          Tra cứu nhanh các câu hỏi và câu trả lời đã được quản trị viên xuất bản.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Layout Grid 2 phần: Bên trái là Tìm kiếm & Hỏi đáp, Bên phải là Thư viện mẫu tài liệu */}
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