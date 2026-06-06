const Article = require("../models/Article");
const { createNotification } = require("../services/notificationHub");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=520&fit=crop";

const formatContent = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  const id = value._id.toString();

  // Format comments if they exist
  const formattedComments = (value.comments || []).map(comment => ({
    id: comment._id.toString(),
    user: comment.username,
    userId: comment.user,
    rating: comment.rating,
    content: comment.content,
    createdAt: comment.createdAt
  }));

  return {
    ...value,
    id,
    refId: id,
    image: value.image || fallbackImage,
    date: value.createdAt || value.updatedAt,
    category: value.topic,
    categoryId: value.topic,
    readTime: value.readTime || "5 phút",
    saves: value.saves || 0,
    comments: formattedComments
  };
};

const buildFilter = (query = {}) => {
  const filter = { status: "Published" };

  if (query.contentType) {
    const contentTypes = String(query.contentType)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (contentTypes.length > 0) filter.contentType = { $in: contentTypes };
  }

  if (query.topic && query.topic !== "all" && query.topic !== "All") {
    filter.topic = query.topic;
  }

  if (query.q?.trim()) {
    const regex = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$or = [
      { title: regex },
      { excerpt: regex },
      { body: regex },
      { topic: regex },
      { author: regex },
      { faculty: regex },
      { tags: regex },
    ];
  }

  return filter;
};

exports.listPublic = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const facetFilter = { status: "Published" };
    if (req.query.contentType) {
      const contentTypes = String(req.query.contentType)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (contentTypes.length > 0) facetFilter.contentType = { $in: contentTypes };
    }
    const sortBy = req.query.sortBy || "latest";
    const sort =
      sortBy === "popular"
        ? { views: -1, updatedAt: -1 }
        : sortBy === "saved"
          ? { saves: -1, updatedAt: -1 }
          : { updatedAt: -1 };

    const [items, categories, contentTypes] = await Promise.all([
      Article.find(filter).sort(sort).limit(60),
      Article.distinct("topic", facetFilter),
      Article.distinct("contentType", { status: "Published" }),
    ]);

    res.json({
      data: items.map(formatContent),
      total: items.length,
      categories: categories.filter(Boolean).sort(),
      contentTypes: contentTypes.filter(Boolean).sort(),
    });
  } catch (err) {
    console.error("[content:listPublic] server error", err);
    res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.getPublicDetail = async (req, res) => {
  try {
    const item = await Article.findOneAndUpdate(
      { _id: req.params.id, status: "Published" },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    ).populate('comments.user', 'fullName username');

    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy nội dung" });
    }

    const related = await Article.find({
      _id: { $ne: item._id },
      status: "Published",
      contentType: item.contentType,
      $or: [{ topic: item.topic }, { tags: { $in: item.tags || [] } }],
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    res.json({
      item: formatContent(item),
      related: related.map(formatContent),
    });
  } catch (err) {
    console.error("[content:getPublicDetail] server error", err);
    res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    const user = req.user;

    if (!content || !rating) {
      return res.status(400).json({ message: "Nội dung và đánh giá là bắt buộc" });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const newComment = {
      user: user._id,
      username: user.fullName || user.username,
      rating: Number(rating),
      content: String(content).trim(),
    };

    article.comments.push(newComment);
    await article.save();

    // Trigger notification using the hub
    try {
      await createNotification({
        title: "Bình luận mới",
        message: `${user.fullName || user.username} đã bình luận về bài viết "${article.title}"`,
        type: "new_comment",
        link: `/detail/article/${article._id}`,
        targetRoles: ["admin"],
        entityType: "article",
        entityId: article._id.toString()
      });
    } catch (notifErr) {
      console.error("Error creating notification via hub:", notifErr);
    }

    const updatedArticle = await Article.findById(id);
    const addedComment = updatedArticle.comments[updatedArticle.comments.length - 1];

    res.status(201).json({
      message: "Thêm bình luận thành công",
      comment: {
        id: addedComment._id.toString(),
        user: addedComment.username,
        userId: addedComment.user,
        rating: addedComment.rating,
        content: addedComment.content,
        createdAt: addedComment.createdAt
      }
    });
  } catch (err) {
    console.error("[content:addComment] server error", err);
    res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { content, rating } = req.body;
    const user = req.user;

    if (!content || !rating) {
      return res.status(400).json({ message: "Nội dung và đánh giá là bắt buộc" });
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    if (comment.user.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền sửa bình luận này" });
    }

    comment.content = String(content).trim();
    comment.rating = Number(rating);

    await article.save();

    res.json({
      message: "Cập nhật bình luận thành công",
      comment: {
        id: comment._id.toString(),
        user: comment.username,
        userId: comment.user,
        rating: comment.rating,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt
      }
    });
  } catch (err) {
    console.error("[content:updateComment] server error", err);
    res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const user = req.user;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Không tìm thấy bình luận" });
    }

    if (comment.user.toString() !== user._id.toString() && user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền xóa bình luận này" });
    }

    article.comments.pull(commentId);
    await article.save();

    res.json({ message: "Xóa bình luận thành công" });
  } catch (err) {
    console.error("[content:deleteComment] server error", err);
    res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
