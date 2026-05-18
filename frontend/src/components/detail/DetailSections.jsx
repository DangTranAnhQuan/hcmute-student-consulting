import React from "react";
import { Badge } from "../common/CommonUI";

export const DetailBanner = ({ item, type }) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-md">
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-64 md:h-80 object-cover"
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end text-white">
        <p className="text-sm uppercase tracking-wide mb-2">{type}</p>
        <h1 className="text-2xl md:text-4xl font-bold mb-3 max-w-4xl">
          {item.title}
        </h1>
        <p className="text-sm md:text-base text-gray-100 max-w-3xl">
          {item.excerpt}
        </p>
      </div>
    </div>
  );
};

export const DetailMeta = ({ item }) => {
  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString("vi-VN")
    : "N/A";

  const tags = item.tags || [item.category, item.author].filter(Boolean);

  return (
    <div className="bg-white rounded-xl shadow-md p-5 md:p-6">
      <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-4">
        <span>👤 {item.author || "HCMUTE"}</span>
        <span>📅 {formattedDate}</span>
        <span>⏱️ {item.readTime || "5 min"}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" size="sm">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="flex items-center gap-5 text-sm text-gray-700">
        <span>👁️ {item.views || 0} lượt xem</span>
        <span>💾 {item.saves || 0} lượt lưu</span>
      </div>
    </div>
  );
};

export const DetailContent = ({ item }) => {
  const contentStr = item.body || item.content || item.excerpt || "";
  // Kiểm tra chuỗi chứa thẻ HTML hay chỉ là text thuần xuống dòng
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(contentStr);

  return (
    <article className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Nội dung chi tiết</h2>
      <div className="prose max-w-none text-gray-700 leading-7">
        {contentStr ? (
          isHtml ? (
            <div dangerouslySetInnerHTML={{ __html: contentStr }} />
          ) : (
            <div className="space-y-4">
              {contentStr.split("\n").filter(Boolean).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          )
        ) : (
          <p className="text-gray-500 italic">Nội dung đang được cập nhật.</p>
        )}
      </div>
    </article>
  );
};

export const RelatedPosts = ({ related = [], type }) => {
  if (related.length === 0) return null;

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Bài viết liên quan</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {related.map((post) => (
          <a
            key={post.id}
            href={`/detail/${type}/${post.id}`}
            className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-32 object-cover group-hover:opacity-90"
            />
            <div className="p-3">
              <p className="font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
                {post.title}
              </p>
              <p className="text-xs text-gray-500 mt-2">👁️ {post.views || 0}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

const renderStars = (value) => {
  return "★★★★★".split("").map((star, index) => (
    <span key={`${star}-${index}`} className={index < value ? "text-yellow-500" : "text-gray-300"}>
      ★
    </span>
  ));
};

export const RatingCommentSection = ({ initialComments = [] }) => {
  const [comments, setComments] = React.useState(initialComments);
  const [newComment, setNewComment] = React.useState("");
  const [rating, setRating] = React.useState(5);

  const averageRating = comments.length
    ? (comments.reduce((sum, item) => sum + item.rating, 0) / comments.length).toFixed(1)
    : "0.0";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!newComment.trim()) return;

    const nextComment = {
      id: `local-${Date.now()}`,
      user: "Bạn",
      rating,
      content: newComment.trim(),
      createdAt: new Date(),
    };

    setComments((prev) => [nextComment, ...prev]);
    setNewComment("");
    setRating(5);
  };

  return (
    <section className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h3 className="text-xl font-bold text-gray-900">Đánh giá & Bình luận</h3>
        <div className="text-sm text-gray-700 flex items-center gap-2">
          <span className="font-semibold">{averageRating}</span>
          <span>{renderStars(Math.round(Number(averageRating)))}</span>
          <span>({comments.length})</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>Đánh giá:</span>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="text-lg"
            >
              <span className={value <= rating ? "text-yellow-500" : "text-gray-300"}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          rows={3}
          placeholder="Chia sẻ ý kiến của bạn..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Gửi bình luận
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-900">{comment.user}</p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString("vi-VN")}
              </p>
            </div>
            <div className="text-sm mb-2">{renderStars(comment.rating)}</div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};