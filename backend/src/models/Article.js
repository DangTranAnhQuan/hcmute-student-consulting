const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topic: { type: String, default: "General", trim: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    author: { type: String, default: "Admin", trim: true },
    excerpt: { type: String, default: "", trim: true },
    body: { type: String, default: "" },
    faculty: { type: String, default: "", trim: true },
    contentType: { type: String, default: "Article" },
    image: { type: String, default: "", trim: true },
    readTime: { type: String, default: "5 phút", trim: true },
    saves: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    views: { type: Number, default: 0 },
    comments: [commentSchema],
  },
  { timestamps: true },
);

articleSchema.index({ title: "text", excerpt: "text", body: "text", topic: "text" });

module.exports = mongoose.model("Article", articleSchema);
