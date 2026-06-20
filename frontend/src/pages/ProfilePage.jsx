import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Button, Card, Header, Alert, Spinner } from "../components/UI";
import { useAuth } from "../redux/hooks";
import { consultationOrderAPI, userAPI } from "../services/api";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading, error, getProfile, updateProfile, logout } =
    useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
    faculty: "",
    major: "",
    avatar: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [rewardHistory, setRewardHistory] = useState([]);
  const [redeemPoints, setRedeemPoints] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState({ type: "", text: "" });

  const loyaltyPoints = Number(user?.loyaltyPoints || 0);
  const coupons = Array.isArray(user?.coupons) ? user.coupons : [];
  const activeCoupons = coupons.filter(
    (coupon) =>
      !coupon.isUsed &&
      (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()),
  );
  const usedCoupons = coupons.filter((c) => c.isUsed);
  const favoriteCounselors = Array.isArray(user?.favoriteCounselors)
    ? user.favoriteCounselors
    : [];
  const favoriteArticles = Array.isArray(user?.favoriteArticles)
    ? user.favoriteArticles
    : [];
  const viewedCounselors = Array.isArray(user?.recentlyViewedCounselors)
    ? user.recentlyViewedCounselors
    : [];
  const viewedArticles = Array.isArray(user?.recentlyViewedArticles)
    ? user.recentlyViewedArticles
    : [];

  const counselorLabel = (counselor) =>
    typeof counselor === "string"
      ? counselor
      : counselor.fullName || counselor._id || "Tư vấn viên";

  const articleLabel = (article) =>
    typeof article === "string"
      ? article
      : article.title || article._id || "Bài viết";

  useEffect(() => {
    if (!user && !isLoading) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    getProfile().catch(() => {});
    consultationOrderAPI
      .rewardHistory()
      .then((res) => setRewardHistory(res.data || []))
      .catch(() => {});
  }, [getProfile]);

  useEffect(() => {
    if (user?.email) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
        faculty: user.faculty || "",
        major: user.major || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Tên người dùng không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await updateProfile(formData);
        setSuccessMessage("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Update profile failed:", err);
      }
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setRedeemMessage({ type: "error", text: "File quá lớn (tối đa 2MB)" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRedeemPoints = async () => {
    const pts = Number(redeemPoints);
    if (!pts || pts < 100) {
      setRedeemMessage({ type: "error", text: "Nhập ít nhất 100 điểm để đổi" });
      return;
    }
    if (pts > loyaltyPoints) {
      setRedeemMessage({ type: "error", text: "Không đủ điểm tích lũy" });
      return;
    }
    try {
      setRedeemLoading(true);
      setRedeemMessage({ type: "", text: "" });
      const res = await userAPI.redeemPoints(pts);
      setRedeemMessage({ type: "success", text: res.data.message });
      setRedeemPoints("");
      await getProfile();
    } catch (err) {
      setRedeemMessage({
        type: "error",
        text: err.response?.data?.message || "Đổi điểm thất bại",
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Header
          title="Hồ sơ của tôi"
          subtitle={`Thông tin hồ sơ của bạn (${user.role})`}
        />

        <Card>
          {error && <Alert type="error" message={error} />}
          {successMessage && <Alert type="success" message={successMessage} />}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="username"
                  label="Tên người dùng"
                  value={formData.username}
                  onChange={handleChange}
                  error={formErrors.username}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />

                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  className="bg-gray-100"
                />

                <Input
                  type="text"
                  name="fullName"
                  label="Họ và tên"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />

                <Input
                  type="tel"
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  error={formErrors.phone}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Input
                  type="text"
                  name="faculty"
                  label="Khoa"
                  placeholder="Ví dụ: Khoa CNTT"
                  value={formData.faculty}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />

                <Input
                  type="text"
                  name="major"
                  label="Ngành học"
                  placeholder="Ví dụ: Kỹ thuật phần mềm"
                  value={formData.major}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Ảnh đại diện
                </label>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-[10px] text-gray-400">Hỗ trợ JPG, PNG. Tối đa 2MB.</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Avatar"
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {formData.fullName?.[0] || formData.username?.[0]}
                      </div>
                    )}
                    <span className="text-sm text-gray-500 truncate max-w-[200px]">
                      {formData.avatar ? "Đã tải lên" : "Chưa có ảnh"}
                    </span>
                  </div>
                )}
                {formData.avatar && isEditing && (
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-xs text-gray-500">Xem trước:</p>
                    <img
                      src={formData.avatar}
                      alt="Avatar Preview"
                      className="h-12 w-12 rounded-full object-cover border border-gray-200 shadow-sm"
                    />
                  </div>
                )}
              </div>

              <Input
                type="text"
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-100" : ""}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Vai trò:</strong>{" "}
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>

            <div className="flex gap-4">
              {!isEditing ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    className="flex-1"
                  >
                    Lưu
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user.username || "",
                        email: user.email || "",
                        fullName: user.fullName || "",
                        phone: user.phone || "",
                        address: user.address || "",
                        faculty: user.faculty || "",
                        major: user.major || "",
                        avatar: user.avatar || "",
                      });
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Điểm thưởng và mã giảm giá
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Điểm tích lũy</p>
              <p className="mt-2 text-3xl font-bold text-primary">{loyaltyPoints}</p>
              <p className="mt-1 text-xs text-gray-500">1 điểm = 1đ khi thanh toán hoặc đổi mã.</p>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min={100}
                  max={loyaltyPoints}
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  placeholder="Nhập số điểm (tối thiểu 100)"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button
                  onClick={handleRedeemPoints}
                  disabled={redeemLoading || loyaltyPoints < 100}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {redeemLoading ? "..." : "Đổi mã"}
                </button>
              </div>
              {redeemMessage.text && (
                <p className={`mt-2 text-xs ${redeemMessage.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {redeemMessage.text}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Mã giảm giá khả dụng</p>
              {activeCoupons.length > 0 ? (
                <ul className="mt-3 space-y-3 text-sm">
                  {activeCoupons.map((coupon) => (
                    <li key={coupon.code} className="rounded-lg border border-green-200 bg-white p-3">
                      <p className="font-semibold text-green-900">{coupon.code}</p>
                      <p>
                        {coupon.description ||
                          (coupon.type === "percent"
                            ? `Giảm ${coupon.value}%`
                            : `Giảm ${coupon.value.toLocaleString("vi-VN")}đ`)}
                      </p>
                      {coupon.expiresAt && (
                        <p className="text-xs text-gray-500">
                          Hết hạn: {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-gray-600">
                  Bạn chưa có mã giảm giá. Đánh giá sau dịch vụ để nhận ưu đãi.
                </p>
              )}
              {usedCoupons.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-500">Đã dùng ({usedCoupons.length})</p>
                  <ul className="mt-1 space-y-1">
                    {usedCoupons.map((c) => (
                      <li key={c.code} className="text-xs text-gray-400 line-through">{c.code}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {rewardHistory.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">Lịch sử nhận thưởng</p>
              <ul className="space-y-2">
                {rewardHistory.slice(0, 10).map((r, i) => (
                  <li key={i} className="flex items-start justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-800">{r.message}</p>
                      {r.code && (
                        <p className="text-xs text-green-700">Mã: <span className="font-mono">{r.code}</span></p>
                      )}
                      <p className="text-xs text-gray-500">
                        Đơn #{r.orderCode} · {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <span className={`ml-4 shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${r.type === "coupon" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {r.type === "coupon"
                        ? (r.value >= 100 ? `Mã -${r.value.toLocaleString("vi-VN")}đ` : `Mã -${r.value}%`)
                        : `+${r.value} điểm`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tương tác yêu thích và lịch sử
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Chuyên viên</p>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Yêu thích</p>
                  {favoriteCounselors.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {favoriteCounselors.slice(0, 5).map((c) => (
                        <li key={c._id || c}>
                          <Link to={`/book-counselor/${c._id || c}`} className="font-semibold text-primary hover:underline">
                            {counselorLabel(c)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa có</p>
                  )}
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Đã xem gần đây</p>
                  {viewedCounselors.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {viewedCounselors.slice(0, 5).map((c) => (
                        <li key={c._id || c}>
                          <Link to={`/book-counselor/${c._id || c}`} className="font-semibold text-primary hover:underline">
                            {counselorLabel(c)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa có</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">Cẩm nang & Bài viết</p>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Yêu thích</p>
                  {favoriteArticles.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {favoriteArticles.slice(0, 5).map((a) => (
                        <li key={a._id || a}>
                          <Link to={`/detail/article/${a._id || a}`} className="font-semibold text-primary hover:underline line-clamp-1">
                            {articleLabel(a)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa có</p>
                  )}
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Đã xem gần đây</p>
                  {viewedArticles.length > 0 ? (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {viewedArticles.slice(0, 5).map((a) => (
                        <li key={a._id || a}>
                          <Link to={`/detail/article/${a._id || a}`} className="font-semibold text-primary hover:underline line-clamp-1">
                            {articleLabel(a)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-400 italic">Chưa có</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-8 border-t-4 border-danger">
          <h3 className="text-lg font-semibold text-danger mb-4">
            Khu vực nguy hiểm
          </h3>
          <Button
            variant="danger"
            onClick={() => {
              if (
                window.confirm(
                  "Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác.",
                )
              ) {
                console.log("Delete account");
              }
            }}
          >
            Xóa tài khoản vĩnh viễn
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
