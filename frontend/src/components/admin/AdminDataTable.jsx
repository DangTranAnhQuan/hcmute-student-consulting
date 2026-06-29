import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openEditModal, deleteAdminItem, setPage } from "../../redux/adminSlice";
import UserTable from "./UserTable";
import SystemSettingsForm from "./SystemSettingsForm";
import ConfirmModal from "../common/ConfirmModal";

const statusLabels = {
  Draft: "Bản nháp",
  Published: "Đã xuất bản",
  Archived: "Lưu trữ",
};

const contentTypeLabels = {
  Article: "Bài viết",
  News: "Tin tức",
  Event: "Sự kiện",
};

const moduleEmptyLabels = {
  articles: "Chưa có bài viết, tin tức hoặc sự kiện.",
  faqs: "Chưa có câu hỏi FAQ.",
  counselors: "Chưa có tư vấn viên.",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value) => {
  if (!value) return "Chưa có lịch sắp tới";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const getSnippet = (value, maxLength = 180) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const getPageNumbers = (currentPage, totalPages) => {
  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-tight ${className}`}
  >
    {children}
  </span>
);

const MetaItem = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="min-w-0 rounded-lg bg-gray-50 px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-medium text-gray-800">{value}</div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const style =
    status === "Published"
      ? "border-green-200 bg-green-50 text-green-700"
      : status === "Archived"
        ? "border-gray-200 bg-gray-50 text-gray-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return <Badge className={style}>{statusLabels[status] || status || "Chưa rõ"}</Badge>;
};

const ActiveBadge = ({ isActive }) => (
  <Badge
    className={
      isActive
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-gray-200 bg-gray-50 text-gray-700"
    }
  >
    {isActive ? "Đang hoạt động" : "Tạm ẩn"}
  </Badge>
);

const CurrentStatusBadge = ({ status, label }) => {
  const style =
    status === "busy"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "inactive"
        ? "border-gray-200 bg-gray-50 text-gray-700"
        : "border-green-200 bg-green-50 text-green-700";

  return <Badge className={style}>{label || "Đang rảnh"}</Badge>;
};

const RowActions = ({ row, onDelete }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
      <button
        type="button"
        onClick={() => dispatch(openEditModal(row))}
        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
      >
        Sửa
      </button>
      <button
        type="button"
        onClick={() => onDelete(row)}
        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
      >
        Xóa
      </button>
    </div>
  );
};

const ArticleCard = ({ row, onDelete }) => {
  const summary = getSnippet(row.excerpt || row.body || row.content);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge className="border-blue-200 bg-blue-50 text-blue-700">
              {contentTypeLabels[row.contentType] || row.contentType || "Nội dung"}
            </Badge>
            <StatusBadge status={row.status} />
          </div>
          <h3 className="break-words text-base font-bold leading-6 text-gray-950">
            {row.title || "Chưa có tiêu đề"}
          </h3>
          {summary && <p className="mt-2 break-words text-sm leading-6 text-gray-600">{summary}</p>}
        </div>
        <RowActions row={row} onDelete={onDelete} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Chủ đề" value={row.topic || "Chưa phân loại"} />
        <MetaItem label="Tác giả" value={row.author || "Ban tư vấn"} />
        <MetaItem label="Cập nhật" value={formatDate(row.updatedAt)} />
        <MetaItem label="Lượt xem / lưu" value={`${Number(row.views || 0)} / ${Number(row.saves || 0)}`} />
      </div>
    </article>
  );
};

const FaqCard = ({ row, onDelete }) => (
  <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-2">
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
            {row.category || "FAQ"}
          </Badge>
          <StatusBadge status={row.status} />
        </div>
        <h3 className="break-words text-base font-bold leading-6 text-gray-950">
          {row.question || "Chưa có câu hỏi"}
        </h3>
        {row.answer && (
          <p className="mt-2 break-words text-sm leading-6 text-gray-600">
            {getSnippet(row.answer, 220)}
          </p>
        )}
      </div>
      <RowActions row={row} onDelete={onDelete} />
    </div>

    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <MetaItem label="Danh mục" value={row.category || "Chung"} />
      <MetaItem label="Trạng thái" value={statusLabels[row.status] || row.status || "Chưa rõ"} />
      <MetaItem label="Cập nhật" value={formatDate(row.updatedAt)} />
    </div>
  </article>
);

const CounselorCard = ({ row, onDelete }) => {
  const expertise = Array.isArray(row.expertise)
    ? row.expertise.join(", ")
    : row.expertise || "Chưa cập nhật chuyên môn";

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-3">
          {row.image && (
            <img
              src={row.image}
              alt={row.fullName || "Tư vấn viên"}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          )}
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap gap-2">
              <ActiveBadge isActive={row.isActive} />
              <CurrentStatusBadge
                status={row.currentStatus}
                label={row.currentStatusLabel}
              />
              <Badge className="border-purple-200 bg-purple-50 text-purple-700">
                {formatCurrency(row.hourlyRate)}
              </Badge>
            </div>
            <h3 className="break-words text-base font-bold leading-6 text-gray-950">
              {row.fullName || "Chưa có tên tư vấn viên"}
            </h3>
            {row.userEmail && (
              <p className="mt-1 break-all text-sm text-gray-500">{row.userEmail}</p>
            )}
            {row.bio && (
              <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                {getSnippet(row.bio, 180)}
              </p>
            )}
          </div>
        </div>
        <RowActions row={row} onDelete={onDelete} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetaItem label="Chuyên môn" value={expertise} />
        <MetaItem
          label="Đánh giá tự động"
          value={`${Number(row.rating || 0).toFixed(1)}/5 (${Number(row.reviewCount || 0)} lượt)`}
        />
        <MetaItem label="Lượt đặt tự động" value={Number(row.totalBookings || 0)} />
        <MetaItem label="Lịch sắp tới" value={formatDateTime(row.nextBookingAt)} />
      </div>
    </article>
  );
};

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="text-sm text-gray-600">
        Hiển thị trang <span className="font-semibold text-gray-900">{currentPage}</span> trên{" "}
        <span className="font-semibold text-gray-900">{totalPages}</span> bài viết
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>

        {pageNumbers[0] > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              1
            </button>
            {pageNumbers[0] > 2 && <span className="px-1 text-gray-400">...</span>}
          </>
        )}

        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              pageNumber === currentPage
                ? "bg-blue-600 text-white"
                : "border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-700"
            }`}
          >
            {pageNumber}
          </button>
        ))}

        {pageNumbers[pageNumbers.length - 1] < totalPages && (
          <>
            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
              <span className="px-1 text-gray-400">...</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

const AdminDataTable = () => {
  const dispatch = useDispatch();
  const { activeModule, data, searchQuery, pagination, isLoading, error } = useSelector(
    (state) => state.admin,
  );
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = data[activeModule] || [];
  const currentPagination = pagination[activeModule] || { page: 1, totalPages: 1, totalItems: 0 };

  const onPageChange = (newPage) => {
    dispatch(setPage({ resource: activeModule, page: newPage }));
  };

  const removeRow = (row) => {
    setDeleteTarget(row);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      dispatch(deleteAdminItem({ resource: activeModule, id: deleteTarget.id }));
      setDeleteTarget(null);
    }
  };

  const renderRow = (row) => {
    if (activeModule === "faqs") {
      return <FaqCard key={row.id} row={row} onDelete={removeRow} />;
    }
    if (activeModule === "counselors") {
      return <CounselorCard key={row.id} row={row} onDelete={removeRow} />;
    }
    return <ArticleCard key={row.id} row={row} onDelete={removeRow} />;
  };

  if (activeModule === "users") {
    return (
      <section className="rounded-xl bg-white p-4 shadow-md sm:p-5">
        <UserTable />
      </section>
    );
  }

  if (activeModule === "settings") {
    return (
      <section className="rounded-xl bg-white p-4 shadow-md sm:p-5">
        <SystemSettingsForm />
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-md sm:p-5">
      {isLoading && !error && (
        <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Đang tải dữ liệu...
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          {moduleEmptyLabels[activeModule] || "Chưa có dữ liệu."}
        </div>
      ) : (
        <>
          <div className="space-y-3">{rows.map(renderRow)}</div>
          <Pagination
            currentPage={currentPagination.page}
            totalPages={currentPagination.totalPages}
            totalItems={currentPagination.totalItems}
            onPageChange={onPageChange}
          />
        </>
      )}

      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Xác nhận xóa"
          message={`Bạn có chắc chắn muốn xóa "${deleteTarget.title || deleteTarget.question || deleteTarget.fullName || "bản ghi này"}"?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Xóa ngay"
          cancelText="Hủy"
          type="danger"
        />
      )}
    </section>
  );
};

export default AdminDataTable;
