import React from "react";

const LibraryList = () => {
  const sampleLibraries = [
    {
      id: 1,
      title: "Mẫu đơn xin học bổng",
      description: "Mẫu đơn tham khảo cho sinh viên xin học bổng",
    },
    {
      id: 2,
      title: "Hướng dẫn đăng ký học phần",
      description: "Tài liệu hỗ trợ quy trình đăng ký học phần tại trường",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-5">
      <h3 className="text-lg font-bold mb-3">Thư viện mẫu tài liệu</h3>
      <ul className="space-y-3 text-sm text-gray-700">
        {sampleLibraries.map((lib) => (
          <li key={lib.id} className="border border-gray-100 rounded p-3">
            <div className="font-semibold text-gray-900">{lib.title}</div>
            <div className="text-gray-600">{lib.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LibraryList;
