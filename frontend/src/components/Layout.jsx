import React from "react";
import { Link, useLocation } from "react-router-dom";

export const Header = ({ title, subtitle, backUrl }) => {
  return (
    <div className="mb-8">
      {backUrl && (
        <Link
          to={backUrl}
          className="mb-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
        >
          ← Quay lại
        </Link>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-3xl text-gray-600">{subtitle}</p>}
    </div>
  );
};

const NavItem = ({ to, children, active }) => (
  <Link
    to={to}
    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
      active
        ? "bg-blue-50 text-blue-700"
        : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
    }`}
  >
    {children}
  </Link>
);

const DropdownLink = ({ to, children, tone = "default" }) => (
  <Link
    to={to}
    className={`block rounded-lg px-3 py-2 text-sm transition ${
      tone === "admin"
        ? "font-semibold text-amber-700 hover:bg-amber-50"
        : "font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
    }`}
  >
    {children}
  </Link>
);

export const Footer = () => {
  const quickLinks = [
    { href: "/news", label: "Tin tức" },
    { href: "/articles", label: "Bài viết" },
    { href: "/faq", label: "FAQ" },
    { href: "/search", label: "Tìm kiếm" },
  ];

  return (
    <footer className="mt-14 border-t border-slate-200 bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black">
                HU
              </span>
              <span>
                <span className="block text-lg font-bold">HCMUTE Student Care</span>
                <span className="text-sm text-slate-400">Hệ thống tư vấn sinh viên</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Nơi sinh viên đặt lịch tư vấn, theo dõi yêu cầu, đọc nội dung hỗ trợ
              học tập và trao đổi cùng cộng đồng trong một luồng thống nhất.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">Khám phá</h3>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-slate-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">Tư vấn</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/book-counselor" className="text-sm text-slate-400 hover:text-white">
                  Đặt tư vấn
                </Link>
              </li>
              <li>
                <Link to="/consultation-cart" className="text-sm text-slate-400 hover:text-white">
                  Giỏ tư vấn
                </Link>
              </li>
              <li>
                <Link to="/consultation-orders" className="text-sm text-slate-400 hover:text-white">
                  Theo dõi yêu cầu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-200">Liên hệ</h3>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p>Email: info@hcmute.edu.vn</p>
              <p>Điện thoại: (028) 3847 0100</p>
              <p>01 Võ Văn Ngân, TP. Thủ Đức</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-800 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 HCMUTE. Tất cả quyền được bảo lưu.</p>
          <p>CNPMM - BT06_23110193_DinhNguyenDucDuy</p>
        </div>
      </div>
    </footer>
  );
};

export const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [exploreOpen, setExploreOpen] = React.useState(false);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const displayName = user?.fullName || user?.username || user?.email || "Tài khoản";

  React.useEffect(() => {
    setMenuOpen(false);
    setExploreOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const exploreLinks = [
    { href: "/news", label: "Tin tức" },
    { href: "/articles", label: "Bài viết" },
    { href: "/faq", label: "FAQ" },
    { href: "/search", label: "Tìm kiếm" },
    ...(user ? [{ href: "/forum", label: "Forum" }] : []),
  ];

  const accountLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/profile", label: "Hồ sơ cá nhân" },
        { href: "/consultation-cart", label: "Giỏ tư vấn" },
        { href: "/consultation-orders", label: "Yêu cầu của tôi" },
        { href: "/schedules", label: "Lịch tư vấn" },
      ]
    : [];

  const adminLinks =
    user?.role === "admin"
      ? [
          { href: "/admin/consultation-orders", label: "Quản lý yêu cầu" },
          { href: "/admin/cms", label: "Admin CMS" },
        ]
      : [];

  const handleLogout = () => {
    setAccountOpen(false);
    setMenuOpen(false);
    onLogout();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-6">
            <Link to="/" className="flex shrink-0 items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">
                HU
              </span>
              <span className="hidden leading-tight sm:block">
                <span className="block text-base font-black tracking-tight text-slate-950">
                  HCMUTE
                </span>
                <span className="block text-xs font-semibold text-slate-500">
                  Student Care
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-1 lg:flex">
              <NavItem to="/" active={isActive("/")}>
                Trang chủ
              </NavItem>
              <div
                className="relative"
                onMouseEnter={() => {
                  setExploreOpen(true);
                  setAccountOpen(false);
                }}
                onMouseLeave={() => setExploreOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExploreOpen((open) => !open);
                    setAccountOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    ["/news", "/articles", "/faq", "/search", "/forum"].some(isActive)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                  }`}
                >
                  Nội dung
                </button>
                {exploreOpen && (
                  <div className="absolute left-0 top-full z-50 pt-2">
                    <div className="w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                      {exploreLinks.map((link) => (
                        <DropdownLink key={link.href} to={link.href}>
                          {link.label}
                        </DropdownLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {user && (
                <NavItem to="/consultation-orders" active={isActive("/consultation-orders")}>
                  Theo dõi yêu cầu
                </NavItem>
              )}
            </div>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link
                  to="/book-counselor"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Đặt tư vấn
                </Link>
                <div
                  className="relative"
                  onMouseEnter={() => {
                    setAccountOpen(true);
                    setExploreOpen(false);
                  }}
                  onMouseLeave={() => setAccountOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen((open) => !open);
                      setExploreOpen(false);
                    }}
                    className="flex max-w-[230px] items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-2 pr-3 text-sm font-semibold text-slate-800 shadow-sm hover:border-blue-300 hover:text-blue-700"
                    title={displayName}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-blue-700">
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">{displayName}</span>
                    <span className="text-slate-400">▾</span>
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full z-50 pt-2">
                      <div className="w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                        <div className="border-b border-slate-100 px-3 py-2">
                          <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
                          <p className="truncate text-xs text-slate-500">
                            {user?.role === "admin" ? "Quản trị viên" : "Sinh viên"}
                          </p>
                        </div>
                        <div className="py-2">
                          {accountLinks.map((link) => (
                            <DropdownLink key={link.href} to={link.href}>
                              {link.label}
                            </DropdownLink>
                          ))}
                        </div>
                        {adminLinks.length > 0 && (
                          <div className="border-t border-slate-100 py-2">
                            {adminLinks.map((link) => (
                              <DropdownLink key={link.href} to={link.href} tone="admin">
                                {link.label}
                              </DropdownLink>
                            ))}
                          </div>
                        )}
                        <div className="border-t border-slate-100 pt-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-danger hover:bg-red-50"
                          >
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-700"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 lg:hidden"
            aria-label="Mở menu"
          >
            Menu
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <div className="grid gap-2">
              <DropdownLink to="/">Trang chủ</DropdownLink>
              {exploreLinks.map((link) => (
                <DropdownLink key={link.href} to={link.href}>
                  {link.label}
                </DropdownLink>
              ))}
              {user ? (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <DropdownLink to="/book-counselor">Đặt tư vấn</DropdownLink>
                  {[...accountLinks, ...adminLinks].map((link) => (
                    <DropdownLink
                      key={link.href}
                      to={link.href}
                      tone={link.href.startsWith("/admin") ? "admin" : "default"}
                    >
                      {link.label}
                    </DropdownLink>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-left text-sm font-bold text-danger hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-slate-100" />
                  <DropdownLink to="/login">Đăng nhập</DropdownLink>
                  <Link
                    to="/register"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-bold text-white"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
