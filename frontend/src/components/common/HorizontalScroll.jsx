import React from "react";

const HorizontalScroll = ({ title, subtitle, items, renderItem }) => {
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">{title}</h2>
            {subtitle && <p className="mt-2 text-slate-600">{subtitle}</p>}
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, index) => (
            <div key={index} className="flex-none w-72 snap-start">
              {renderItem(item)}
            </div>
          ))}
          {items.length === 0 && (
            <div className="w-full py-10 text-center text-slate-400 italic">
              Đang tải hoặc chưa có dữ liệu...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HorizontalScroll;
