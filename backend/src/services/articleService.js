const Article = require("../models/Article");

exports.getTop10Articles = async () => {
  return Article.find({ status: "Published" })
    .sort({ views: -1, createdAt: -1 })
    .limit(10);
};

exports.getSuggestions = async (userId) => {
  // Simple logic for now: latest published articles not already viewed/favorited could be complex
  // Let's just return 5 random published articles for now
  return Article.find({ status: "Published" })
    .sort({ createdAt: -1 })
    .limit(5);
};
