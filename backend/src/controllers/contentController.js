const Article = require("../models/Article");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=520&fit=crop";

const formatContent = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  const id = value._id.toString();

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
      { returnDocument: "after" },
    );

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
