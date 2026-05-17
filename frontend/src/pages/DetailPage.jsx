import React from "react";
import { useParams } from "react-router-dom";
import {
  getDetailItem,
  getRelatedItems,
  getMockComments,
} from "../utils/mockData";
import {
  DetailBanner,
  DetailMeta,
  DetailContent,
  RelatedPosts,
  RatingCommentSection,
} from "../components/detail/DetailSections";

const typeLabel = {
  news: "News",
  article: "Article",
  event: "Event",
  counselor: "Counselor",
};

const DetailPage = () => {
  const { type, id } = useParams();

  const detailItem = React.useMemo(() => getDetailItem(type, id), [type, id]);
  const relatedItems = React.useMemo(() => getRelatedItems(type, id, 3), [type, id]);
  const initialComments = React.useMemo(() => getMockComments(id), [id]);

  if (!detailItem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Noi dung khong ton tai</h1>
        <p className="text-gray-600 mb-6">
          Du lieu co the da bi xoa hoac duong dan khong dung.
        </p>
        <a
          href="/news"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
        >
          Quay lai Tin Tuc
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <a
        href="/news"
        className="inline-flex items-center text-primary hover:text-primary-dark"
      >
        ← Quay lai
      </a>

      <DetailBanner item={detailItem} type={typeLabel[type] || "Detail"} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DetailContent item={detailItem} />
          <RatingCommentSection initialComments={initialComments} />
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

