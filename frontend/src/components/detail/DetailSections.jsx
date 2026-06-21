import React, { useState } from "react";
import { Badge } from "../common/CommonUI";
import { contentAPI } from "../../services/api";
import { useAuth } from "../../redux/hooks";
import ConfirmModal from "../common/ConfirmModal";
import { useCustomToast } from "../../context/CustomToastContext";

export const DetailBanner = ({ item, type }) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=640&fit=crop";

  return (
    <div className="relative rounded-xl overflow-hidden shadow-md">
      <img
        src={item.image}
        alt={item.title}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = fallbackImage;
        }}
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
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=320&fit=crop";
              }}
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

export const RatingCommentSection = ({ articleId, initialComments = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useCustomToast();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [deleteCommentId, setDeleteCommentId] = useState(null);

  const averageRating = comments.length
    ? (comments.reduce((sum, item) => sum + item.rating, 0) / comments.length).toFixed(1)
    : "0.0";

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!isAuthenticated) {
      setError("Bạn cần đăng nhập để bình luận.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await contentAPI.addComment(articleId, {
        content: newComment.trim(),
        rating,
      });

      setComments((prev) => [response.data.comment, ...prev]);
      setNewComment("");
      setRating(5);
    } catch (err) {
      setError(err.message || "Không thể gửi bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditRating(comment.rating);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
    setEditRating(5);
  };

  const handleUpdateComment = async (commentId) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await contentAPI.updateComment(articleId, commentId, {
        content: editContent.trim(),
        rating: editRating,
      });

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? response.data.comment : c))
      );
      setEditingCommentId(null);
      showToast("Cập nhật bình luận thành công!");
    } catch (err) {
      setError(err.message || "Không thể cập nhật bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const confirmDeleteComment = async () => {
    if (!deleteCommentId) return;
    setIsSubmitting(true);
    setError("");

    try {
      await contentAPI.deleteComment(articleId, deleteCommentId);
      setComments((prev) => prev.filter((c) => c.id !== deleteCommentId));
      showToast("Đã xóa bình luận.");
    } catch (err) {
      setError(err.message || "Không thể xóa bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
      setDeleteCommentId(null);
    }
  };

  const canEditOrDelete = (commentUserId) => {
    if (!isAuthenticated || !user) return false;
    return user._id === commentUserId || user.role === "admin";
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
          placeholder={isAuthenticated ? "Chia sẻ ý kiến của bạn..." : "Vui lòng đăng nhập để bình luận"}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
          disabled={!isAuthenticated || isSubmitting}
        />

        {error && !editingCommentId && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg font-semibold transition disabled:bg-gray-400"
          disabled={!isAuthenticated || isSubmitting}
        >
          {isSubmitting && !editingCommentId ? "Đang gửi..." : "Gửi bình luận"}
        </button>
      </form>

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
            {editingCommentId === comment.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Sửa đánh giá:</span>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEditRating(value)}
                      className="text-lg"
                    >
                      <span className={value <= editRating ? "text-yellow-500" : "text-gray-300"}>★</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={editContent}
                  onChange={(event) => setEditContent(event.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
                {error && editingCommentId === comment.id && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={isSubmitting}
                    className="bg-primary text-white px-3 py-1 rounded text-sm disabled:bg-gray-400"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm disabled:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-semibold text-gray-900">{comment.user}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      {comment.createdAt !== comment.updatedAt && " (đã sửa)"}
                    </p>
                  </div>
                  {canEditOrDelete(comment.userId) && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(comment)}
                        className="text-blue-600 text-sm hover:underline"
                        disabled={isSubmitting}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-600 text-sm hover:underline"
                        disabled={isSubmitting}
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-sm mb-2">{renderStars(comment.rating)}</div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={!!deleteCommentId}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
        onConfirm={confirmDeleteComment}
        onCancel={() => setDeleteCommentId(null)}
        confirmText="Xóa ngay"
        cancelText="Hủy"
        type="danger"
      />
    </section>
  );
};
