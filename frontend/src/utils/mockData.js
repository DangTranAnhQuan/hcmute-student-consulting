// Mock data for dashboard and content features

export const mockNotifications = [
  {
    id: 1,
    type: "info",
    title: "Cập nhật Lịch Tư Vấn",
    message: "Lịch tư vấn tháng 6 đã cập nhật",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 2,
    type: "success",
    title: "Lịch Hẹn Đã Xác Nhận",
    message: "Cuộc tư vấn của bạn lúc 10:00 sáng ngày 20/5 được xác nhận",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 3,
    type: "warning",
    title: "Thông Báo Quan Trọng",
    message: "Hạn đăng ký học phần mở rộng sắp kết thúc",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

export const mockFeaturedNews = [
  {
    id: 1,
    title: "Tuyển Dụng Thực Tập 2026 - Các Công Ty Hàng Đầu",
    excerpt: "Cơ hội thực tập tại các công ty công nghệ hàng đầu Việt Nam",
    category: "Jobs",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    views: 1250,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    title: "Học Bổng Toàn Phần - Năm 2026/2027",
    excerpt: "Các chương trình học bổng từ các tổ chức quốc tế",
    category: "Scholarships",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
    views: 890,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    title: "Hướng Dẫn Kỹ Năng Mềm cho Sinh Viên IT",
    excerpt: "Những kỹ năng cần thiết để thành công trong ngành IT",
    category: "Soft Skills",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
    views: 2100,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

export const mockSchedules = [
  {
    id: 1,
    title: "Tư Vấn Hướng Nghiệp",
    counselor: "ThS. Nguyễn Văn A",
    time: "09:00 - 10:00",
    date: "2026-05-20",
    format: "Online",
    status: "confirmed",
  },
  {
    id: 2,
    title: "Tư Vấn Học Bổng",
    counselor: "ThS. Trần Thị B",
    time: "14:00 - 15:00",
    date: "2026-05-22",
    format: "Offline",
    status: "pending",
  },
  {
    id: 3,
    title: "Tư Vấn Thích Ứng Sinh Viên Năm 1",
    counselor: "TS. Lê Văn C",
    time: "10:00 - 11:00",
    date: "2026-05-25",
    format: "Online",
    status: "confirmed",
  },
];

export const mockPopularArticles = [
  {
    id: 1,
    title: "Làm Thế Nào Để Vượt Qua Căng Thẳng Kỳ Thi?",
    author: "TS. Lê Văn C",
    category: "Student Psychology",
    views: 5200,
    saves: 450,
    readTime: "5 min",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Quản Lý Thời Gian Hiệu Quả Cho Sinh Viên",
    author: "ThS. Nguyễn Văn A",
    category: "Academic Affairs",
    views: 4890,
    saves: 380,
    readTime: "7 min",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Cân Bằng Học Tập và Công Việc Bán Thời Gian",
    author: "ThS. Trần Thị B",
    category: "Internships",
    views: 3450,
    saves: 290,
    readTime: "6 min",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
];

export const mockDocuments = [
  {
    id: 1,
    name: "Điều Lệ Sinh Viên HCMUTE 2026",
    type: "PDF",
    size: "2.4 MB",
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    downloads: 1250,
  },
  {
    id: 2,
    name: "Hướng Dẫn Đăng Ký Học Phần",
    type: "PDF",
    size: "1.8 MB",
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    downloads: 890,
  },
  {
    id: 3,
    name: "Mẫu CV Tiêu Chuẩn",
    type: "DOCX",
    size: "0.5 MB",
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    downloads: 2340,
  },
  {
    id: 4,
    name: "Thỏa Thuận Thực Tập",
    type: "PDF",
    size: "1.2 MB",
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    downloads: 540,
  },
];

export const mockEvents = [
  {
    id: 1,
    title: "Hội Thảo: Xu Hướng Công Việc 2026",
    faculty: "Khoa Công Nghệ Thông Tin",
    date: "2026-05-25",
    time: "14:00",
    location: "Phòng T201",
    attendees: 150,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Ngày Hội Tư Vấn Tuyển Dụng",
    faculty: "Phòng Quản Lý Sinh Viên",
    date: "2026-05-28",
    time: "09:00",
    location: "Sân Vận Động A",
    attendees: 500,
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Buổi Giao Lưu Với Cựu Sinh Viên Thành Công",
    faculty: "Khoa Kinh Tế",
    date: "2026-06-01",
    time: "18:00",
    location: "Hội Trường D",
    attendees: 300,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
  },
];

export const mockCategories = [
  { id: "academic", name: "Academic Affairs", icon: "📚", color: "blue" },
  { id: "scholarship", name: "Scholarships", icon: "🎓", color: "purple" },
  { id: "internship", name: "Internships", icon: "💼", color: "green" },
  { id: "jobs", name: "Jobs", icon: "🚀", color: "red" },
  { id: "softskills", name: "Soft Skills", icon: "🎯", color: "yellow" },
  { id: "psychology", name: "Student Psychology", icon: "🧠", color: "pink" },
  {
    id: "regulations",
    name: "Training Regulations",
    icon: "📋",
    color: "indigo",
  },
];

export const mockUserData = {
  id: "user123",
  username: "nguyenvana",
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@student.hcmute.edu.vn",
  phone: "0912345678",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
  faculty: "Khoa Công Nghệ Thông Tin",
  studentId: "20211234",
  savedCount: 45,
  articlesRead: 127,
};

