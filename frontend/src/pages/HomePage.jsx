import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const primaryHref = isAuthenticated
    ? user?.role === "admin"
      ? "/admin/consultation-orders"
      : "/book-counselor"
    : "/login";
  const primaryLabel = isAuthenticated
    ? user?.role === "admin"
      ? "Vào quản trị"
      : "Đặt tư vấn"
    : "Đăng nhập";

  const secondaryHref = isAuthenticated
    ? user?.role === "admin"
      ? "/admin/cms"
      : "/consultation-orders"
    : "/register";
  const secondaryLabel = isAuthenticated
    ? user?.role === "admin"
      ? "Quản lý CMS"
      : "Theo dõi yêu cầu"
    : "Tạo tài khoản";

  const services = [
    {
      title: "Tư vấn học tập",
      desc: "Trao đổi kế hoạch môn học, tiến độ tốt nghiệp, học vụ và hướng xử lý các vướng mắc trong học kỳ.",
      image:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=650&fit=crop",
    },
    {
      title: "Định hướng nghề nghiệp",
      desc: "Kết nối sinh viên với tư vấn viên phù hợp theo mục tiêu thực tập, việc làm và phát triển kỹ năng.",
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&h=650&fit=crop",
    },
    {
      title: "Theo dõi yêu cầu",
      desc: "Quản lý trạng thái đặt lịch, thanh toán COD hoặc MoMo Sandbox và lịch sử tư vấn trong tài khoản.",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=650&fit=crop",
    },
  ];

  const steps = [
    { number: "01", title: "Chọn tư vấn viên", desc: "Lọc theo chuyên môn, phí tư vấn và lịch phù hợp." },
    { number: "02", title: "Thêm vào giỏ", desc: "Chọn từng yêu cầu hoặc nhóm yêu cầu muốn thanh toán." },
    { number: "03", title: "Thanh toán", desc: "Hoàn tất bằng COD hoặc MoMo Sandbox theo cấu hình API." },
    { number: "04", title: "Theo dõi", desc: "Xem trạng thái xử lý, lịch sử và chi tiết từng yêu cầu." },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1800&h=980&fit=crop"
          alt="Sinh viên HCMUTE trao đổi cùng cố vấn"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div className="flex max-w-3xl flex-col justify-center">
            <p className="mb-5 inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100 backdrop-blur">
              HCMUTE Student Care
            </p>
            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
              HCMUTE Student Care
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Hệ thống tư vấn sinh viên giúp đặt lịch, thanh toán, theo dõi yêu cầu
              và cập nhật nội dung hỗ trợ học tập trong một trải nghiệm thống nhất.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={primaryHref}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-700"
              >
                {primaryLabel}
              </Link>
              <Link
                to={secondaryHref}
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur hover:bg-white/20"
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <div className="grid content-end gap-4">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-4 text-slate-950">
                  <p className="text-3xl font-black">12+</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Tư vấn viên</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-slate-950">
                  <p className="text-3xl font-black">30+</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Nội dung</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-slate-950">
                  <p className="text-3xl font-black">2</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Thanh toán</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Dịch vụ</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
              Tư vấn theo đúng nhu cầu sinh viên
            </h2>
          </div>
          <Link to="/book-counselor" className="text-sm font-bold text-blue-700 hover:text-blue-900">
            Xem tư vấn viên →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="text-lg font-black text-slate-950">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-blue-700">Quy trình</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                Từ đặt tư vấn đến theo dõi trạng thái
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Luồng xử lý được tách rõ cho người dùng và admin: người dùng đặt yêu
                cầu, thanh toán, theo dõi; admin xác nhận, cập nhật trạng thái và quản
                lý nội dung CMS.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/consultation-cart"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-300 hover:text-blue-700"
                >
                  Giỏ tư vấn
                </Link>
                <Link
                  to="/articles"
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-800 hover:border-blue-300 hover:text-blue-700"
                >
                  Bài viết hỗ trợ
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-black text-blue-700">{step.number}</p>
                  <h3 className="mt-3 text-lg font-black text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
