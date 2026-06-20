const Article = require("../models/Article");
const FAQ = require("../models/FAQ");
const Counselor = require("../models/Counselor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { attachCounselorStats } = require("../services/counselorStatsService");
const { createNotification } = require("../services/notificationHub");
const { paginate } = require("../utils/paginationHelper");

const DEFAULT_ADMIN_CREATED_PASSWORD = "123456";
const CONTENT_TYPES = ["Article", "News", "Event"];
const PUBLISH_STATUSES = ["Draft", "Published", "Archived"];
const FAQ_STATUSES = ["Draft", "Published", "Archived"];
const COUNSELOR_EXPERTISE = [
  "Academic",
  "Career",
  "Mental Health",
  "Personal Development",
  "Financial",
];

const normalizeExpertise = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  return !["false", "0", "no", "off"].includes(String(value).toLowerCase());
};

const normalizeTags = (value) => {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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

const asNonNegativeNumber = (value, fieldLabel) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number) || number < 0) {
    const error = new Error(`${fieldLabel} phải là số không âm`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

const assertRequired = (value, message) => {
  if (!String(value || "").trim()) {
    const error = new Error(message);
    error.statusCode = 400;
    throw error;
  }
};

const slugify = (value = "counselor") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "counselor";

const resourceConfig = {
  articles: {
    model: Article,
    searchable: [
      "title",
      "topic",
      "status",
      "author",
      "excerpt",
      "body",
      "faculty",
      "contentType",
      "tags",
    ],
    fields: [
      "title",
      "topic",
      "status",
      "author",
      "excerpt",
      "body",
      "faculty",
      "contentType",
      "image",
      "readTime",
      "tags",
      "views",
      "saves",
    ],
  },
  faqs: {
    model: FAQ,
    searchable: ["question", "answer", "category", "status"],
    fields: ["question", "answer", "category", "status"],
  },
  counselors: {
    model: Counselor,
    searchable: ["fullName", "bio", "expertise"],
    fields: [
      "fullName",
      "expertise",
      "bio",
      "image",
      "hourlyRate",
      "isActive",
    ],
    populate: "userId",
  },
};

const getConfig = (resource) => resourceConfig[resource];

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pickAllowedFields = (body, fields) =>
  fields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});

const formatDate = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const formatDoc = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id.toString(),
    tags: Array.isArray(value.tags) ? value.tags.join(", ") : value.tags,
    expertise: Array.isArray(value.expertise) ? value.expertise.join(", ") : value.expertise,
    userEmail: value.userId?.email || "",
    updatedAt: formatDate(value.updatedAt || value.createdAt),
  };
};

const buildSearch = (fields, query) => {
  const keyword = query?.trim();
  if (!keyword) return {};

  const regex = new RegExp(escapeRegex(keyword), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

const normalizeArticlePayload = (payload) => {
  if (payload.title !== undefined) payload.title = String(payload.title).trim();
  if (payload.topic !== undefined) payload.topic = String(payload.topic).trim();
  if (payload.author !== undefined) payload.author = String(payload.author).trim();
  if (payload.faculty !== undefined) payload.faculty = String(payload.faculty).trim();
  if (payload.excerpt !== undefined) payload.excerpt = String(payload.excerpt).trim();
  if (payload.body !== undefined) payload.body = String(payload.body).trim();
  if (payload.image !== undefined) payload.image = String(payload.image).trim();
  if (payload.readTime !== undefined) payload.readTime = String(payload.readTime).trim();
  if (payload.tags !== undefined) payload.tags = normalizeTags(payload.tags);
  if (payload.views !== undefined) payload.views = asNonNegativeNumber(payload.views, "Lượt xem");
  if (payload.saves !== undefined) payload.saves = asNonNegativeNumber(payload.saves, "Lượt lưu");

  payload.status = payload.status || "Draft";
  payload.contentType = payload.contentType || "Article";
  payload.author = payload.author || "Admin";
  payload.faculty = payload.faculty || "HCMUTE";
  payload.readTime = payload.readTime || "5 phút";

  assertRequired(payload.title, "Tiêu đề nội dung là bắt buộc");
  assertRequired(payload.topic, "Chủ đề nội dung là bắt buộc");
  if (!CONTENT_TYPES.includes(payload.contentType)) {
    const error = new Error("Loại nội dung không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  if (!PUBLISH_STATUSES.includes(payload.status)) {
    const error = new Error("Trạng thái xuất bản không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  if (!isValidHttpUrl(payload.image)) {
    const error = new Error("URL ảnh nội dung phải bắt đầu bằng http hoặc https");
    error.statusCode = 400;
    throw error;
  }
  if (payload.status === "Published") {
    assertRequired(payload.excerpt, "Nội dung Published cần có tóm tắt");
    assertRequired(payload.body, "Nội dung Published cần có phần nội dung chi tiết");
    assertRequired(payload.image, "Nội dung Published cần có ảnh đại diện");
  }
  return payload;
};

const normalizeFaqPayload = (payload) => {
  if (payload.question !== undefined) payload.question = String(payload.question).trim();
  if (payload.answer !== undefined) payload.answer = String(payload.answer).trim();
  if (payload.category !== undefined) payload.category = String(payload.category).trim();
  payload.status = payload.status || "Draft";

  assertRequired(payload.question, "Câu hỏi FAQ là bắt buộc");
  assertRequired(payload.answer, "Câu trả lời FAQ là bắt buộc");
  assertRequired(payload.category, "Danh mục FAQ là bắt buộc");
  if (!FAQ_STATUSES.includes(payload.status)) {
    const error = new Error("Trạng thái FAQ không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  return payload;
};

const normalizeCounselorPayload = (payload, body = {}) => {
  if (payload.fullName !== undefined) payload.fullName = String(payload.fullName).trim();
  if (payload.bio !== undefined) payload.bio = String(payload.bio).trim();
  if (payload.image !== undefined) payload.image = String(payload.image).trim();
  payload.expertise = normalizeExpertise(payload.expertise);
  payload.hourlyRate = asNonNegativeNumber(payload.hourlyRate, "Phí tư vấn");
  payload.isActive = normalizeBoolean(payload.isActive);
  delete payload.rating;
  delete payload.totalBookings;

  assertRequired(payload.fullName, "Họ tên tư vấn viên là bắt buộc");
  if (payload.expertise.length === 0) {
    const error = new Error("Tư vấn viên cần có ít nhất một chuyên môn");
    error.statusCode = 400;
    throw error;
  }
  const invalidExpertise = payload.expertise.find(
    (item) => !COUNSELOR_EXPERTISE.includes(item),
  );
  if (invalidExpertise) {
    const error = new Error(`Chuyên môn không hợp lệ: ${invalidExpertise}`);
    error.statusCode = 400;
    throw error;
  }
  if (!isValidHttpUrl(payload.image)) {
    const error = new Error("URL ảnh tư vấn viên phải bắt đầu bằng http hoặc https");
    error.statusCode = 400;
    throw error;
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) {
    const error = new Error("Email tài khoản tư vấn viên không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  return payload;
};

const normalizeResourcePayload = (resource, payload, body = {}) => {
  if (resource === "articles") return normalizeArticlePayload(payload);
  if (resource === "faqs") return normalizeFaqPayload(payload);
  if (resource === "counselors") return normalizeCounselorPayload(payload, body);
  return payload;
};

exports.list = async (req, res) => {
  try {
    const { resource } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const filter = buildSearch(config.searchable, req.query.q);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await paginate(config.model, filter, {
      page,
      limit,
      populate: config.populate,
      sort: { updatedAt: -1 }
    });

    let rows = result.data;
    if (resource === "counselors") {
      rows = await attachCounselorStats(rows);
    }

    return res.json({
      data: rows.map(formatDoc),
      pagination: result.pagination
    });
  } catch (err) {
    console.error("[admin:list] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { resource } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const payload = normalizeResourcePayload(
      resource,
      pickAllowedFields(req.body, config.fields),
      req.body,
    );

    if (resource === "counselors") {
      const email =
        req.body.email ||
        `${slugify(payload.fullName)}.${Date.now()}@hcmute.edu.vn`;
      const username = slugify(email.split("@")[0]);
      const password = await bcrypt.hash(
        req.body.password || DEFAULT_ADMIN_CREATED_PASSWORD,
        10,
      );
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            fullName: payload.fullName,
            updatedAt: new Date(),
          },
          $setOnInsert: {
            username,
            email,
            password,
            role: "user",
            isActivated: true,
          },
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );

      const existingCounselor = await Counselor.findOne({ userId: user._id });
      if (existingCounselor) {
        const error = new Error("Email này đã gắn với một tư vấn viên khác");
        error.statusCode = 400;
        throw error;
      }

      payload.userId = user._id;
    }

    const created = await config.model.create(payload);

    await createNotification({
      targetRoles: ["user", "admin"],
      type: `content-${resource.slice(0, -1)}`,
      title:
        resource === "counselors"
          ? `Tư vấn viên mới: ${created.fullName}`
          : resource === "faqs"
            ? `FAQ mới: ${created.question}`
            : `Nội dung mới: ${created.title}`,
      message:
        resource === "counselors"
          ? "Một tư vấn viên mới đã được thêm vào hệ thống."
          : resource === "faqs"
            ? "Có FAQ mới phục vụ sinh viên."
            : `Có ${created.contentType || "nội dung"} mới vừa được xuất bản hoặc cập nhật.`,
      link:
        resource === "counselors"
          ? `/book-counselor/${created._id}`
          : resource === "faqs"
            ? "/faq"
            : `/detail/${created.contentType === "Event" ? "event" : created.contentType === "News" ? "news" : "article"}/${created._id}`,
      entityType: resource,
      entityId: String(created._id),
      metadata: { resource, status: created.status },
    });

    return res.status(201).json(formatDoc(created));
  } catch (err) {
    console.error("[admin:create] server error", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.statusCode ? err.message : "Lỗi server", details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const existing = await config.model.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    const payload = normalizeResourcePayload(
      resource,
      {
        ...existing.toObject(),
        ...pickAllowedFields(req.body, config.fields),
      },
      req.body,
    );
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    payload.updatedAt = new Date();

    const updated = await config.model.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (resource === "counselors" && updated.userId) {
      await User.findByIdAndUpdate(updated.userId, {
        fullName: updated.fullName,
        updatedAt: new Date(),
      });
    }

    return res.json(formatDoc(updated));
  } catch (err) {
    console.error("[admin:update] server error", err);
    return res
      .status(err.statusCode || 500)
      .json({ message: err.statusCode ? err.message : "Lỗi server", details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const removed = await config.model.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    return res.json({ message: "Đã xóa thành công", id });
  } catch (err) {
    console.error("[admin:remove] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
