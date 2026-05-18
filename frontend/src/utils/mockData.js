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

// Comprehensive News Data by Category
export const mockAllNews = [
  // Academic Affairs
  {
    id: 101,
    title: "Hướng Dẫn Đăng Ký Học Phần Online Năm 2026",
    excerpt: "Quy trình và hướng dẫn chi tiết đăng ký học phần qua hệ thống online",
    category: "Academic Affairs",
    categoryId: "academic",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f70504466?w=600&h=400&fit=crop",
    views: 3450,
    saves: 289,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    author: "Phòng Đào Tạo HCMUTE",
    readTime: "5 min",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lịch đăng ký sẽ bắt đầu từ ngày 1/6/2026...",
  },
  {
    id: 102,
    title: "Quy Định Điểm Danh và Vắng Học Mới 2026",
    excerpt: "Cập nhật quy định về điểm danh, vắng học và xử lý kỷ luật",
    category: "Academic Affairs",
    categoryId: "academic",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 2100,
    saves: 145,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    author: "Phòng Quản Lý Sinh Viên",
    readTime: "6 min",
  },
  {
    id: 103,
    title: "Lịch Thi Cuối Kỳ - Học Kỳ II/2025-2026",
    excerpt: "Thông báo lịch thi cuối kỳ II và địa điểm thi của tất cả ngành học",
    category: "Academic Affairs",
    categoryId: "academic",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    views: 5600,
    saves: 420,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    author: "Phòng Đào Tạo",
    readTime: "4 min",
  },
  // Scholarships
  {
    id: 201,
    title: "Học Bổng Toàn Phần - Năm 2026/2027",
    excerpt: "Các chương trình học bổng từ các tổ chức quốc tế cho sinh viên xuất sắc",
    category: "Scholarships",
    categoryId: "scholarship",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    views: 4200,
    saves: 380,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    author: "Phòng Quan Hệ Quốc Tế",
    readTime: "8 min",
  },
  {
    id: 202,
    title: "Hướng Dẫn Nộp Hồ Sơ Xin Học Bổng ASEAN",
    excerpt: "Quy trình và hồ sơ cần thiết để xin học bổng ASEAN",
    category: "Scholarships",
    categoryId: "scholarship",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    views: 1890,
    saves: 156,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    author: "Trần Thị Hoa",
    readTime: "7 min",
  },
  {
    id: 203,
    title: "Học Bổng Toàn Phần từ Chính Phủ Singapore",
    excerpt: "Cơ hội nhận học bổng toàn phần từ Chính Phủ Singapore 2026",
    category: "Scholarships",
    categoryId: "scholarship",
    image:
      "https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=600&h=400&fit=crop",
    views: 2340,
    saves: 201,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: "Phòng Quan Hệ Quốc Tế",
    readTime: "6 min",
  },
  // Internships
  {
    id: 301,
    title: "Tuyển Dụng Thực Tập Công Ty FPT Software",
    excerpt: "Tuyển dụng 50 vị trí thực tập lập trình tại FPT Software, hỗ trợ toàn bộ chi phí",
    category: "Internships",
    categoryId: "internship",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 3890,
    saves: 301,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    author: "FPT Software",
    readTime: "4 min",
  },
  {
    id: 302,
    title: "Hướng Dẫn Viết CV và Phỏng Vấn Thực Tập",
    excerpt: "Những lưu ý quan trọng khi viết CV và chuẩn bị cho buổi phỏng vấn thực tập",
    category: "Internships",
    categoryId: "internship",
    image:
      "https://images.unsplash.com/photo-1560264357-8d9766985df0?w=600&h=400&fit=crop",
    views: 5200,
    saves: 412,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    author: "ThS. Nguyễn Văn A",
    readTime: "9 min",
  },
  {
    id: 303,
    title: "Quy Định Về Thực Tập và Công Nhân Viên Tạm Thời",
    excerpt: "Quyền lợi, nghĩa vụ và quy định pháp luật về việc làm thực tập",
    category: "Internships",
    categoryId: "internship",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 1560,
    saves: 89,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    author: "Phòng Tư Vấn Sự Nghiệp",
    readTime: "8 min",
  },
  // Jobs
  {
    id: 401,
    title: "Tuyển Dụng Thực Tập 2026 - Các Công Ty Hàng Đầu",
    excerpt: "Cơ hội thực tập tại các công ty công nghệ hàng đầu Việt Nam",
    category: "Jobs",
    categoryId: "jobs",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    views: 4500,
    saves: 356,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    author: "Phòng Tư Vấn Sự Nghiệp",
    readTime: "5 min",
  },
  {
    id: 402,
    title: "Cơ Hội Việc Làm Tại Startup Startupx Vietnam",
    excerpt: "Tuyển dụng 10 vị trí Intern + Junior Developer tại startup Startupx Vietnam",
    category: "Jobs",
    categoryId: "jobs",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 2100,
    saves: 176,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    author: "Startupx Vietnam",
    readTime: "4 min",
  },
  {
    id: 403,
    title: "Hướng Nghiệp sau Khi Tốt Nghiệp - Các Lựa Chọn Sự Nghiệp",
    excerpt: "Tìm hiểu các con đường sự nghiệp tiềm năng cho kỹ sư CNTT",
    category: "Jobs",
    categoryId: "jobs",
    image:
      "https://images.unsplash.com/photo-1560264357-8d9766985df0?w=600&h=400&fit=crop",
    views: 3200,
    saves: 245,
    date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    author: "TS. Lê Văn C",
    readTime: "10 min",
  },
  // Soft Skills
  {
    id: 501,
    title: "Hướng Dẫn Kỹ Năng Mềm cho Sinh Viên IT",
    excerpt: "Những kỹ năng cần thiết để thành công trong ngành IT và kinh doanh",
    category: "Soft Skills",
    categoryId: "softskills",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 5890,
    saves: 456,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    author: "ThS. Nguyễn Văn A",
    readTime: "12 min",
  },
  {
    id: 502,
    title: "Cách Giao Tiếp Hiệu Quả Trong Công Việc",
    excerpt: "Các kỹ thuật giao tiếp giúp bạn trở nên lãnh đạo tốt và nhân viên chuyên nghiệp",
    category: "Soft Skills",
    categoryId: "softskills",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    views: 4100,
    saves: 312,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    author: "Trần Thị Hoa",
    readTime: "8 min",
  },
  {
    id: 503,
    title: "Kỹ Năng Làm Việc Nhóm và Lãnh Đạo Dự Án",
    excerpt: "Phát triển khả năng làm việc nhóm và quản lý dự án hiệu quả",
    category: "Soft Skills",
    categoryId: "softskills",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 3400,
    saves: 267,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    author: "PGS. TS. Nguyễn Văn B",
    readTime: "11 min",
  },
  // Student Psychology
  {
    id: 601,
    title: "Làm Thế Nào Để Vượt Qua Căng Thẳng Kỳ Thi?",
    excerpt: "Những cách tiếp cận khoa học để giảm căng thẳng và tăng hiệu quả ôn thi",
    category: "Student Psychology",
    categoryId: "psychology",
    image:
      "https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=600&h=400&fit=crop",
    views: 6200,
    saves: 512,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    author: "TS. Lê Văn C",
    readTime: "9 min",
  },
  {
    id: 602,
    title: "Quản Lý Thời Gian Hiệu Quả Cho Sinh Viên",
    excerpt: "Kỹ thuật quản lý thời gian giúp bạn cân bằng học tập, công việc, và cuộc sống",
    category: "Student Psychology",
    categoryId: "psychology",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 5100,
    saves: 420,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    author: "ThS. Trần Thị B",
    readTime: "10 min",
  },
  {
    id: 603,
    title: "Cân Bằng Học Tập và Công Việc Bán Thời Gian",
    excerpt: "Hướng dẫn cách cân bằng giữa học tập và làm thêm bán thời gian",
    category: "Student Psychology",
    categoryId: "psychology",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    views: 3700,
    saves: 290,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    author: "Nguyễn Văn A",
    readTime: "7 min",
  },
  // Training Regulations
  {
    id: 701,
    title: "Điều Lệ Sinh Viên HCMUTE 2026 - Toàn Văn",
    excerpt: "Toàn bộ quy định về quyền lợi, nghĩa vụ và kỷ luật của sinh viên",
    category: "Training Regulations",
    categoryId: "regulations",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f70504466?w=600&h=400&fit=crop",
    views: 2340,
    saves: 178,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    author: "Phòng Quản Lý Sinh Viên",
    readTime: "15 min",
  },
  {
    id: 702,
    title: "Quy Định Xử Lý Kỷ Luật Sinh Viên",
    excerpt: "Chi tiết quy định về xử lý kỷ luật các hành vi vi phạm",
    category: "Training Regulations",
    categoryId: "regulations",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
    views: 1890,
    saves: 120,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    author: "Phòng Quản Lý Sinh Viên",
    readTime: "8 min",
  },
  {
    id: 703,
    title: "Hướng Dẫn Xin Học Lại, Học Thêm và Miễn Giảm Học Phí",
    excerpt: "Quy trình xin học lại, học thêm và các chương trình miễn giảm học phí",
    category: "Training Regulations",
    categoryId: "regulations",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    views: 2890,
    saves: 210,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    author: "Phòng Tài Chính - Hành Chính",
    readTime: "6 min",
  },
];

// Function to get news by category
export const getNewsByCategory = (categoryId) => {
  if (categoryId === "all") return mockAllNews;
  return mockAllNews.filter((news) => news.categoryId === categoryId);
};

// Function to get featured news
export const getFeaturedNews = () => {
  return [...mockAllNews].sort((a, b) => b.views - a.views).slice(0, 5);
};

export const mockCounselors = [
  {
    id: 1,
    name: "ThS. Nguyen Van A",
    expertise: ["Career Orientation", "Internships", "CV Review"],
    department: "Career Counseling Office",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop",
    views: 1200,
    saves: 88,
    content:
      "Experienced counselor supporting students with career planning, internship strategy, and interview preparation.",
  },
  {
    id: 2,
    name: "ThS. Tran Thi B",
    expertise: ["Scholarships", "Soft Skills", "Academic Planning"],
    department: "Student Support Center",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop",
    views: 980,
    saves: 72,
    content:
      "Advisor focused on scholarship applications, communication skills, and academic growth planning.",
  },
];

export const getDetailItem = (type, id) => {
  const numericId = Number(id);

  if (type === "news" || type === "article") {
    return mockAllNews.find((item) => item.id === numericId) || null;
  }

  if (type === "event") {
    const event = mockEvents.find((item) => item.id === numericId);
    if (!event) return null;
    return {
      ...event,
      author: event.faculty,
      excerpt: `${event.location} - ${event.time}`,
      category: "Event",
      categoryId: "event",
      date: new Date(event.date),
      readTime: "4 min",
      content:
        "Event details include agenda, speakers, and participation notes. Students should register early to secure seats.",
    };
  }

  if (type === "counselor") {
    const counselor = mockCounselors.find((item) => item.id === numericId);
    if (!counselor) return null;
    return {
      id: counselor.id,
      title: counselor.name,
      author: counselor.department,
      image: counselor.image,
      views: counselor.views,
      saves: counselor.saves,
      category: "Counselor",
      categoryId: "counselor",
      date: new Date(),
      readTime: "6 min",
      excerpt: counselor.expertise.join(" | "),
      content: counselor.content,
      tags: counselor.expertise,
    };
  }

  return null;
};

export const getRelatedItems = (type, id, limit = 3) => {
  const numericId = Number(id);
  if (type === "news" || type === "article") {
    const current = mockAllNews.find((item) => item.id === numericId);
    if (!current) return [];
    return mockAllNews
      .filter((item) => item.id !== numericId && item.categoryId === current.categoryId)
      .slice(0, limit);
  }

  if (type === "event") {
    return mockEvents
      .filter((item) => item.id !== numericId)
      .slice(0, limit)
      .map((event) => ({
        ...event,
        author: event.faculty,
        excerpt: `${event.location} - ${event.time}`,
        category: "Event",
        categoryId: "event",
        date: new Date(event.date),
      }));
  }

  if (type === "counselor") {
    return mockCounselors
      .filter((item) => item.id !== numericId)
      .slice(0, limit)
      .map((item) => ({
        id: item.id,
        title: item.name,
        image: item.image,
        author: item.department,
        excerpt: item.expertise.join(" | "),
        category: "Counselor",
        categoryId: "counselor",
        views: item.views,
        saves: item.saves,
        date: new Date(),
      }));
  }

  return [];
};

export const getMockComments = (id) => {
  const seed = Number(id) || 0;
  return [
    {
      id: `${id}-1`,
      user: "Le Minh",
      rating: 5,
      content: "Noi dung rat huu ich, de ap dung vao hoc tap va cong viec.",
      createdAt: new Date(Date.now() - (seed + 2) * 3600000),
    },
    {
      id: `${id}-2`,
      user: "Tran Anh",
      rating: 4,
      content: "Trinh bay ro rang, mong co them vi du thuc te hon.",
      createdAt: new Date(Date.now() - (seed + 8) * 3600000),
    },
  ];
};

export const advancedSearchOptions = {
  topics: [
    "Academic Affairs",
    "Scholarships",
    "Internships",
    "Jobs",
    "Soft Skills",
    "Student Psychology",
    "Training Regulations",
  ],
  faculties: [
    "Khoa Cong Nghe Thong Tin",
    "Khoa Kinh Te",
    "Phong Dao Tao",
    "Phong Quan Ly Sinh Vien",
    "Career Counseling Office",
    "Student Support Center",
  ],
  contentTypes: ["Article", "News", "Event", "Counselor", "Schedule"],
  publishTimes: ["Last 24 hours", "Last 7 days", "Last 30 days", "All"],
  popularities: ["High", "Medium", "Low", "All"],
  counselingFormats: ["Online", "Offline", "Hybrid", "All"],
  appointmentStatuses: ["Confirmed", "Pending", "Completed", "All"],
};

export const mockAdvancedSearchItems = [
  {
    id: "s-101",
    title: "Huong Dan Dang Ky Hoc Phan Online",
    excerpt: "Quy trinh dang ky hoc phan va nhung moc quan trong trong hoc ky moi.",
    topic: "Academic Affairs",
    faculty: "Phong Dao Tao",
    contentType: "Article",
    publishTime: "Last 7 days",
    popularity: "High",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "article",
    refId: 101,
    views: 3450,
  },
  {
    id: "s-201",
    title: "Hoc Bong Toan Phan 2026/2027",
    excerpt: "Tong hop hoc bong quoc te va dieu kien nop ho so.",
    topic: "Scholarships",
    faculty: "Phong Quan Ly Sinh Vien",
    contentType: "News",
    publishTime: "Last 7 days",
    popularity: "High",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "news",
    refId: 201,
    views: 4200,
  },
  {
    id: "s-301",
    title: "Tuyen Dung Thuc Tap FPT Software",
    excerpt: "Co hoi thuc tap va lo trinh ung tuyen cho sinh vien nam 3, nam 4.",
    topic: "Internships",
    faculty: "Career Counseling Office",
    contentType: "News",
    publishTime: "Last 24 hours",
    popularity: "High",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "news",
    refId: 301,
    views: 3890,
  },
  {
    id: "s-401",
    title: "Co Hoi Viec Lam Sau Tot Nghiep",
    excerpt: "Danh sach vi tri junior va trainee cho sinh vien moi ra truong.",
    topic: "Jobs",
    faculty: "Career Counseling Office",
    contentType: "News",
    publishTime: "Last 30 days",
    popularity: "Medium",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "news",
    refId: 403,
    views: 3200,
  },
  {
    id: "s-501",
    title: "Ky Nang Mem Cho Sinh Vien IT",
    excerpt: "Giao tiep, thuyet trinh, lam viec nhom va ky luat ca nhan.",
    topic: "Soft Skills",
    faculty: "Khoa Cong Nghe Thong Tin",
    contentType: "Article",
    publishTime: "Last 7 days",
    popularity: "High",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "article",
    refId: 501,
    views: 5890,
  },
  {
    id: "s-601",
    title: "Vuot Qua Cang Thang Ky Thi",
    excerpt: "Nhung ky thuat tam ly de giam lo au va on tap hieu qua.",
    topic: "Student Psychology",
    faculty: "Khoa Kinh Te",
    contentType: "Article",
    publishTime: "Last 24 hours",
    popularity: "High",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "article",
    refId: 601,
    views: 6200,
  },
  {
    id: "s-701",
    title: "Dieu Le Sinh Vien HCMUTE 2026",
    excerpt: "Tong hop quy dinh dao tao, ky luat, va quyen loi sinh vien.",
    topic: "Training Regulations",
    faculty: "Phong Quan Ly Sinh Vien",
    contentType: "Article",
    publishTime: "Last 30 days",
    popularity: "Medium",
    counselingFormat: "All",
    appointmentStatus: "All",
    type: "article",
    refId: 701,
    views: 2340,
  },
  {
    id: "s-e1",
    title: "Hoi Thao Xu Huong Cong Viec 2026",
    excerpt: "Su kien chia se thong tin thi truong lao dong va ky nang can co.",
    topic: "Jobs",
    faculty: "Khoa Cong Nghe Thong Tin",
    contentType: "Event",
    publishTime: "Last 7 days",
    popularity: "Medium",
    counselingFormat: "Offline",
    appointmentStatus: "Confirmed",
    type: "event",
    refId: 1,
    views: 1500,
  },
  {
    id: "s-c1",
    title: "Counselor Nguyen Van A",
    excerpt: "Tu van huong nghiep, CV review, va lap ke hoach thuc tap.",
    topic: "Jobs",
    faculty: "Career Counseling Office",
    contentType: "Counselor",
    publishTime: "All",
    popularity: "Medium",
    counselingFormat: "Online",
    appointmentStatus: "Completed",
    type: "counselor",
    refId: 1,
    views: 1200,
  },
  {
    id: "s-c2",
    title: "Counselor Tran Thi B",
    excerpt: "Tu van hoc bong, ky nang mem va lap ke hoach hoc tap.",
    topic: "Scholarships",
    faculty: "Student Support Center",
    contentType: "Counselor",
    publishTime: "All",
    popularity: "Low",
    counselingFormat: "Offline",
    appointmentStatus: "Pending",
    type: "counselor",
    refId: 2,
    views: 980,
  },
  {
    id: "s-sch1",
    title: "Lich Tu Van Huong Nghiep 20/05",
    excerpt: "Buoi tu van online voi ThS. Nguyen Van A.",
    topic: "Jobs",
    faculty: "Career Counseling Office",
    contentType: "Schedule",
    publishTime: "Last 24 hours",
    popularity: "Low",
    counselingFormat: "Online",
    appointmentStatus: "Confirmed",
    type: "counselor",
    refId: 1,
    views: 320,
  },
  {
    id: "s-sch2",
    title: "Lich Tu Van Hoc Bong 22/05",
    excerpt: "Buoi tu van truc tiep voi ThS. Tran Thi B.",
    topic: "Scholarships",
    faculty: "Student Support Center",
    contentType: "Schedule",
    publishTime: "Last 24 hours",
    popularity: "Low",
    counselingFormat: "Offline",
    appointmentStatus: "Pending",
    type: "counselor",
    refId: 2,
    views: 210,
  },
];

export const applyAdvancedFilters = (items, filters) => {
  const keyword = filters.keyword.trim().toLowerCase();

  return items.filter((item) => {
    const matchKeyword =
      !keyword ||
      item.title.toLowerCase().includes(keyword) ||
      item.excerpt.toLowerCase().includes(keyword);

    const matchTopic = !filters.topic || item.topic === filters.topic;
    const matchFaculty = !filters.faculty || item.faculty === filters.faculty;
    const matchContentType =
      !filters.contentType || item.contentType === filters.contentType;

    const matchPublishTime =
      !filters.publishTime ||
      filters.publishTime === "All" ||
      item.publishTime === filters.publishTime;

    const matchPopularity =
      !filters.popularity ||
      filters.popularity === "All" ||
      item.popularity === filters.popularity;

    const matchFormat =
      !filters.counselingFormat ||
      filters.counselingFormat === "All" ||
      item.counselingFormat === filters.counselingFormat;

    const matchStatus =
      !filters.appointmentStatus ||
      filters.appointmentStatus === "All" ||
      item.appointmentStatus === filters.appointmentStatus;

    return (
      matchKeyword &&
      matchTopic &&
      matchFaculty &&
      matchContentType &&
      matchPublishTime &&
      matchPopularity &&
      matchFormat &&
      matchStatus
    );
  });
};

export const mockFAQCategories = [
  "All",
  "Academic Affairs",
  "Scholarships",
  "Internships",
  "Jobs",
  "Soft Skills",
  "Student Psychology",
  "Training Regulations",
];

export const mockFAQs = [
  {
    id: 1,
    category: "Academic Affairs",
    question: "Khi nao mo dang ky hoc phan hoc ky moi?",
    answer:
      "Thong thuong he thong mo truoc 2-3 tuan truoc khi hoc ky bat dau. Ban nen theo doi thong bao tu Phong Dao Tao va kiem tra lich ca nhan tren cong thong tin sinh vien.",
  },
  {
    id: 2,
    category: "Scholarships",
    question: "Dieu kien co ban de dang ky hoc bong la gi?",
    answer:
      "Ban can dap ung nguong diem trung binh theo tung chuong trinh, khong vi pham ky luat, va hoan thanh day du ho so (bang diem, thu gioi thieu, bai luan ca nhan neu co).",
  },
  {
    id: 3,
    category: "Internships",
    question: "Sinh vien nam 2 co the di thuc tap som duoc khong?",
    answer:
      "Co. Tuy nhien nen uu tien vi tri part-time hoac intern co mentor de can bang lich hoc. Ban can xac nhan voi co van hoc tap neu mon hoc trung lich lam.",
  },
  {
    id: 4,
    category: "Jobs",
    question: "Can chuan bi gi truoc buoi phong van dau tien?",
    answer:
      "Hay chuan bi CV gon gang, tim hieu cong ty, luyen cau hoi hanh vi (STAR), va chuan bi 2-3 cau hoi nguoc lai cho nha tuyen dung de the hien su chu dong.",
  },
  {
    id: 5,
    category: "Soft Skills",
    question: "Lam sao de cai thien ky nang thuyet trinh?",
    answer:
      "Tap trung vao cau truc 3 phan (mo dau, noi dung chinh, ket luan), luyen tap voi thoi gian co dinh, ghi hinh de tu danh gia, va nhan phan hoi tu ban hoc.",
  },
  {
    id: 6,
    category: "Student Psychology",
    question: "Minh bi stress truoc ky thi, nen bat dau tu dau?",
    answer:
      "Hay chia nho ke hoach on tap theo tung ngay, uu tien ngu du, van dong nhe, va han che hoc dan trai. Neu lo au keo dai, co the dat lich voi counselor tam ly.",
  },
  {
    id: 7,
    category: "Training Regulations",
    question: "Neu rot mon thi co duoc hoc lai ngay khong?",
    answer:
      "Ban can theo lich mo lop hoc lai cua khoa/bo mon. Tien trinh thuong duoc dang tren portal. Luu y han dang ky va hoc phi hoc lai.",
  },
  {
    id: 8,
    category: "Academic Affairs",
    question: "Co theft xin bao luu ket qua hoc tap trong truong hop dac biet khong?",
    answer:
      "Co. Ban can nop don kem minh chung hop le (suc khoe, gia dinh, nghia vu). Quy trinh do Phong Dao Tao va khoa quan ly xem xet.",
  },
];

export const mockLibraryTemplates = [
  {
    id: "lib-1",
    title: "Mau CV Internship (IT)",
    type: "DOCX",
    category: "Jobs",
    size: "0.6 MB",
    downloads: 1350,
    updatedAt: "2026-05-10",
  },
  {
    id: "lib-2",
    title: "Mau Thu Xin Hoc Bong",
    type: "DOCX",
    category: "Scholarships",
    size: "0.4 MB",
    downloads: 940,
    updatedAt: "2026-05-08",
  },
  {
    id: "lib-3",
    title: "Checklist On Thi Cuoi Ky",
    type: "PDF",
    category: "Academic Affairs",
    size: "1.1 MB",
    downloads: 2280,
    updatedAt: "2026-05-06",
  },
  {
    id: "lib-4",
    title: "Mau Ke Hoach Hoc Tap Ca Nhan",
    type: "XLSX",
    category: "Soft Skills",
    size: "0.8 MB",
    downloads: 760,
    updatedAt: "2026-05-02",
  },
  {
    id: "lib-5",
    title: "Huong Dan Xu Ly Khung Hoang Tam Ly Co Ban",
    type: "PDF",
    category: "Student Psychology",
    size: "1.9 MB",
    downloads: 650,
    updatedAt: "2026-04-30",
  },
];

export const mockCMSData = {
  articles: [
    {
      id: "a-1",
      title: "Huong dan viet CV cho intern",
      topic: "Jobs",
      status: "Published",
      author: "Career Center",
      updatedAt: "2026-05-10",
    },
    {
      id: "a-2",
      title: "Ky nang phong van co ban",
      topic: "Soft Skills",
      status: "Draft",
      author: "Student Affairs",
      updatedAt: "2026-05-12",
    },
  ],
  topics: [
    { id: "t-1", name: "Academic Affairs", status: "Active", updatedAt: "2026-05-01" },
    { id: "t-2", name: "Scholarships", status: "Active", updatedAt: "2026-05-02" },
    { id: "t-3", name: "Student Psychology", status: "Active", updatedAt: "2026-05-04" },
  ],
  faqs: [
    {
      id: "f-1",
      question: "Khi nao mo dang ky hoc phan?",
      category: "Academic Affairs",
      status: "Published",
      updatedAt: "2026-05-03",
    },
    {
      id: "f-2",
      question: "Dieu kien xin hoc bong la gi?",
      category: "Scholarships",
      status: "Published",
      updatedAt: "2026-05-05",
    },
  ],
  schedules: [
    {
      id: "s-1",
      title: "Tu van huong nghiep",
      counselor: "ThS. Nguyen Van A",
      format: "Online",
      status: "Confirmed",
      updatedAt: "2026-05-08",
    },
    {
      id: "s-2",
      title: "Tu van hoc bong",
      counselor: "ThS. Tran Thi B",
      format: "Offline",
      status: "Pending",
      updatedAt: "2026-05-09",
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Cap nhat lich tu van thang 6",
      type: "Info",
      status: "Published",
      updatedAt: "2026-05-11",
    },
    {
      id: "n-2",
      title: "Nhac nho han nop ho so hoc bong",
      type: "Warning",
      status: "Published",
      updatedAt: "2026-05-13",
    },
  ],
};

// Forum mock threads
export const mockForumThreads = [
  {
    id: "thread-1",
    title: "Làm sao để tìm thực tập phù hợp cho sinh viên năm 2?",
    content:
      "Mình là sinh viên năm 2, chưa có nhiều kinh nghiệm. Ai có kinh nghiệm tìm thực tập sớm chia sẻ cách viết CV và nơi tìm việc?",
    author: "Nguyen Van A",
    tags: ["Internships", "CV"],
    createdAt: new Date().toISOString(),
    solved: false,
    votes: 5,
    replies: [
      {
        id: "r1",
        user: "Tran Thi B",
        content: "Bạn nên chuẩn bị CV ngắn gọn, nêu project cá nhân, và apply qua trang career portal của trường và LinkedIn.",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "thread-2",
    title: "Kỹ thuật quản lý thời gian khi ôn thi cuối kỳ",
    content:
      "Ai có schedule ôn thi hiệu quả cho 4 môn trong 2 tuần? Mình muốn tham khảo cách phân bổ thời gian và tài liệu.",
    author: "Le Minh",
    tags: ["Academic Affairs", "Study"],
    createdAt: new Date().toISOString(),
    solved: false,
    votes: 3,
    replies: [],
  },
];