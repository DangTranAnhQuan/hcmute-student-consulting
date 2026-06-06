import React from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "../components/UI";
import {
  DetailBanner,
  DetailMeta,
  DetailContent,
  RelatedPosts,
  RatingCommentSection,
} from "../components/detail/DetailSections";
import { contentAPI } from "../services/api";

const typeLabel = {
  news: "Tin tức",
  article: "Bài viết",
  event: "Sự kiện",
};

const backUrl = {
  news: "/news",
  event: "/news",
  article: "/articles",
};

const DetailPage = () => {
  const { type, id } = useParams();
  const [detailItem, setDetailItem] = React.useState(null);
  const [relatedItems, setRelatedItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const loadDetail = async () => {
      try {
        setLoading(true);
        const response = await contentAPI.detail(id);
        setDetailItem(response.data.item);
        setRelatedItems(response.data.related || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được nội dung");
      } finally {
        setLoading(false);
      }
    };

    if (["news", "article", "event"].includes(type)) {
      loadDetail();
    } else {
      setError("Loại nội dung không được hỗ trợ");
      setLoading(false);
    }
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !detailItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Nội dung không tồn tại
        </h1>
        <p className="text-gray-600 mb-6">
          {error || "Dữ liệu có thể đã bị xóa hoặc đường dẫn không đúng."}
        </p>
        <a
          href={backUrl[type] || "/news"}
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
        >
          Quay lại
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <a
        href={backUrl[type] || "/news"}
        className="inline-flex items-center text-primary hover:text-primary-dark"
      >
        ← Quay lại
      </a>

      <DetailBanner item={detailItem} type={typeLabel[type] || "Chi tiết"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailContent item={detailItem} />
          <RatingCommentSection
            articleId={detailItem.id}
            initialComments={detailItem.comments || []}
          />
        </div>

        <div className="space-y-6">
          <DetailMeta item={detailItem} />
        </div>
      </div>

      <RelatedPosts related={relatedItems} type={type} />
    </div>
  );
};

export default DetailPage;
