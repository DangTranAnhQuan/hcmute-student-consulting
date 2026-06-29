import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Spinner } from "../components/UI";
import { contentAPI, authAPI } from "../services/api";
import { useAuth } from "../redux/hooks";
import { updateProfileSuccess } from "../redux/authSlice";

const categoryMeta = {
  "Academic Affairs": { icon: "📚", label: "Academic Affairs" },
  Scholarships: { icon: "🎓", label: "Scholarships" },
  Internships: { icon: "💼", label: "Internships" },
  Jobs: { icon: "🚀", label: "Jobs" },
  "Soft Skills": { icon: "🎯", label: "Soft Skills" },
  "Student Psychology": { icon: "🧠", label: "Student Psychology" },
  "Training Regulations": { icon: "📋", label: "Training Regulations" },
  Career: { icon: "🧭", label: "Career" },
  Financial: { icon: "💳", label: "Financial" },
  "Giỏ tư vấn": { icon: "🛒", label: "Giỏ tư vấn" },
  "Thanh toán": { icon: "💰", label: "Thanh toán" },
  "Theo dõi yêu cầu": { icon: "📌", label: "Theo dõi yêu cầu" },
};

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=520&fit=crop";

const GRID_PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 6;

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const ArticlesPage = () => {
  const dispatch = useDispatch();
  const { user, getProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [filters, setFilters] = useState({
    q: "",
    topic: "",
    sortBy: "latest",
  });
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;

  const favoriteArticleIds = useMemo(() =>
    (user?.favoriteArticles || []).map(a => {
      const id = typeof a === 'string' ? a : (a._id || a.id);
      return id ? String(id) : '';
    })
  , [user]);

  const viewedArticles = useMemo(() =>
    (user?.recentlyViewedArticles || [])
  , [user]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await contentAPI.suggestions();
        setSuggestions(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };
    if (user) fetchSuggestions();
  }, [user]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    try {
      let res;
      if (favoriteArticleIds.includes(id)) {
        res = await authAPI.removeFavoriteArticle(id);
      } else {
        res = await authAPI.addFavoriteArticle(id);
      }

      if (res.data.user) {
        // Cập nhật Redux ngay lập tức để ProfilePage thấy dữ liệu mới
        dispatch(updateProfileSuccess(res.data.user));
      }
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contentAPI.list({
        contentType: "Article",
        q: filters.q,
        topic: filters.topic,
        sortBy: filters.sortBy,
        page,
        limit: pageSize,
      });
      setItems(response.data.data || []);
      setCategories(response.data.categories || []);
      setPagination(response.data.pagination || {
        totalItems: response.data.data?.length || 0,
        totalPages: 1,
        currentPage: 1
      });
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được bài viết");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArticles();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchArticles]);

  useEffect(() => {
    setPage(1);
  }, [filters, viewMode]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ q: "", topic: "", sortBy: "latest" });
  };

  const totalPages = pagination.totalPages;
  const currentPage = page;

  const rangeStart = pagination.totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(pagination.totalItems, currentPage * pageSize);

  const goPrev = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () =>
    setPage((current) => Math.min(totalPages, current + 1));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bài viết hướng dẫn</h1>
        <p className="text-gray-600">
          Thư viện bài viết chuyên sâu, lấy cùng nguồn dữ liệu với tìm kiếm và trang chi tiết.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <section className="rounded-lg bg-white p-5 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Danh mục</h2>
                {(filters.topic || filters.q || filters.sortBy !== "latest") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-primary hover:text-primary-dark"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => updateFilter("topic", "")}
                  className={`w-full rounded-lg px-4 py-3 text-left font-medium transition ${
                    !filters.topic
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  }`}
                >
                  📰 Tất cả bài viết
                </button>
                {categories.map((category) => {
                  const meta = categoryMeta[category] || { icon: "•", label: category };
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => updateFilter("topic", category)}
                      className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left font-medium transition ${
                        filters.topic === category
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Tìm kiếm</h2>
              <input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Tìm kiếm bài viết..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </section>

            <section className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Sắp xếp</h2>
              <div className="space-y-2">
                {[
                  ["latest", "Mới nhất"],
                  ["popular", "Phổ biến nhất"],
                  ["saved", "Được lưu nhiều"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center rounded p-2 hover:bg-gray-100"
                  >
                    <input
                      type="radio"
                      name="article-sort"
                      value={value}
                      checked={filters.sortBy === value}
                      onChange={(event) => updateFilter("sortBy", event.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-lg bg-white p-5 shadow">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Hiển thị</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ⊞ Lưới
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ⋮ Danh sách
                </button>
              </div>
            </section>

            {viewedArticles.length > 0 && (
              <section className="rounded-lg bg-white p-5 shadow">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Đã xem gần đây</h2>
                <div className="space-y-3">
                  {viewedArticles.slice(0, 3).map((a) => (
                    <Link key={a._id || a.id} to={`/detail/article/${a._id || a.id}`} className="flex gap-3 items-center group">
                      <img src={a.image} className="h-12 w-12 rounded object-cover" alt="" />
                      <p className="text-xs font-medium text-gray-700 group-hover:text-primary line-clamp-2">{a.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {suggestions.length > 0 && (
              <section className="rounded-lg bg-white p-5 shadow">
                <h2 className="mb-4 text-lg font-bold text-gray-900">Gợi ý cho bạn</h2>
                <div className="space-y-3">
                  {suggestions.map((a) => (
                    <Link key={a.id} to={`/detail/article/${a.id}`} className="flex gap-3 items-center group">
                      <img src={a.image} className="h-12 w-12 rounded object-cover" alt="" />
                      <p className="text-xs font-medium text-gray-700 group-hover:text-primary line-clamp-2">{a.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold">
                {rangeStart}-{rangeEnd}
              </span>{" "}
              trong <span className="font-semibold">{pagination.totalItems}</span> bài viết
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-lg bg-white p-10 text-center shadow text-gray-600">
              Không tìm thấy bài viết phù hợp.
            </div>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/detail/article/${item.id}`}
                    className="group relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg transition"
                  >
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition ${
                        favoriteArticleIds.includes(item.id)
                          ? "bg-red-500 text-white"
                          : "bg-white/20 text-white hover:bg-white/40"
                      }`}
                    >
                      <svg className="w-5 h-5" fill={favoriteArticleIds.includes(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="h-44 w-full object-cover"
                    />
                    <div className="p-5">
                      <p className="mb-2 text-xs font-semibold text-primary">
                        {item.topic}
                      </p>
                      <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                        {item.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(item.date)}</span>
                        <span>{item.views} lượt xem</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Trang {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/detail/article/${item.id}`}
                    className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md hover:shadow-lg md:flex-row"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      className="h-36 w-full rounded object-cover md:w-48"
                    />
                    <div className="flex-1">
                      <p className="mb-2 text-xs font-semibold text-primary">
                        {item.topic}
                      </p>
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                        {item.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>{item.author}</span>
                        <span>{formatDate(item.date)}</span>
                        <span>{item.views} lượt xem</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <span className="text-sm font-medium text-gray-600">
                    Trang {currentPage}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ArticlesPage;
