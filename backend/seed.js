const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");
const Counselor = require("./src/models/Counselor");
const Availability = require("./src/models/Availability");
const Article = require("./src/models/Article");
const FAQ = require("./src/models/FAQ");
const ForumThread = require("./src/models/ForumThread");

require("dotenv").config();

const password = "123456";

const demoUsers = [
  {
    username: "admin",
    email: "admin@hcmute.edu.vn",
    role: "admin",
    fullName: "Quản trị viên HCMUTE",
    phone: "0900000001",
  },
  {
    username: "duy",
    email: "duy@student.hcmute.edu.vn",
    role: "user",
    fullName: "Đinh Nguyễn Đức Duy",
    phone: "0900000002",
  },
];

const counselorProfiles = [
  {
    username: "quan_counselor",
    email: "quan.counselor@hcmute.edu.vn",
    fullName: "Nguyễn Minh Quân",
    expertise: ["Academic", "Career"],
    bio: "Hỗ trợ sinh viên xây dựng kế hoạch học tập, định hướng nghề nghiệp và chuẩn bị CV thực tập.",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=720&h=520&fit=crop",
    hourlyRate: 150000,
    rating: 4.8,
    totalBookings: 45,
  },
  {
    username: "thien_counselor",
    email: "thien.counselor@hcmute.edu.vn",
    fullName: "Trần Hoàng Thiên",
    expertise: ["Mental Health", "Personal Development"],
    bio: "Tư vấn cân bằng học tập, áp lực thi cử, kỹ năng quản lý thời gian và phát triển bản thân.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=720&h=520&fit=crop",
    hourlyRate: 200000,
    rating: 4.9,
    totalBookings: 62,
  },
  {
    username: "khang_counselor",
    email: "khang.counselor@hcmute.edu.vn",
    fullName: "Lê Gia Khang",
    expertise: ["Financial", "Career"],
    bio: "Hướng dẫn quản lý chi phí sinh viên, học bổng, kế hoạch thực tập và phỏng vấn doanh nghiệp.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=720&h=520&fit=crop",
    hourlyRate: 180000,
    rating: 4.7,
    totalBookings: 38,
  },
  {
    username: "duy_counselor",
    email: "duy.counselor@hcmute.edu.vn",
    fullName: "Phạm Đức Duy",
    expertise: ["Academic", "Personal Development"],
    bio: "Tư vấn phương pháp học đại học, xử lý cảnh báo học vụ và xây dựng lộ trình kỹ năng mềm.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=720&h=520&fit=crop",
    hourlyRate: 120000,
    rating: 4.6,
    totalBookings: 55,
  },
  {
    username: "linh_counselor",
    email: "linh.counselor@hcmute.edu.vn",
    fullName: "Võ Thanh Linh",
    expertise: ["Academic"],
    bio: "Tư vấn đăng ký học phần, học cải thiện, kế hoạch tín chỉ và xử lý cảnh báo học vụ.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=720&h=520&fit=crop",
    hourlyRate: 130000,
    rating: 4.7,
    totalBookings: 41,
  },
  {
    username: "mai_counselor",
    email: "mai.counselor@hcmute.edu.vn",
    fullName: "Đặng Ngọc Mai",
    expertise: ["Career", "Personal Development"],
    bio: "Hỗ trợ định hướng nghề nghiệp, chuẩn bị portfolio, kỹ năng phỏng vấn và xây dựng thương hiệu cá nhân.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=720&h=520&fit=crop",
    hourlyRate: 170000,
    rating: 4.8,
    totalBookings: 58,
  },
  {
    username: "hieu_counselor",
    email: "hieu.counselor@hcmute.edu.vn",
    fullName: "Bùi Nhật Hiếu",
    expertise: ["Financial", "Academic"],
    bio: "Tư vấn học bổng, miễn giảm học phí, cân đối chi phí sinh hoạt và lập kế hoạch học tập phù hợp ngân sách.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=720&h=520&fit=crop",
    hourlyRate: 160000,
    rating: 4.5,
    totalBookings: 36,
  },
  {
    username: "ngan_counselor",
    email: "ngan.counselor@hcmute.edu.vn",
    fullName: "Hoàng Thảo Ngân",
    expertise: ["Mental Health"],
    bio: "Hỗ trợ sinh viên xử lý stress, lo âu trước kỳ thi, áp lực gia đình và cân bằng cuộc sống đại học.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=720&h=520&fit=crop",
    hourlyRate: 210000,
    rating: 4.9,
    totalBookings: 73,
  },
  {
    username: "phuc_counselor",
    email: "phuc.counselor@hcmute.edu.vn",
    fullName: "Ngô Gia Phúc",
    expertise: ["Career"],
    bio: "Tư vấn thực tập doanh nghiệp, viết CV kỹ thuật, luyện phỏng vấn và chọn hướng công nghệ phù hợp.",
    image:
      "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=720&h=520&fit=crop",
    hourlyRate: 190000,
    rating: 4.6,
    totalBookings: 44,
  },
  {
    username: "vy_counselor",
    email: "vy.counselor@hcmute.edu.vn",
    fullName: "Lâm Tường Vy",
    expertise: ["Personal Development", "Academic"],
    bio: "Hướng dẫn kỹ năng học đại học, làm việc nhóm, thuyết trình và quản lý tiến độ đồ án.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=520&fit=crop",
    hourlyRate: 140000,
    rating: 4.7,
    totalBookings: 47,
  },
  {
    username: "son_counselor",
    email: "son.counselor@hcmute.edu.vn",
    fullName: "Trịnh Minh Sơn",
    expertise: ["Financial", "Personal Development"],
    bio: "Tư vấn quản lý tài chính cá nhân, kế hoạch học bổng và kỹ năng ra quyết định trong giai đoạn khó khăn.",
    image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=720&h=520&fit=crop",
    hourlyRate: 155000,
    rating: 4.4,
    totalBookings: 29,
  },
  {
    username: "hanh_counselor",
    email: "hanh.counselor@hcmute.edu.vn",
    fullName: "Phan Mỹ Hạnh",
    expertise: ["Mental Health", "Academic"],
    bio: "Tư vấn tâm lý học đường, điều chỉnh kế hoạch học tập khi quá tải và hỗ trợ sinh viên năm nhất thích nghi.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=720&h=520&fit=crop",
    hourlyRate: 205000,
    rating: 4.8,
    totalBookings: 67,
  },
];

const sampleArticles = [
  {
    title: "Mở cổng đặt lịch tư vấn học kỳ 2 năm 2026",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "News",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&h=520&fit=crop",
    views: 3200,
    saves: 180,
    readTime: "3 phút",
    tags: ["Academic Affairs", "Tư vấn"],
    excerpt:
      "Sinh viên có thể đặt nhiều yêu cầu tư vấn học tập, nghề nghiệp và kỹ năng cá nhân ngay trên hệ thống.",
    body:
      "Từ học kỳ 2 năm 2026, hệ thống tư vấn sinh viên HCMUTE mở cổng đặt lịch trực tuyến. Sinh viên đăng nhập, chọn tư vấn viên, thêm nội dung cần hỗ trợ vào giỏ tư vấn và gửi yêu cầu. Mỗi yêu cầu đều có trạng thái theo dõi rõ ràng từ lúc tạo đến lúc hoàn tất.",
  },
  {
    title: "MoMo Sandbox được bật cho thanh toán thử nghiệm",
    topic: "Thanh toán",
    status: "Published",
    author: "Ban quản trị hệ thống",
    faculty: "Student Support Center",
    contentType: "News",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=520&fit=crop",
    views: 2460,
    saves: 160,
    readTime: "4 phút",
    tags: ["Thanh toán", "MoMo"],
    excerpt:
      "Ngoài COD, hệ thống hỗ trợ thanh toán thử nghiệm qua MoMo Sandbox cho các yêu cầu tư vấn có phí.",
    body:
      "MoMo Sandbox được dùng cho môi trường demo. Nếu sinh viên thoát khỏi màn hình thanh toán mà chưa trả tiền, yêu cầu sẽ nằm ở trạng thái chờ thanh toán và có thể thanh toán lại trong lịch sử yêu cầu. Admin không được xác nhận hoặc xử lý yêu cầu MoMo khi tiền chưa thành công.",
  },
  {
    title: "Ngày hội tư vấn nghề nghiệp và thực tập 2026",
    topic: "Career",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Event",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=520&fit=crop",
    views: 4100,
    saves: 320,
    readTime: "2 phút",
    tags: ["Career", "Internships", "Jobs"],
    excerpt:
      "Sự kiện kết nối sinh viên với doanh nghiệp, cố vấn nghề nghiệp và cơ hội thực tập.",
    body:
      "Ngày hội tư vấn nghề nghiệp giúp sinh viên trao đổi trực tiếp với doanh nghiệp, nhận góp ý CV và đặt lịch tư vấn chuyên sâu với cố vấn nghề nghiệp. Sinh viên nên chuẩn bị CV, bảng điểm và danh sách câu hỏi trước khi tham dự.",
  },
  {
    title: "Học bổng hỗ trợ sinh viên khó khăn đợt tháng 6",
    topic: "Scholarships",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "News",
    image:
      "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=900&h=520&fit=crop",
    views: 1780,
    saves: 220,
    readTime: "3 phút",
    tags: ["Scholarships", "Financial"],
    excerpt:
      "Thông tin học bổng hỗ trợ sinh viên có hoàn cảnh khó khăn và hướng dẫn chuẩn bị hồ sơ.",
    body:
      "Sinh viên cần chuẩn bị đơn đề nghị, minh chứng hoàn cảnh, bảng điểm và thông tin tài khoản nhận học bổng. Nếu chưa rõ điều kiện, sinh viên có thể đặt lịch tư vấn tài chính để được hướng dẫn trước khi nộp.",
  },
  {
    title: "Quy trình đăng ký tư vấn sinh viên online",
    topic: "Giỏ tư vấn",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "Article",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=520&fit=crop",
    views: 3600,
    saves: 410,
    readTime: "6 phút",
    tags: ["Giỏ tư vấn", "Theo dõi yêu cầu"],
    excerpt:
      "Hướng dẫn sinh viên chọn tư vấn viên, thêm vào giỏ tư vấn, thanh toán và theo dõi yêu cầu.",
    body:
      "Sinh viên đăng nhập hệ thống, vào mục Đặt tư vấn, chọn tư vấn viên phù hợp và thêm từng nội dung cần hỗ trợ vào giỏ. Trong giỏ tư vấn, sinh viên có thể tick một hoặc nhiều mục để gửi yêu cầu. Sau khi thanh toán COD hoặc MoMo Sandbox, yêu cầu xuất hiện trong lịch sử để theo dõi trạng thái.",
  },
  {
    title: "Chuẩn bị hồ sơ trước buổi tư vấn nghề nghiệp",
    topic: "Career",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Article",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900&h=520&fit=crop",
    views: 1850,
    saves: 260,
    readTime: "5 phút",
    tags: ["Career", "Internships"],
    excerpt:
      "Những thông tin cần chuẩn bị để buổi tư vấn nghề nghiệp đạt hiệu quả.",
    body:
      "Sinh viên nên chuẩn bị CV, bảng điểm, mục tiêu nghề nghiệp và danh sách câu hỏi trước khi gặp tư vấn viên.",
  },
  {
    title: "Cách xử lý khi gặp cảnh báo học vụ",
    topic: "Training Regulations",
    status: "Published",
    author: "Phòng Đào tạo",
    faculty: "HCMUTE",
    contentType: "Article",
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&h=520&fit=crop",
    views: 980,
    saves: 120,
    readTime: "7 phút",
    tags: ["Training Regulations", "Academic Affairs"],
    excerpt:
      "Các bước sinh viên cần thực hiện khi nhận cảnh báo học vụ hoặc cần điều chỉnh kế hoạch học tập.",
    body:
      "Sinh viên cần kiểm tra số tín chỉ tích lũy, GPA, liên hệ cố vấn học tập và đặt lịch tư vấn nếu cần xây dựng lại kế hoạch học tập.",
  },
];

const extraContentItems = [
  {
    title: "Lịch đăng ký học phần bổ sung tháng 6",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Đào tạo",
    faculty: "HCMUTE",
    contentType: "News",
    image: "https://picsum.photos/seed/hcmute-news-academic/900/520",
    views: 2910,
    saves: 170,
    readTime: "3 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Thông báo thời gian mở cổng đăng ký học phần bổ sung và các lưu ý về điều kiện tiên quyết.",
    body:
      "Sinh viên cần kiểm tra kế hoạch học tập, điều kiện tiên quyết và học phí trước khi đăng ký học phần bổ sung. Nếu bị vướng cảnh báo học vụ, sinh viên nên đặt tư vấn học tập trước khi điều chỉnh lịch.",
  },
  {
    title: "Workshop viết CV cho sinh viên năm 3",
    topic: "Internships",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Event",
    image: "https://picsum.photos/seed/hcmute-event-cv/900/520",
    views: 3370,
    saves: 280,
    readTime: "2 phút",
    tags: ["Internships", "Career", "Soft Skills"],
    excerpt:
      "Buổi workshop hướng dẫn sinh viên chuẩn bị CV, portfolio và câu trả lời phỏng vấn thực tập.",
    body:
      "Workshop tập trung vào cách trình bày kinh nghiệm dự án, kỹ năng kỹ thuật, kỹ năng mềm và mục tiêu nghề nghiệp. Sinh viên có thể đặt lịch tư vấn nghề nghiệp sau workshop để được góp ý riêng.",
  },
  {
    title: "Doanh nghiệp tuyển thực tập sinh Java và React",
    topic: "Jobs",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "News",
    image: "https://picsum.photos/seed/hcmute-news-jobs/900/520",
    views: 4520,
    saves: 390,
    readTime: "4 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Danh sách doanh nghiệp đang tuyển thực tập sinh phát triển phần mềm, ưu tiên sinh viên có dự án cá nhân.",
    body:
      "Sinh viên nên chuẩn bị CV, GitHub, mô tả dự án môn học và lịch rảnh. Những bạn chưa rõ định hướng công nghệ có thể đặt lịch tư vấn nghề nghiệp để chọn lộ trình phù hợp.",
  },
  {
    title: "Tư vấn học bổng doanh nghiệp học kỳ mới",
    topic: "Scholarships",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "Event",
    image: "https://picsum.photos/seed/hcmute-event-scholarship/900/520",
    views: 2140,
    saves: 260,
    readTime: "3 phút",
    tags: ["Scholarships", "Financial"],
    excerpt:
      "Sinh viên được hướng dẫn chuẩn bị hồ sơ học bổng, thư giới thiệu và minh chứng hoạt động.",
    body:
      "Sự kiện phù hợp với sinh viên có thành tích học tập tốt hoặc hoàn cảnh khó khăn. Nội dung gồm cách viết bài luận, chuẩn bị bảng điểm và xác nhận hoạt động đoàn hội.",
  },
  {
    title: "Quản lý thời gian hiệu quả cho mùa thi",
    topic: "Soft Skills",
    status: "Published",
    author: "Bộ phận Tư vấn Kỹ năng",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-time/900/520",
    views: 3820,
    saves: 520,
    readTime: "6 phút",
    tags: ["Soft Skills", "Academic Affairs"],
    excerpt:
      "Cách chia lịch ôn tập, ưu tiên môn học và tránh quá tải trong giai đoạn thi cuối kỳ.",
    body:
      "Sinh viên nên lập bảng công việc theo tuần, chia nhỏ mục tiêu học tập, ưu tiên môn có tín chỉ cao hoặc đang yếu. Khi có dấu hiệu quá tải, sinh viên nên trao đổi với cố vấn học tập hoặc đặt lịch tư vấn tâm lý.",
  },
  {
    title: "Vượt qua căng thẳng khi bảo vệ đồ án",
    topic: "Student Psychology",
    status: "Published",
    author: "Tổ tư vấn tâm lý",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-psychology/900/520",
    views: 2740,
    saves: 360,
    readTime: "7 phút",
    tags: ["Student Psychology", "Personal Development"],
    excerpt:
      "Nhận diện căng thẳng trước buổi bảo vệ và các cách giữ tinh thần ổn định.",
    body:
      "Căng thẳng trước khi bảo vệ đồ án là phản ứng bình thường. Sinh viên có thể luyện trình bày, chuẩn bị câu hỏi dự kiến, ngủ đủ giấc và nhờ tư vấn viên hỗ trợ khi lo âu kéo dài.",
  },
  {
    title: "Quy định mới về cảnh báo học vụ",
    topic: "Training Regulations",
    status: "Published",
    author: "Phòng Đào tạo",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-regulation/900/520",
    views: 3180,
    saves: 410,
    readTime: "8 phút",
    tags: ["Training Regulations", "Academic Affairs"],
    excerpt:
      "Những mốc GPA, số tín chỉ tích lũy và bước xử lý khi sinh viên nhận cảnh báo học vụ.",
    body:
      "Sinh viên cần kiểm tra kết quả học tập sau mỗi học kỳ, xác định nguyên nhân bị cảnh báo và lập kế hoạch cải thiện. Hệ thống tư vấn hỗ trợ sinh viên chọn tư vấn viên học tập để xây dựng lộ trình phục hồi.",
  },
  {
    title: "Cách chọn tư vấn viên phù hợp với vấn đề của bạn",
    topic: "Giỏ tư vấn",
    status: "Published",
    author: "Ban quản trị hệ thống",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-counselor/900/520",
    views: 2410,
    saves: 300,
    readTime: "5 phút",
    tags: ["Giỏ tư vấn", "Career", "Academic Affairs"],
    excerpt:
      "Gợi ý chọn tư vấn học tập, nghề nghiệp, tài chính hoặc tâm lý theo đúng nhu cầu.",
    body:
      "Nếu cần cải thiện điểm số, hãy chọn tư vấn học tập. Nếu cần thực tập hoặc CV, hãy chọn tư vấn nghề nghiệp. Nếu cần hỗ trợ học bổng hoặc chi phí, hãy chọn tư vấn tài chính. Có thể thêm nhiều tư vấn viên vào giỏ rồi chọn nhóm cần đặt.",
  },
  {
    title: "Thanh toán COD và MoMo Sandbox khác nhau thế nào?",
    topic: "Thanh toán",
    status: "Published",
    author: "Ban quản trị hệ thống",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-payment/900/520",
    views: 2660,
    saves: 330,
    readTime: "6 phút",
    tags: ["Thanh toán", "MoMo"],
    excerpt:
      "Giải thích trạng thái tiền, thời điểm admin được xử lý yêu cầu và cách thanh toán lại MoMo.",
    body:
      "COD được thu khi yêu cầu hoàn tất. MoMo Sandbox cần thanh toán thành công trước khi admin xác nhận hoặc xử lý yêu cầu. Nếu sinh viên thoát khỏi MoMo, yêu cầu giữ trạng thái chờ thanh toán và có thể tạo lại phiên thanh toán.",
  },
  {
    title: "Theo dõi trạng thái yêu cầu tư vấn sau khi đặt",
    topic: "Theo dõi yêu cầu",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-tracking/900/520",
    views: 2290,
    saves: 250,
    readTime: "5 phút",
    tags: ["Theo dõi yêu cầu", "Giỏ tư vấn"],
    excerpt:
      "Các trạng thái từ yêu cầu mới, đã xác nhận, chuẩn bị hồ sơ, xử lý đến hoàn tất hoặc hủy.",
    body:
      "Mỗi yêu cầu có timeline xử lý. Trong 30 phút đầu sinh viên có thể hủy trực tiếp nếu đủ điều kiện. Khi yêu cầu đã sang bước chuẩn bị hồ sơ, thao tác hủy sẽ chuyển thành yêu cầu chờ admin duyệt.",
  },
  {
    title: "Kỹ năng trả lời phỏng vấn thực tập",
    topic: "Soft Skills",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-interview/900/520",
    views: 4970,
    saves: 610,
    readTime: "9 phút",
    tags: ["Soft Skills", "Internships", "Jobs"],
    excerpt:
      "Cách chuẩn bị câu chuyện dự án, trả lời câu hỏi hành vi và trao đổi về kỳ vọng thực tập.",
    body:
      "Sinh viên nên chuẩn bị phần giới thiệu bản thân, mô tả dự án nổi bật, bài học rút ra và câu hỏi dành cho nhà tuyển dụng. Tư vấn viên nghề nghiệp có thể hỗ trợ diễn tập phỏng vấn trước ngày gặp doanh nghiệp.",
  },
  {
    title: "Lập kế hoạch tài chính cho sinh viên xa nhà",
    topic: "Financial",
    status: "Published",
    author: "Bộ phận Hỗ trợ Sinh viên",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-finance/900/520",
    views: 1840,
    saves: 280,
    readTime: "7 phút",
    tags: ["Financial", "Scholarships"],
    excerpt:
      "Mẫu phân bổ chi phí sinh hoạt, học phí, tài liệu và quỹ dự phòng cho sinh viên.",
    body:
      "Sinh viên nên ghi lại chi tiêu hằng tháng, tách khoản bắt buộc và khoản linh hoạt, đồng thời tìm hiểu học bổng phù hợp. Nếu khó cân đối chi phí, có thể đặt lịch tư vấn tài chính để lập kế hoạch cụ thể.",
  },
  {
    title: "Tọa đàm chăm sóc sức khỏe tinh thần sinh viên",
    topic: "Student Psychology",
    status: "Published",
    author: "Tổ tư vấn tâm lý",
    faculty: "Student Support Center",
    contentType: "Event",
    image: "https://picsum.photos/seed/hcmute-event-mental/900/520",
    views: 2050,
    saves: 190,
    readTime: "2 phút",
    tags: ["Student Psychology", "Mental Health"],
    excerpt:
      "Chương trình trao đổi về stress học tập, áp lực gia đình và cách tìm kiếm hỗ trợ đúng lúc.",
    body:
      "Tọa đàm dành cho sinh viên mọi khóa. Nội dung tập trung vào nhận diện dấu hiệu quá tải, cách trò chuyện với người thân và khi nào nên gặp tư vấn viên tâm lý.",
  },
  {
    title: "Danh sách câu hỏi thường gặp khi đặt tư vấn",
    topic: "FAQ",
    status: "Published",
    author: "Ban quản trị hệ thống",
    faculty: "Student Support Center",
    contentType: "News",
    image: "https://picsum.photos/seed/hcmute-news-faq/900/520",
    views: 1990,
    saves: 210,
    readTime: "4 phút",
    tags: ["FAQ", "Giỏ tư vấn"],
    excerpt:
      "Tổng hợp các câu hỏi về chọn tư vấn viên, thanh toán, hủy yêu cầu và theo dõi trạng thái.",
    body:
      "Sinh viên có thể xem nhanh FAQ trước khi đặt tư vấn. Các câu hỏi thường gặp liên quan đến cách chọn nhiều mục trong giỏ, thanh toán MoMo, thanh toán COD và quy trình hủy yêu cầu.",
  },
  {
    title: "Diễn đàn Q&A mở chuyên mục thực tập",
    topic: "Forum",
    status: "Published",
    author: "Ban quản trị diễn đàn",
    faculty: "Community",
    contentType: "News",
    image: "https://picsum.photos/seed/hcmute-news-forum/900/520",
    views: 1650,
    saves: 140,
    readTime: "3 phút",
    tags: ["Forum", "Internships"],
    excerpt:
      "Sinh viên có thể đặt câu hỏi về kinh nghiệm thực tập, CV, phỏng vấn và doanh nghiệp.",
    body:
      "Chuyên mục thực tập trên diễn đàn giúp sinh viên trao đổi kinh nghiệm thực tế. Các chủ đề nổi bật sẽ được admin ghim và có thể liên kết đến bài viết hướng dẫn hoặc buổi tư vấn phù hợp.",
  },
  {
    title: "Cách chuẩn bị portfolio dự án cá nhân",
    topic: "Jobs",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-portfolio/900/520",
    views: 2890,
    saves: 450,
    readTime: "8 phút",
    tags: ["Jobs", "Career", "Soft Skills"],
    excerpt:
      "Gợi ý cấu trúc portfolio, cách mô tả dự án và trình bày vai trò cá nhân.",
    body:
      "Một portfolio tốt cần nêu bài toán, công nghệ, vai trò, kết quả và liên kết mã nguồn hoặc demo. Sinh viên nên chọn 2-3 dự án chất lượng thay vì liệt kê quá nhiều bài tập nhỏ.",
  },
  {
    title: "Hướng dẫn xin giấy xác nhận sinh viên online",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-confirmation/900/520",
    views: 1560,
    saves: 180,
    readTime: "4 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Các bước nộp yêu cầu xác nhận sinh viên, thời gian xử lý và lưu ý khi nhận kết quả.",
    body:
      "Sinh viên cần đăng nhập cổng dịch vụ, chọn loại giấy xác nhận, kiểm tra thông tin cá nhân và theo dõi trạng thái xử lý. Nếu thông tin hồ sơ sai, hãy cập nhật hồ sơ trước khi nộp.",
  },
  {
    title: "Cập nhật lịch tư vấn nhóm cho sinh viên năm nhất",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "Event",
    image: "https://picsum.photos/seed/hcmute-event-freshman/900/520",
    views: 2360,
    saves: 200,
    readTime: "2 phút",
    tags: ["Academic Affairs", "Personal Development"],
    excerpt:
      "Các buổi tư vấn nhóm giúp sinh viên năm nhất làm quen môi trường đại học và phương pháp học.",
    body:
      "Sinh viên năm nhất được hướng dẫn cách đọc chương trình đào tạo, liên hệ cố vấn, tham gia câu lạc bộ và sử dụng hệ thống tư vấn khi cần hỗ trợ cá nhân.",
  },
  {
    title: "Kinh nghiệm học nhóm hiệu quả trong đồ án môn học",
    topic: "Soft Skills",
    status: "Published",
    author: "Bộ phận Tư vấn Kỹ năng",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 2210,
    saves: 270,
    readTime: "6 phút",
    tags: ["Soft Skills", "Academic Affairs"],
    excerpt:
      "Cách phân chia vai trò, quản lý tiến độ và xử lý mâu thuẫn khi làm đồ án nhóm.",
    body:
      "Một nhóm học hiệu quả cần thống nhất mục tiêu, chia nhiệm vụ rõ ràng, cập nhật tiến độ định kỳ và ghi nhận rủi ro sớm. Khi mâu thuẫn kéo dài, sinh viên có thể đặt lịch tư vấn kỹ năng để được hỗ trợ cách trao đổi.",
  },
  {
    title: "Lộ trình chuẩn bị thực tập từ năm hai",
    topic: "Internships",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 3410,
    saves: 520,
    readTime: "8 phút",
    tags: ["Internships", "Career", "Jobs"],
    excerpt:
      "Những việc sinh viên nên chuẩn bị trước kỳ thực tập: kỹ năng, dự án, CV và mạng lưới doanh nghiệp.",
    body:
      "Từ năm hai, sinh viên nên chọn định hướng nghề nghiệp, hoàn thiện kỹ năng nền tảng, xây dựng dự án cá nhân và tham gia sự kiện doanh nghiệp. Việc đặt tư vấn nghề nghiệp sớm giúp lộ trình chuẩn bị rõ ràng hơn.",
  },
  {
    title: "Hướng dẫn sử dụng diễn đàn hỏi đáp học tập",
    topic: "Forum",
    status: "Published",
    author: "Ban quản trị diễn đàn",
    faculty: "Community",
    contentType: "Article",
    views: 1420,
    saves: 160,
    readTime: "5 phút",
    tags: ["Forum", "FAQ"],
    excerpt:
      "Cách đặt câu hỏi rõ ràng, dùng nút hữu ích đúng cách và đánh dấu câu hỏi đã giải quyết.",
    body:
      "Diễn đàn dùng để sinh viên hỏi đáp và chia sẻ kinh nghiệm. Nút hữu ích giúp đẩy câu trả lời/chủ đề có giá trị; mỗi tài khoản chỉ được bấm một lần. Chủ câu hỏi hoặc admin dùng đánh dấu đã giải quyết khi câu hỏi đã có câu trả lời đủ dùng.",
  },
  {
    title: "Buổi định hướng phương pháp nghiên cứu khoa học sinh viên",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Khoa học Công nghệ",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 1980,
    saves: 230,
    readTime: "2 phút",
    tags: ["Academic Affairs", "Soft Skills"],
    excerpt:
      "Sự kiện giúp sinh viên hiểu cách chọn đề tài, tìm tài liệu và trình bày kết quả nghiên cứu.",
    body:
      "Buổi định hướng dành cho sinh viên muốn tham gia nghiên cứu khoa học. Nội dung gồm cách xác định vấn đề, tìm tài liệu, xây dựng kế hoạch và liên hệ giảng viên hướng dẫn.",
  },
  {
    title: "Thông báo cập nhật quy trình hủy yêu cầu tư vấn",
    topic: "Theo dõi yêu cầu",
    status: "Published",
    author: "Ban quản trị hệ thống",
    faculty: "Student Support Center",
    contentType: "News",
    views: 1870,
    saves: 190,
    readTime: "3 phút",
    tags: ["Theo dõi yêu cầu", "Giỏ tư vấn"],
    excerpt:
      "Hệ thống làm rõ quy định hủy trực tiếp trong 30 phút và gửi yêu cầu hủy khi hồ sơ đã được chuẩn bị.",
    body:
      "Sinh viên có thể hủy trực tiếp trong thời gian cho phép. Khi yêu cầu đã chuyển sang bước chuẩn bị hồ sơ, hệ thống sẽ ghi nhận yêu cầu hủy để admin xem xét, tránh việc hủy tự động khi ban tư vấn đã xử lý.",
  },
];

const educationImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1558021212-51b6ecfa0db9?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1588072432836-e10032774350?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1600195077077-7c815f540a3d?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1529390079861-591de354faf5?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1537202108838-e7072bad1927?w=900&h=520&fit=crop",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&h=520&fit=crop",
];

const allSampleArticles = [...sampleArticles, ...extraContentItems].map(
  (item, index) => ({
    ...item,
    image: educationImages[index % educationImages.length],
  }),
);

const sampleFAQs = [
  {
    question: "Em có thể chọn nhiều tư vấn viên trong một lần đặt không?",
    answer:
      "Có. Em thêm từng tư vấn viên vào giỏ tư vấn, sau đó tick riêng những mục muốn thanh toán và gửi yêu cầu.",
    category: "Giỏ tư vấn",
    status: "Published",
  },
  {
    question: "Nếu bấm thanh toán MoMo rồi thoát ra thì yêu cầu có bị mất không?",
    answer:
      "Không. Yêu cầu vẫn được lưu ở trạng thái chờ thanh toán. Em có thể vào lịch sử yêu cầu để thanh toán lại trước khi phiên hết hạn.",
    category: "Thanh toán",
    status: "Published",
  },
  {
    question: "Khi nào em được hủy yêu cầu tư vấn?",
    answer:
      "Em được hủy trực tiếp trước 30 phút sau khi tạo. Nếu yêu cầu đã vào bước chuẩn bị hồ sơ, hệ thống sẽ gửi yêu cầu hủy để admin duyệt.",
    category: "Theo dõi yêu cầu",
    status: "Published",
  },
  {
    question: "COD trong hệ thống tư vấn nghĩa là gì?",
    answer:
      "COD là thanh toán sau khi yêu cầu tư vấn hoàn tất. Admin sẽ xác nhận đã thu tiền khi chuyển yêu cầu sang trạng thái hoàn tất.",
    category: "Thanh toán",
    status: "Published",
  },
];

const sampleThreads = [
  {
    title: "Nên đặt tư vấn học tập hay tư vấn nghề nghiệp trước?",
    content:
      "Em đang năm 2, vừa muốn cải thiện GPA vừa muốn tìm hướng thực tập. Mọi người nên đặt loại tư vấn nào trước?",
    author: "Sinh viên K21",
    tags: ["Academic Affairs", "Career"],
    pinned: true,
    votes: 12,
    replies: [
      {
        user: "Cố vấn học tập",
        content:
          "Nếu GPA đang ảnh hưởng điều kiện thực tập, em nên đặt tư vấn học tập trước rồi đặt thêm tư vấn nghề nghiệp sau.",
      },
    ],
  },
  {
    title: "Thanh toán MoMo Sandbox có cần tài khoản thật không?",
    content:
      "Em chạy demo trên máy local, không biết có cần ví thật hay chỉ dùng môi trường sandbox.",
    author: "Duy",
    tags: ["Thanh toán", "MoMo"],
    solved: true,
    votes: 8,
    replies: [
      {
        user: "Admin",
        content:
          "Demo dùng thông tin sandbox. Backend cần cấu hình partnerCode, accessKey, secretKey và URL public để nhận IPN.",
      },
    ],
  },
];

const sampleAvailability = [
  { dayOfWeek: 1, startTime: "08:00", endTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 2, startTime: "08:00", endTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 3, startTime: "08:00", endTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 4, startTime: "08:00", endTime: "17:00", slotDuration: 60 },
  { dayOfWeek: 5, startTime: "08:00", endTime: "17:00", slotDuration: 60 },
];

const upsertUser = async (payload, hashedPassword) =>
  User.findOneAndUpdate(
    { email: payload.email },
    {
      ...payload,
      password: hashedPassword,
      isActivated: true,
      updatedAt: new Date(),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Chưa cấu hình MONGO_URI trong backend/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdDemoUsers = [];
    for (const user of demoUsers) {
      createdDemoUsers.push(await upsertUser(user, hashedPassword));
    }

    const createdCounselors = [];
    for (const profile of counselorProfiles) {
      const counselorUser = await upsertUser(
        {
          username: profile.username,
          email: profile.email,
          role: "user",
          fullName: profile.fullName,
          phone: "",
        },
        hashedPassword,
      );

      const counselor = await Counselor.findOneAndUpdate(
        { userId: counselorUser._id },
        {
          userId: counselorUser._id,
          fullName: profile.fullName,
          expertise: profile.expertise,
          bio: profile.bio,
          image: profile.image,
          hourlyRate: profile.hourlyRate,
          rating: profile.rating,
          totalBookings: profile.totalBookings,
          isActive: true,
          updatedAt: new Date(),
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
      );

      await Availability.deleteMany({ counselorId: counselor._id });
      const availabilityDocs = await Availability.insertMany(
        sampleAvailability.map((slot) => ({
          ...slot,
          counselorId: counselor._id,
          isActive: true,
        })),
      );
      counselor.availability = availabilityDocs[0]._id;
      await counselor.save();
      createdCounselors.push(counselor);
    }

    const createdArticles = [];
    for (const article of allSampleArticles) {
      createdArticles.push(
        await Article.findOneAndUpdate({ title: article.title }, article, {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }),
      );
    }

    const createdFAQs = [];
    for (const faq of sampleFAQs) {
      createdFAQs.push(
        await FAQ.findOneAndUpdate({ question: faq.question }, faq, {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }),
      );
    }

    const createdThreads = [];
    for (const thread of sampleThreads) {
      createdThreads.push(
        await ForumThread.findOneAndUpdate({ title: thread.title }, thread, {
          upsert: true,
          returnDocument: "after",
          setDefaultsOnInsert: true,
        }),
      );
    }

    console.log("Seed completed");
    console.log(`Demo password: ${password}`);
    console.log(`Users: ${createdDemoUsers.length} demo + ${createdCounselors.length} counselors`);
    console.log(`Counselors: ${createdCounselors.length}`);
    console.log(`Articles: ${createdArticles.length}`);
    console.log(`FAQs: ${createdFAQs.length}`);
    console.log(`Forum threads: ${createdThreads.length}`);
    console.log("Admin: admin@hcmute.edu.vn / 123456");
    console.log("User: duy@student.hcmute.edu.vn / 123456");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
