# Phân công BT06 nhóm - HCMUTE Student Consulting

Tài liệu này mô tả cách tách phần hoàn thiện từ thư mục `hcmute-student-consulting_HoanThanh` thành 4 phần cho từng thành viên. Mục tiêu là mỗi bạn làm một phần riêng, sau đó merge theo đúng thứ tự thì mã nguồn cuối cùng khớp với thư mục hoàn thành.

## 1. Cách ánh xạ yêu cầu bài vào đề tài

Dự án nhóm là hệ thống tư vấn sinh viên, nên các yêu cầu cart, checkout/payment và order tracking được ánh xạ như sau:

| Yêu cầu gốc | Ánh xạ trong hệ thống tư vấn sinh viên |
|---|---|
| Giỏ hàng | Giỏ tư vấn: danh sách tư vấn viên/chủ đề/khung giờ sinh viên đã chọn |
| Thanh toán COD/ví điện tử | Checkout yêu cầu tư vấn bằng COD hoặc MoMo Sandbox |
| Theo dõi đơn hàng | Theo dõi yêu cầu tư vấn, lịch tư vấn, trạng thái xử lý và hủy |
| Admin xử lý đơn | Admin/cố vấn xem yêu cầu, cập nhật trạng thái, xử lý hủy và theo dõi thống kê |

## 2. Quy ước trạng thái nghiệp vụ

| Mã | Nhãn hiển thị | Ý nghĩa |
|---|---|---|
| `NEW` | Yêu cầu mới | Sinh viên vừa checkout yêu cầu tư vấn |
| `CONFIRMED` | Đã xác nhận | Yêu cầu đã được xác nhận |
| `PREPARING` | Đang chuẩn bị hồ sơ | Admin/cố vấn chuẩn bị hồ sơ, phòng hoặc tài liệu |
| `PROCESSING` | Đang tư vấn/đang xử lý | Yêu cầu đang được xử lý |
| `COMPLETED` | Đã hoàn tất | Buổi tư vấn/yêu cầu đã hoàn thành |
| `CANCELLED` | Đã hủy | Yêu cầu đã bị hủy |
| `CANCEL_REQUESTED` | Gửi yêu cầu hủy | Sinh viên gửi yêu cầu hủy khi không còn được hủy trực tiếp |

Quy tắc hủy:

- Yêu cầu còn mới hoặc chưa xử lý có thể hủy trực tiếp tùy trạng thái thanh toán.
- Yêu cầu MoMo đã thanh toán cần admin xử lý hoàn tiền/đối soát.
- Lịch tư vấn sinh ra từ đơn phải được đồng bộ khi đơn hủy, hoàn thành hoặc đổi trạng thái.

## 3. Phân công thành viên

### Quân - Backend giỏ tư vấn

Phạm vi:

- Thiết kế model giỏ tư vấn.
- API xem giỏ, thêm mục, cập nhật mục, xóa từng mục và xóa toàn bộ giỏ.
- Tính giá theo đơn giá giờ và thời lượng slot.
- Validate tư vấn viên còn hoạt động, thời gian hợp lệ và không trùng lịch ở mức giỏ.

File chính trong thư mục `hcmute-student-consulting_Quan`:

- `backend/src/models/ConsultationCart.js`
- `backend/src/controllers/consultationCartController.js`
- `backend/src/routes/consultationCartRoutes.js`

Ghi chú phụ thuộc:

- Controller cart dùng `scheduleService` để kiểm tra slot. File này nằm ở phần tích hợp cuối của Duy để tránh nhiều bạn cùng sửa một service dùng chung.
- Khi merge, phần cart phải vào trước checkout.

Branch đề xuất:

```bash
feat/quan-cart-backend
```

### Thiên - UI đặt tư vấn, giỏ tư vấn và chọn giờ

Phạm vi:

- Trang danh sách tư vấn viên.
- Trang chi tiết/đặt nhanh tư vấn viên.
- Trang giỏ tư vấn.
- Bộ chọn ngày/giờ, hiển thị đầy đủ khung giờ 08:00-17:00, hiển thị slot đã có người đặt.
- UI thu gọn/mở rộng, phân trang, chọn từng mục để checkout.

File chính trong thư mục `hcmute-student-consulting_Thien`:

- `frontend/src/components/booking/AvailableSlotPicker.jsx`
- `frontend/src/pages/CounselorsListPage.jsx`
- `frontend/src/pages/BookCounselorPage.jsx`
- `frontend/src/pages/ConsultationCartPage.jsx`
- `frontend/src/components/Layout.jsx`
- `frontend/src/utils/consultationFormat.js`

Ghi chú phụ thuộc:

- API service và route tổng trong `App.jsx` do Duy tích hợp cuối.
- Trang giỏ dùng API cart của Quân.

Branch đề xuất:

```bash
feat/thien-booking-cart-ui
```

### Khang - Checkout, COD và MoMo Sandbox

Phạm vi:

- Model đơn/yêu cầu tư vấn.
- API checkout từ các mục đã chọn trong giỏ.
- Thanh toán COD.
- Tạo phiên thanh toán MoMo Sandbox, xử lý return/IPN/query.
- Không đánh dấu MoMo là đã thanh toán nếu chưa có callback/query hợp lệ.
- Xử lý đơn MoMo pending quá hạn.

File chính trong thư mục `hcmute-student-consulting_Khang`:

- `backend/.env.example`
- `backend/src/models/ConsultationOrder.js`
- `backend/src/controllers/consultationOrderController.js`
- `backend/src/routes/consultationOrderRoutes.js`
- `frontend/src/pages/ConsultationCheckoutPage.jsx`

Ghi chú phụ thuộc:

- Checkout phụ thuộc cart của Quân.
- Checkout sinh lịch tư vấn qua `scheduleService`; phần service dùng chung do Duy tích hợp cuối.
- UI checkout cần `consultationFormat.js` và API service khi merge với phần của Thiên/Duy.

Branch đề xuất:

```bash
feat/khang-checkout-payment
```

### Duy - Theo dõi yêu cầu, admin, đánh giá, lịch tư vấn và tích hợp cuối

Phạm vi:

- Trang lịch sử yêu cầu tư vấn của sinh viên.
- Trang chi tiết yêu cầu, timeline trạng thái và đánh giá tư vấn viên.
- Trang admin quản lý yêu cầu tư vấn.
- Tự động cập nhật lượt đặt, trạng thái bận/rảnh, lịch gần nhất, rating và số đánh giá.
- Logic tạo/hủy/đồng bộ lịch tư vấn sau checkout.
- Tích hợp route backend/frontend, service API, seed, README và hướng dẫn chạy.

File chính trong thư mục `hcmute-student-consulting_Duy`:

- `backend/src/app.js`
- `backend/src/services/scheduleService.js`
- `backend/src/services/counselorStatsService.js`
- `backend/src/models/Schedule.js`
- `backend/src/models/Availability.js`
- `backend/src/models/CounselorReview.js`
- `backend/src/controllers/scheduleController.js`
- `backend/src/controllers/adminController.js`
- `backend/src/controllers/counselorController.js`
- `backend/src/controllers/contentController.js`
- `backend/src/routes/contentRoutes.js`
- `frontend/src/App.jsx`
- `frontend/src/services/api.js`
- `frontend/src/pages/SchedulesPage.jsx`
- `frontend/src/pages/ConsultationOrdersPage.jsx`
- `frontend/src/pages/ConsultationOrderDetailPage.jsx`
- `frontend/src/pages/ConsultationAdminOrdersPage.jsx`
- `frontend/src/redux/scheduleSlice.js`
- `frontend/src/components/admin/*`
- `README.md`
- `HUONG_DAN_CHAY.md`
- `PHAN_CONG_BT06_NHOM.md`

Branch đề xuất:

```bash
feat/duy-order-admin-integration
```

## 4. Thứ tự merge bắt buộc

1. Quân merge backend cart.
2. Thiên merge UI đặt tư vấn/giỏ tư vấn.
3. Khang merge checkout/payment.
4. Duy merge theo dõi đơn/admin/tích hợp cuối.

Lý do Duy merge cuối:

- `backend/src/app.js`, `frontend/src/App.jsx`, `frontend/src/services/api.js` là file tích hợp chung.
- `scheduleService` được cả cart và checkout dùng.
- Admin, thống kê và đánh giá phụ thuộc dữ liệu sinh ra từ cart/checkout/order.

## 5. API chính sau khi merge

```http
GET    /api/consultation-cart
POST   /api/consultation-cart/items
PUT    /api/consultation-cart/items/:itemId
DELETE /api/consultation-cart/items/:itemId
DELETE /api/consultation-cart

GET    /api/counselors
GET    /api/counselors/:id
GET    /api/counselors/:id/available-slots

GET    /api/consultation-orders/payment-methods
POST   /api/consultation-orders/checkout
GET    /api/consultation-orders
GET    /api/consultation-orders/:id
POST   /api/consultation-orders/:id/cancel
POST   /api/consultation-orders/:id/pay-momo
POST   /api/consultation-orders/:id/items/:itemIndex/review
GET    /api/consultation-orders/momo/return
POST   /api/consultation-orders/momo/ipn

GET    /api/admin/consultation-orders
PUT    /api/admin/consultation-orders/:id/status
```

## 6. Quy trình chạy và kiểm tra

Sau khi merge đủ 4 phần:

```bash
cd backend
npm install
npm run seed
npm start
```

```bash
cd frontend
npm install
npm start
```

Kiểm tra tối thiểu:

- Đăng nhập sinh viên.
- Vào danh sách tư vấn viên, chọn giờ 08:00-17:00.
- Thêm vào giỏ tư vấn.
- Checkout COD hoặc MoMo Sandbox.
- Kiểm tra lịch tư vấn được tạo.
- Admin đổi trạng thái đơn.
- Sinh viên xem chi tiết đơn và đánh giá sau khi hoàn thành.

## 7. Lưu ý dữ liệu

Code trong 4 thư mục thành viên không chứa dữ liệu MongoDB đã thao tác khi chạy. Dữ liệu đặt tư vấn, hủy lịch, đơn hàng và đánh giá nằm trong database cấu hình bởi `MONGO_URI`. Nếu muốn các thành viên có cùng dữ liệu demo, dùng `npm run seed` hoặc xuất/nhập MongoDB bằng `mongodump` và `mongorestore`.
