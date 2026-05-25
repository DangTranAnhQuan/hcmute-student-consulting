import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RegisterForm, OTPVerificationForm } from "../components/Forms";
import { Card, Alert } from "../components/UI";
import { useAuth } from "../redux/hooks";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, verifyOTP, isLoading, error } = useAuth();

  const getOtpMessage = (response, fallbackMessage) => {
    const message = response?.message || fallbackMessage;
    return response?.devOtp
      ? `${message}\nMã OTP thử nghiệm: ${response.devOtp}`
      : message;
  };

  const handleRegister = async (formData) => {
    try {
      const response = await register(
        formData.username,
        formData.email,
        formData.password,
      );
      setRegisteredEmail(formData.email);
      setSuccessMessage(
        getOtpMessage(
          response,
          "Đăng ký thành công. Vui lòng xác nhận OTP để kích hoạt tài khoản.",
        ),
      );
      setStep("otp");
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const handleOTPVerification = async (otp) => {
    try {
      await verifyOTP(registeredEmail, otp);
      setSuccessMessage(
        "Tài khoản đã được kích hoạt. Đang chuyển hướng đến đăng nhập...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const title = step === "register" ? "Tạo tài khoản" : "Xác nhận OTP";
  const description =
    step === "register"
      ? "Đăng ký tài khoản sinh viên để đặt tư vấn, lưu nội dung và theo dõi yêu cầu."
      : `Nhập mã OTP đã gửi đến ${registeredEmail} để hoàn tất kích hoạt tài khoản.`;

  return (
    <div className="bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-15rem)] w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
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
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </div>

          <Card className="space-y-4">
            {successMessage && <Alert type="success" message={successMessage} />}

            {step === "register" && (
              <RegisterForm
                onSubmit={handleRegister}
                loading={isLoading}
                error={error}
              />
            )}

            {step === "otp" && (
              <OTPVerificationForm
                email={registeredEmail}
                onSubmit={handleOTPVerification}
                loading={isLoading}
                error={error}
              />
            )}
          </Card>
        </section>

        <section className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-2xl shadow-slate-300/60 lg:block">
          <div className="relative min-h-[660px]">
            <img
              src="https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=1200&h=900&fit=crop"
              alt="Sinh viên học tập cùng nhau"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-950/60" />
            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
                Bắt đầu nhanh
              </p>
              <h2 className="text-4xl font-black leading-tight">
                Một tài khoản dùng cho nội dung, tư vấn, thanh toán và theo dõi yêu cầu.
              </h2>
              <div className="mt-8 space-y-3">
                {[
                  "Lưu bài viết và xem lịch sử hoạt động.",
                  "Chọn tư vấn viên, thêm vào giỏ và thanh toán COD hoặc MoMo.",
                  "Theo dõi trạng thái xử lý yêu cầu từ lúc đặt đến khi hoàn tất.",
                ].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/12 px-4 py-3 text-sm font-semibold backdrop-blur">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegisterPage;
