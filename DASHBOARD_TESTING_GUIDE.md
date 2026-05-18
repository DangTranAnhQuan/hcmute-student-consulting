# 🧪 Dashboard Testing & Demonstration Guide

## How to Test the Dashboard

### Prerequisites
- Node.js v16+
- Frontend dependencies installed (`npm install`)
- Backend running (optional - dashboard uses mock data)

---

## 🚀 Step-by-Step Testing

### **Step 1: Start the Application**

```bash
cd frontend
npm start
```

The application will open at `http://localhost:3000`

### **Step 2: Login or Register**

**Option A: Quick Test (If Mock Auth Works)**
1. Click "Đăng Nhập" (Login)
2. Enter test credentials:
   - Email: `test@hcmute.edu.vn`
   - Password: `password123`
3. Click "Đăng nhập"

**Option B: Register New Account**
1. Click "Đăng Ký" (Register)
2. Fill in registration form
3. Enter OTP (check your code for mock OTP logic)
4. Verify account

### **Step 3: Access Dashboard**

After login, you'll see:
- Welcome message in navbar
- "Dashboard" link in navbar appears

Click "Dashboard" or navigate to `http://localhost:3000/dashboard`

---

## ✅ Visual Inspection Checklist

### **Dashboard Header Section**

Expected appearance:
```
┌─────────────────────────────────────────────────────┐
│  👋 Buổi sáng tốt, Nguyễn Văn A!                   │
│  Đang học tại Khoa Công Nghệ Thông Tin             │
│  [Avatar]                         MSSV: 20211234   │
└─────────────────────────────────────────────────────┘

Stats Row:
📬 Thông Báo: 3 mới
💬 Bài Viết Đã Xem: 127
❤️ Đã Lưu: 45
📊 Hoạt Động: 130
```

**✅ To Verify:**
- [ ] Greeting message is personalized
- [ ] User avatar displays
- [ ] Faculty name shows correctly
- [ ] Student ID visible
- [ ] All 4 stat cards visible
- [ ] Stats have correct values

### **Quick Action Cards**

Expected: 4 cards in a row

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│  📰 Tin Tức  │ ✍️ Bài Viết  │ 👤 Tư Vấn    │ ❓ Câu Hỏi  │
│ Cập nhật     │ Đọc hướng dẫn │ Đặt lịch hẹn  │ Tìm câu trả │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**✅ To Verify:**
- [ ] 4 cards visible
- [ ] Icons display correctly
- [ ] Cards are clickable
- [ ] Responsive on mobile (stacks vertically)

### **Notifications Widget**

Expected: Notification list with unread indicator

```
📬 Thông Báo [3 mới]
├─ ℹ️ Cập nhật Lịch Tư Vấn (unread - blue dot)
│   "Lịch tư vấn tháng 6 đã cập nhật"
│   Vừa xong  [✕]
├─ ✓ Lịch Hẹn Đã Xác Nhận (read)
│   "Cuộc tư vấn của bạn lúc 10:00..."
│   5h trước  [✕]
└─ ⚠️ Thông Báo Quan Trọng (read)
    "Hạn đăng ký học phần..."
    1d trước  [✕]
```

**✅ To Verify:**
- [ ] "3 mới" badge shows
- [ ] Unread notifications have blue dot
- [ ] Click on unread notification → blue dot disappears
- [ ] Click ✕ → notification deleted
- [ ] Timestamps display correctly
- [ ] Notification types show different icons
- [ ] "Xem tất cả thông báo" link works

### **News Widget**

Expected: News items with thumbnails

```
📰 Tin Tức Nổi Bật              [Xem tất cả]

[IMG] Tuyển Dụng...
  "Cơ hội thực tập..."
  [Jobs] 👁️ 1250

[IMG] Học Bổng...
  "Các chương trình..."
  [Scholarships] 👁️ 890

[IMG] Hướng Dẫn Kỹ...
  "Những kỹ năng cần..."
  [Soft Skills] 👁️ 2100
```

**✅ To Verify:**
- [ ] 3 news items visible
- [ ] Images load
- [ ] Title displays
- [ ] Category badge shows
- [ ] View count visible
- [ ] Hover effect works
- [ ] Click → navigates to detail page (when built)

### **Articles Widget**

Expected: Popular articles with read time

```
⭐ Bài Viết Nổi Bật              [Xem tất cả]

[IMG] Làm Thế Nào Để Vượt...
  Bởi TS. Lê Văn C
  5 min 💬 5200

[IMG] Quản Lý Thời Gian...
  Bởi ThS. Nguyễn Văn A
  7 min 💬 4890

[IMG] Cân Bằng Học Tập...
  Bởi ThS. Trần Thị B
  6 min 💬 3450
```

**✅ To Verify:**
- [ ] Article images display
- [ ] Author name shows
- [ ] Read time visible
- [ ] View count displays
- [ ] 3 articles shown
- [ ] Hover effects work

### **Schedule Widget**

Expected: Upcoming counseling sessions

```
📅 Lịch Tư Vấn Sắp Tới              [Quản lý]

┌─ Tư Vấn Hướng Nghiệp
│  👤 ThS. Nguyễn Văn A
│  ✓ Đã xác nhận
│  📍 Online • 🕒 09:00-10:00 • 📅 05/20

┌─ Tư Vấn Học Bổng
│  👤 ThS. Trần Thị B
│  ⏳ Chờ xác nhận
│  📍 Offline • 🕒 14:00-15:00 • 📅 05/22

┌─ Tư Vấn Thích Ứng
│  👤 TS. Lê Văn C
│  ✓ Đã xác nhận
│  📍 Online • 🕒 10:00-11:00 • 📅 05/25

[+ Đặt Lịch Tư Vấn]
```

**✅ To Verify:**
- [ ] 3 schedules visible
- [ ] Counselor names show
- [ ] Status badges (Đã xác nhận / Chờ xác nhận)
- [ ] Format shows (Online/Offline)
- [ ] Time and date display
- [ ] "Đặt Lịch Tư Vấn" button visible
- [ ] Button links to booking page

### **Events Widget**

Expected: Upcoming events

```
🎉 Sự Kiện Khoa / Trường              [Tất cả]

┌─ [IMG] Hội Thảo: Xu Hướng...
│  Khoa Công Nghệ Thông Tin
│  📅 Thứ ba, 05/25 • 🕒 14:00
│  👥 150

┌─ [IMG] Ngày Hội Tư Vấn Tuyển...
│  Phòng Quản Lý Sinh Viên
│  📅 Thứ Sáu, 05/28 • 🕒 09:00
│  👥 500

┌─ [IMG] Buổi Giao Lưu...
│  Khoa Kinh Tế
│  📅 Thứ Hai, 06/01 • 🕒 18:00
│  👥 300
```

**✅ To Verify:**
- [ ] Event images load
- [ ] Event titles display
- [ ] Faculty/department shows
- [ ] Date and time visible
- [ ] Attendance count shows
- [ ] 3 events visible
- [ ] Click → navigates to detail

### **Documents Widget**

Expected: Important documents

```
📚 Tài Liệu Hữu Ích                [Thư viện]

📄 Điều Lệ Sinh Viên...
   2.4 MB  ⬇️ 1250

📝 Hướng Dẫn Đăng Ký...
   1.8 MB  ⬇️ 890

📄 Mẫu CV Tiêu Chuẩn
   0.5 MB  ⬇️ 2340

📝 Thỏa Thuận Thực Tập
   1.2 MB  ⬇️ 540
```

**✅ To Verify:**
- [ ] 4 documents visible
- [ ] File icons show (📄, 📝, 📊, etc.)
- [ ] File names display
- [ ] File size shown
- [ ] Download count visible
- [ ] Click → download or opens detail

### **Bottom CTA Section**

Expected: Call-to-action block

```
┌─────────────────────────────────────┐
│ 📚 Khám Phá Thêm Tài Nguyên          │
│ Truy cập bộ sưu tập đầy đủ...       │
│                                     │
│ [🔍 Tìm Kiếm Nâng Cao]              │
│ [💬 Hỏi Đáp Cộng Đồng]              │
└─────────────────────────────────────┘
```

**✅ To Verify:**
- [ ] CTA section visible at bottom
- [ ] Two buttons present
- [ ] Buttons clickable
- [ ] Buttons link correctly

---

## 🔧 Functional Testing

### **Test 1: Mark Notification as Read**

1. Look for unread notification (has blue dot)
2. Click on it
3. ✅ Blue dot disappears
4. ✅ Unread count decreases

### **Test 2: Delete Notification**

1. Hover over any notification
2. Click ✕ button
3. ✅ Notification disappears from list
4. ✅ Unread count updates

### **Test 3: Navigation**

1. Click on news item → Should navigate to `/detail/news/{id}`
2. Click on article → Should navigate to `/detail/article/{id}`
3. Click on event → Should navigate to `/detail/event/{id}`
4. Click "Đặt Lịch Tư Vấn" → Should navigate to `/book-counselor`

### **Test 4: Responsive Design**

**Desktop (1200px+)**
- All 6 widgets visible at once
- Grid layout with 3 columns
- Full width CTA section
- Optimal spacing

**Tablet (768px - 1024px)**
- Left column (2 cols): Notifications, News, Articles
- Right column (1 col): Schedule, Events
- Documents below full width
- Responsive text and images

**Mobile (< 768px)**
- All widgets stack vertically
- Single column layout
- Touch-friendly buttons
- Full-width cards

---

## 🧩 Component Independence Testing

### **Test Individual Widgets**

You can test each widget independently by creating a test page:

```jsx
// pages/WidgetTesting.jsx
import { NotificationWidget } from "../components/dashboard/DashboardWidgets";

export default function WidgetTesting() {
  return (
    <div className="p-8">
      <NotificationWidget />
    </div>
  );
}
```

Then add route:
```jsx
<Route path="/widget-test" element={<WidgetTesting />} />
```

---

## 📊 Redux State Verification

### **Check Redux State**

1. Install Redux DevTools Extension
2. Open browser DevTools (F12)
3. Go to Redux tab
4. Expand `dashboard` in state tree
5. Verify:
   - `notifications` array has 3 items
   - `featuredNews` array has 3 items
   - `schedules` array has 3 items
   - `populerArticles` array has 3 items
   - `documents` array has 4 items
   - `events` array has 3 items
   - `isLoading` is `false`
   - `error` is `null`

---

## 🎨 Visual/Style Testing

### **Colors**
- [ ] Primary color (blue) used correctly
- [ ] Danger color (red) for delete buttons
- [ ] Green for success badges
- [ ] Yellow for warning notifications

### **Typography**
- [ ] Headers are bold and readable
- [ ] Body text is appropriately sized
- [ ] Line heights are comfortable
- [ ] Text contrast is sufficient

### **Spacing**
- [ ] Padding is consistent (4px, 6px, 8px units)
- [ ] Gap between elements is proportional
- [ ] No text overlapping
- [ ] Adequate whitespace

### **Accessibility**
- [ ] All buttons accessible via Tab key
- [ ] Focus states visible
- [ ] Hover states clear
- [ ] Icons have alt text or labels

---

## 🐛 Common Issues & Solutions

| Issue | Check | Solution |
|-------|-------|----------|
| Dashboard blank | Auth state | Ensure user is logged in |
| Widgets not showing | Redux state | Check Redux DevTools |
| Styling off | Tailwind | Rebuild CSS: `npm start` |
| Images broken | Mock data | Verify image URLs in mockData.js |
| Layout broken | Grid classes | Check responsive classes |
| Errors in console | Browser console | Review error messages |

---

## 📱 Mobile Testing Checklist

- [ ] Header responsive and readable
- [ ] Stats cards stack properly
- [ ] Widgets fullwidth on mobile
- [ ] Buttons are touch-sized (min 44px)
- [ ] Images scale properly
- [ ] Text is readable (16px+ on mobile)
- [ ] No horizontal scrolling
- [ ] Forms are mobile-friendly

---

## 📈 Performance Testing

### **Check Performance**

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check:
   - Page load time < 3s
   - No failed requests
   - Images are optimized
   - No large JS files

### **Check Rendering**

1. Open DevTools → Performance tab
2. Record a session
3. Stop recording
4. Look for:
   - Smooth scrolling
   - No layout thrashing
   - React components render efficiently

---

## 🎬 Demo Flow for Presentation

### **5-Minute Demo**

1. **Login (30s)**
   - Show registration flow
   - Complete login

2. **Dashboard Overview (1m)**
   - Scroll through entire dashboard
   - Point out each section
   - Highlight responsive header

3. **Widget Interaction (1m)**
   - Mark notification as read
   - Delete notification
   - Click on various items

4. **Responsive Design (1.5m)**
   - Open DevTools
   - Toggle device toolbar
   - Show mobile/tablet/desktop views

5. **Redux DevTools (1m)**
   - Show Redux state
   - Demonstrate state changes

---

## ✅ Final Acceptance Checklist

Before considering dashboard "done", verify:

**Functionality**
- [ ] All 6 widgets render
- [ ] Notifications interactive
- [ ] All links work
- [ ] Redux state correct
- [ ] No console errors
- [ ] No broken images

**Design**
- [ ] Colors match theme
- [ ] Typography consistent
- [ ] Spacing balanced
- [ ] Components aligned
- [ ] Borders and shadows applied

**Responsive**
- [ ] Mobile layout works
- [ ] Tablet layout works
- [ ] Desktop layout works
- [ ] Touch interactions work
- [ ] No horizontal scroll

**Performance**
- [ ] Page loads quickly
- [ ] Smooth scrolling
- [ ] No lag on interactions
- [ ] Images optimized

**Documentation**
- [ ] README exists
- [ ] Components documented
- [ ] Props documented
- [ ] Usage examples provided

---

## 🚀 Next Steps

1. ✅ **Current:** Dashboard complete
2. ⏭️ **Next:** News & Articles page
3. ⏳ **Then:** Detail pages
4. ⏳ **Then:** Search & filters
5. ⏳ **Then:** FAQ section
6. ⏳ **Then:** Admin CMS
7. ⏳ **Then:** Q&A Forum

---

**Testing Guide Version:** 1.0
**Last Updated:** May 17, 2026
**Status:** ✅ Ready for Testing

