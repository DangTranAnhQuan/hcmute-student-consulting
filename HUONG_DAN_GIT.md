# Hướng dẫn sử dụng Git và Github cho nhóm

**Link Github Nhóm**: [https://github.com/DangTranAnhQuan/hcmute-student-consulting](https://github.com/DangTranAnhQuan/hcmute-student-consulting)

Tài liệu này hướng dẫn các thành viên (Quân, Thiên, Khang, Duy) quy trình đẩy code (push) và làm việc chung trên Github để tránh xung đột (conflict) và mất code.

## 1. Phân công Nhánh (Branch) làm việc
Để không ghi đè code của nhau, mỗi người sẽ làm việc trên một nhánh riêng hoặc nhánh theo tính năng (feature branch). Không ai push trực tiếp lên nhánh `main`.

- **Quân**: Nhánh `feature/realtime-notification`
- **Thiên**: Nhánh `feature/statistics-api`
- **Khang**: Nhánh `feature/dashboard-ui`
- **Duy**: Nhánh `feature/integration-testing`

## 2. Quy trình làm việc hàng ngày

### Bước 1: Cập nhật code mới nhất từ nhánh `main`
Trước khi bắt đầu code tính năng mới, hãy chắc chắn nhánh `main` ở máy bạn là mới nhất.
```bash
git checkout main
git pull origin main
```

### Bước 2: Tạo hoặc chuyển sang nhánh cá nhân của bạn
Nếu chưa có nhánh:
```bash
git checkout -b feature/<tên-tính-năng>
```
Ví dụ của Quân: `git checkout -b feature/realtime-notification`

Nếu đã có nhánh:
```bash
git checkout feature/<tên-tính-năng>
# Rebase hoặc merge code mới từ main vào nhánh của bạn để tránh conflict sau này
git merge main
```

### Bước 3: Code và Commit
Sau khi code xong và muốn lưu lại:
```bash
git add .
git commit -m "feat: thêm chức năng websocket cho notification"
```
*(Ghi chú: Nên viết commit message rõ ràng để mọi người biết bạn đã làm gì, có thể theo chuẩn: `feat: ...`, `fix: ...`, `chore: ...`)*

### Bước 4: Push code lên Github
```bash
git push origin feature/<tên-tính-năng>
```

### Bước 5: Tạo Pull Request (PR)
- Lên trang Github của dự án.
- Github sẽ hiện nút **"Compare & pull request"**, bấm vào đó.
- Ghi rõ nội dung bạn đã làm trong PR.
- **Duy** (hoặc người được chỉ định) sẽ review code. Nếu ổn, code sẽ được **Merge** vào nhánh `main`.

## 3. Cài đặt các gói thư viện (Dependencies)
Do chúng ta có 2 thư mục `frontend` và `backend` riêng biệt. Khi pull code của người khác về, nếu thấy có file `package.json` thay đổi, hãy chạy cài đặt lại thư viện ở ĐÚNG thư mục:

```bash
# Đối với Backend
cd backend
npm install

# Đối với Frontend
cd frontend
npm install
```

## 4. Xử lý khi bị Conflict (Xung đột code)
Nếu lúc tạo PR hoặc Merge main bị báo Conflict:
1. Mở editor (VS Code / Android Studio).
2. Tìm đến các file bị báo đỏ (conflict).
3. Thảo luận với người đã viết đoạn code đó (Quân/Thiên/Khang/Duy) để quyết định giữ phần nào, bỏ phần nào.
4. Xóa các dấu `<<<<<<<`, `=======`, `>>>>>>>`.
5. Chạy lại `git add .` và `git commit -m "fix: resolve conflicts"`.
6. Push lại lên nhánh của bạn.
