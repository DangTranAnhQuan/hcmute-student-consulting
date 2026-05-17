import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilter } from "../../redux/searchSlice";

const fieldLabel = {
  keyword: "Keyword",
  topic: "Topic",
  faculty: "Faculty",
  contentType: "Type",
  publishTime: "Publish",
  popularity: "Popularity",
  counselingFormat: "Format",
  appointmentStatus: "Status",
};

const FilterChips = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.search.filters);

  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (!value) return false;
    if (key !== "keyword" && value === "All") return false;
    return true;
  });

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeFilters.map(([key, value]) => (
        <button
          key={key}
          type="button"
          onClick={() => dispatch(updateFilter({ key, value: key === "keyword" ? "" : "All" }))}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm"
        >
          <span>{fieldLabel[key]}: {value}</span>
          <span>✕</span>
        </button>
      ))}
    </div>
  );
};

export default FilterChips;

