import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoginForm } from "../components/Forms";
import { Card } from "../components/UI";
import { useAuth } from "../redux/hooks";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData.email, formData.password);
      if (response.role === "admin") {
        navigate("/admin/consultation-orders");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-15rem)] w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-300/60 lg:block">
          <div className="relative min-h-[620px]">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=900&fit=crop"
              alt="Sinh viên trao đổi trong khuôn viên trường"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/55" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                HCMUTE Student Care
              </p>
              <h2 className="text-4xl font-black leading-tight">
                Theo dõi tư vấn, lịch hẹn và yêu cầu hỗ trợ trong một tài khoản.
              </h2>
              <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">24/7</p>
                  <p className="mt-1 text-blue-100">Gửi yêu cầu</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">COD</p>
                  <p className="mt-1 text-blue-100">Thanh toán</p>
                </div>
                <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                  <p className="text-2xl font-black">MoMo</p>
                  <p className="mt-1 text-blue-100">Sandbox</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                HU
              </span>
              <span>
                <span className="block text-base font-black text-slate-950">HCMUTE</span>
                <span className="block text-xs font-semibold text-slate-500">Student Care</span>
              </span>
            </Link>
            <h1 className="mt-8 text-3xl font-black tracking-tight text-slate-950">
              Đăng nhập
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Truy cập dashboard, giỏ tư vấn, đơn tư vấn và khu vực quản trị nếu
              tài khoản của bạn có quyền admin.
            </p>
          </div>

          <Card>
            <LoginForm onSubmit={handleLogin} loading={isLoading} error={error} />
          </Card>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
