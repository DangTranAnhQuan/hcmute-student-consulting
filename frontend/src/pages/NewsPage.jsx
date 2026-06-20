import React, { useEffect, useState, useMemo } from "react";
import { Spinner } from "../components/UI";
import { contentAPI, authAPI } from "../services/api";
import { useAuth } from "../redux/hooks";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const detailType = (item) =>
  item.contentType === "Event" ? "event" : item.contentType === "News" ? "news" : "article";

const fallbackImage =
  "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=900&h=520&fit=crop";

const PAGE_SIZE = 6;

const NewsPage = () => {
  const { user, getProfile } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const favoriteArticleIds = useMemo(() =>
    (user?.favoriteArticles || []).map(a => typeof a === 'string' ? a : a._id)
  , [user]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (favoriteArticleIds.includes(id)) {
        await authAPI.removeFavoriteArticle(id);
      } else {
        await authAPI.addFavoriteArticle(id);
      }
      await getProfile(); // Sync Redux state
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const response = await contentAPI.list({
          contentType: "News,Event",
          sortBy: "latest",
        });
        setItems(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được tin tức");
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  React.useEffect(() => {
    setPage(0);
  }, [items.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const featured = items[0];
  const rest = items.slice(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visibleItems = items.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const goPrev = () => setPage((current) => Math.max(0, current - 1));
  const goNext = () =>
    setPage((current) => Math.min(totalPages - 1, current + 1));

  return (
    <div className="bg-gray-50">
      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        </div>
      )}

      {featured ? (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              <a
                href={`/detail/${detailType(featured)}/${featured.id}`}
                className="lg:col-span-3 relative min-h-[340px] overflow-hidden rounded-lg"
              >
                <img
                  src={featured.image}
                  alt={featured.title}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gray-950/55" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <span className="mb-3 w-fit rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
                    {featured.contentType === "Event" ? "Sự kiện" : "Tin tức"}
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    {featured.title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-blue-50">
                    {featured.excerpt}
                  </p>
                  <p className="mt-4 text-sm text-blue-100">
                    {featured.topic} · {formatDate(featured.date)}
                  </p>
                </div>
              </a>

              <div className="lg:col-span-2 rounded-lg border border-gray-100 bg-gray-50 p-6">
                <h2 className="text-2xl font-bold text-gray-900">Tin mới</h2>
                <div className="mt-5 space-y-4">
                  {rest.slice(0, 4).map((item) => (
                    <a
                      key={item.id}
                      href={`/detail/${detailType(item)}/${item.id}`}
                      className="flex gap-3 rounded-lg bg-white p-3 shadow-sm hover:shadow-md"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = fallbackImage;
                        }}
                        className="h-20 w-24 rounded object-cover"
                      />
                      <div>
                        <p className="text-xs font-semibold uppercase text-primary">
                          {item.contentType === "Event" ? "Sự kiện" : "Tin tức"}
                        </p>
                        <h3 className="line-clamp-2 font-semibold text-gray-900">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(item.date)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-10 text-center text-gray-600">
          Chưa có tin tức hoặc sự kiện.
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-bold text-gray-900">
              Thông báo và sự kiện sinh viên
            </h2>
            {items.length > PAGE_SIZE && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={page === 0}
                  className="h-10 w-10 rounded-full border border-gray-300 bg-white text-xl font-semibold text-gray-700 shadow-sm hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Xem trang trước"
                >
                  ‹
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {page + 1}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={goNext}
                  disabled={page >= totalPages - 1}
                  className="h-10 w-10 rounded-full border border-gray-300 bg-white text-xl font-semibold text-gray-700 shadow-sm hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Xem trang sau"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleItems.map((item) => (
            <a
              key={item.id}
              href={`/detail/${detailType(item)}/${item.id}`}
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
                <svg className="w-4 h-4" fill={favoriteArticleIds.includes(item.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
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
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary">
                    {item.contentType === "Event" ? "Sự kiện" : "Tin tức"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.date)}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {item.excerpt}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>{item.topic}</span>
                  <span>{item.views} lượt xem</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
