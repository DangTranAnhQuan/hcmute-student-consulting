import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, createAdminItem, updateAdminItem } from "../../redux/adminSlice";

const CONTENT_TYPES = [
  ["Article", "Bài viết"],
  ["News", "Tin tức"],
  ["Event", "Sự kiện"],
];
const STATUSES = [
  ["Draft", "Bản nháp"],
  ["Published", "Đã xuất bản"],
  ["Archived", "Lưu trữ"],
];
const EXPERTISE_OPTIONS = [
  ["Academic", "Học vụ"],
  ["Career", "Nghề nghiệp"],
  ["Mental Health", "Tâm lý"],
  ["Personal Development", "Kỹ năng cá nhân"],
  ["Financial", "Tài chính"],
];

const moduleLabels = {
  articles: "nội dung",
  faqs: "FAQ",
  counselors: "tư vấn viên",
};

const emptyArticle = {
  title: "",
  contentType: "Article",
  topic: "Academic Affairs",
  status: "Draft",
  author: "Admin",
  faculty: "HCMUTE",
  image: "",
  readTime: "5 phút",
  tags: "",
  views: "0",
  saves: "0",
  excerpt: "",
  body: "",
};

const emptyFaq = {
  question: "",
  answer: "",
  category: "Giỏ tư vấn",
  status: "Draft",
};

const emptyCounselor = {
  fullName: "",
  email: "",
  expertise: [],
  bio: "",
  image: "",
  hourlyRate: "0",
  isActive: true,
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const makeInitial = (moduleKey, editingItem) => {
  if (moduleKey === "articles") {
    return {
      ...emptyArticle,
      ...(editingItem || {}),
      tags: Array.isArray(editingItem?.tags)
        ? editingItem.tags.join(", ")
        : editingItem?.tags || "",
      views: String(editingItem?.views ?? 0),
      saves: String(editingItem?.saves ?? 0),
    };
  }
  if (moduleKey === "faqs") {
    return { ...emptyFaq, ...(editingItem || {}) };
  }
  if (moduleKey === "counselors") {
    return {
      ...emptyCounselor,
      ...(editingItem || {}),
      email: editingItem?.userEmail || editingItem?.email || "",
      expertise: toArray(editingItem?.expertise),
      hourlyRate: String(editingItem?.hourlyRate ?? 0),
      isActive:
        editingItem?.isActive === undefined
          ? true
          : Boolean(editingItem.isActive),
    };
  }
  return {};
};

const isValidHttpUrl = (value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

const Field = ({ label, children }) => (
  <label className="block text-sm font-semibold text-gray-700">
    {label}
    <div className="mt-1">{children}</div>
  </label>
);

const textClass =
  "w-full rounded-lg border border-gray-300 p-2.5 text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary";

const AdminFormModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, modalMode, activeModule, editingItem, isLoading } =
    useSelector((state) => state.admin);
  const [formData, setFormData] = React.useState(makeInitial(activeModule, editingItem));
  const [localError, setLocalError] = React.useState("");

  React.useEffect(() => {
    if (isModalOpen) {
      setFormData(makeInitial(activeModule, editingItem));
      setLocalError("");
    }
  }, [isModalOpen, activeModule, editingItem]);

  if (!isModalOpen) return null;

  const setField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleExpertise = (value) => {
    setFormData((current) => {
      const selected = toArray(current.expertise);
      return {
        ...current,
        expertise: selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value],
      };
    });
  };

  const validate = () => {
    if (activeModule === "articles") {
      if (!formData.title.trim()) return "Tiêu đề nội dung là bắt buộc";
      if (!formData.topic.trim()) return "Chủ đề nội dung là bắt buộc";
      if (!isValidHttpUrl(formData.image)) {
        return "URL ảnh nội dung phải bắt đầu bằng http hoặc https";
      }
      if (formData.status === "Published") {
        if (!formData.image.trim()) return "Nội dung xuất bản cần có ảnh đại diện";
        if (!formData.excerpt.trim()) return "Nội dung xuất bản cần có tóm tắt";
        if (!formData.body.trim()) return "Nội dung xuất bản cần có nội dung chi tiết";
      }
    }
    if (activeModule === "faqs") {
      if (!formData.question.trim()) return "Câu hỏi FAQ là bắt buộc";
      if (!formData.answer.trim()) return "Câu trả lời FAQ là bắt buộc";
      if (!formData.category.trim()) return "Danh mục FAQ là bắt buộc";
    }
    if (activeModule === "counselors") {
      if (!formData.fullName.trim()) return "Họ tên tư vấn viên là bắt buộc";
      if (modalMode === "create" && !formData.email.trim()) {
        return "Email tài khoản tư vấn viên là bắt buộc khi tạo mới";
      }
      if (toArray(formData.expertise).length === 0) {
        return "Tư vấn viên cần có ít nhất một chuyên môn";
      }
      if (!isValidHttpUrl(formData.image)) {
        return "URL ảnh tư vấn viên phải bắt đầu bằng http hoặc https";
      }
      const hourlyRate = Number(formData.hourlyRate);
      if (!Number.isFinite(hourlyRate) || hourlyRate < 0) return "Phí tư vấn không hợp lệ";
    }
    return "";
  };

  const buildPayload = () => {
    if (activeModule === "articles") {
      return {
        ...formData,
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        author: formData.author.trim() || "Admin",
        faculty: formData.faculty.trim() || "HCMUTE",
        image: formData.image.trim(),
        excerpt: formData.excerpt.trim(),
        body: formData.body.trim(),
        readTime: formData.readTime.trim() || "5 phút",
        tags: formData.tags,
        views: Number(formData.views || 0),
        saves: Number(formData.saves || 0),
      };
    }
    if (activeModule === "faqs") {
      return {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        category: formData.category.trim(),
        status: formData.status,
      };
    }
    return {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      expertise: toArray(formData.expertise),
      bio: formData.bio.trim(),
      image: formData.image.trim(),
      hourlyRate: Number(formData.hourlyRate || 0),
      isActive: Boolean(formData.isActive),
    };
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setLocalError(error);
      return;
    }

    const payload = buildPayload();
    if (modalMode === "edit") {
      dispatch(
        updateAdminItem({
          resource: activeModule,
          id: editingItem.id,
          data: payload,
        }),
      );
      return;
    }
    dispatch(createAdminItem({ resource: activeModule, data: payload }));
  };

  const renderArticleForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Tiêu đề">
          <input
            value={formData.title}
            onChange={(event) => setField("title", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Loại nội dung">
          <select
            value={formData.contentType}
            onChange={(event) => setField("contentType", event.target.value)}
            className={textClass}
          >
            {CONTENT_TYPES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Chủ đề">
          <input
            value={formData.topic}
            onChange={(event) => setField("topic", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Trạng thái">
          <select
            value={formData.status}
            onChange={(event) => setField("status", event.target.value)}
            className={textClass}
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tác giả">
          <input
            value={formData.author}
            onChange={(event) => setField("author", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Nguồn/Khoa">
          <input
            value={formData.faculty}
            onChange={(event) => setField("faculty", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="URL ảnh">
          <input
            value={formData.image}
            onChange={(event) => setField("image", event.target.value)}
            className={textClass}
            placeholder="https://..."
          />
        </Field>
        <Field label="Thời gian đọc">
          <input
            value={formData.readTime}
            onChange={(event) => setField("readTime", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Lượt xem">
          <input
            type="number"
            min="0"
            value={formData.views}
            onChange={(event) => setField("views", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Lượt lưu">
          <input
            type="number"
            min="0"
            value={formData.saves}
            onChange={(event) => setField("saves", event.target.value)}
            className={textClass}
          />
        </Field>
      </div>
      <Field label="Tags, cách nhau bằng dấu phẩy">
        <input
          value={formData.tags}
          onChange={(event) => setField("tags", event.target.value)}
          className={textClass}
        />
      </Field>
      <Field label="Tóm tắt">
        <textarea
          value={formData.excerpt}
          onChange={(event) => setField("excerpt", event.target.value)}
          rows="3"
          className={textClass}
        />
      </Field>
      <Field label="Nội dung chi tiết">
        <textarea
          value={formData.body}
          onChange={(event) => setField("body", event.target.value)}
          rows="7"
          className={textClass}
        />
      </Field>
    </>
  );

  const renderFaqForm = () => (
    <>
      <Field label="Câu hỏi">
        <input
          value={formData.question}
          onChange={(event) => setField("question", event.target.value)}
          className={textClass}
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Danh mục">
          <input
            value={formData.category}
            onChange={(event) => setField("category", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Trạng thái">
          <select
            value={formData.status}
            onChange={(event) => setField("status", event.target.value)}
            className={textClass}
          >
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Câu trả lời">
        <textarea
          value={formData.answer}
          onChange={(event) => setField("answer", event.target.value)}
          rows="7"
          className={textClass}
        />
      </Field>
    </>
  );

  const renderCounselorForm = () => (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Họ tên">
          <input
            value={formData.fullName}
            onChange={(event) => setField("fullName", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Email tài khoản">
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setField("email", event.target.value)}
            disabled={modalMode === "edit"}
            className={`${textClass} disabled:bg-gray-100 disabled:text-gray-500`}
            placeholder="ten.tuvan@hcmute.edu.vn"
          />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-700">Chuyên môn</p>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {EXPERTISE_OPTIONS.map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50"
            >
              <input
                type="checkbox"
                checked={toArray(formData.expertise).includes(value)}
                onChange={() => toggleExpertise(value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <Field label="URL ảnh đại diện">
        <input
          value={formData.image}
          onChange={(event) => setField("image", event.target.value)}
          className={textClass}
          placeholder="https://..."
        />
      </Field>
      <Field label="Giới thiệu">
        <textarea
          value={formData.bio}
          onChange={(event) => setField("bio", event.target.value)}
          rows="5"
          className={textClass}
        />
      </Field>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
        Lượt đặt, trạng thái bận/rảnh và điểm đánh giá được cập nhật tự động từ
        lịch tư vấn, yêu cầu đã hoàn tất và đánh giá của sinh viên. Admin chỉ
        quản lý hồ sơ, chuyên môn, đơn giá và trạng thái bật/tắt tư vấn viên.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Phí tư vấn">
          <input
            type="number"
            min="0"
            value={formData.hourlyRate}
            onChange={(event) => setField("hourlyRate", event.target.value)}
            className={textClass}
          />
        </Field>
        <Field label="Hoạt động">
          <select
            value={formData.isActive ? "true" : "false"}
            onChange={(event) => setField("isActive", event.target.value === "true")}
            className={textClass}
          >
            <option value="true">Đang hoạt động</option>
            <option value="false">Tạm ẩn</option>
          </select>
        </Field>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Đóng form"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => dispatch(closeModal())}
      />

      <form
        onSubmit={onSubmit}
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {modalMode === "edit" ? "Sửa" : "Tạo"} {moduleLabels[activeModule] || activeModule}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Dữ liệu lưu ở đây được dùng trực tiếp cho trang người dùng và bộ lọc tìm kiếm.
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="text-2xl leading-none text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {localError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {localError}
          </div>
        )}

        <div className="space-y-4">
          {activeModule === "articles" && renderArticleForm()}
          {activeModule === "faqs" && renderFaqForm()}
          {activeModule === "counselors" && renderCounselorForm()}
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="rounded-lg bg-gray-200 px-4 py-2 font-semibold hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {isLoading ? "Đang lưu..." : modalMode === "edit" ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFormModal;
