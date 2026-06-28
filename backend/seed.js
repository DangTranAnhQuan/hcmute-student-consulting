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
  {
    title: "Cách chọn ngành phù hợp với năng lực cá nhân",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-major-fit/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Career", "Academic Affairs", "Personal Development"],
    excerpt:
      "Gợi ý cách nhìn lại năng lực, sở thích và điều kiện cá nhân trước khi quyết định chọn ngành học.",
    body:
      "Chọn ngành không nên chỉ dựa vào điểm chuẩn hoặc lời khuyên chung của bạn bè. Sinh viên cần nhìn lại các môn học mình có nền tảng tốt, kiểu công việc mình có thể duy trì lâu dài, khả năng tài chính của gia đình và mức độ sẵn sàng học thêm ngoài giờ. Một cách thực tế là lập bảng gồm ba nhóm: năng lực hiện có, điều muốn phát triển và môi trường nghề nghiệp mong muốn. Sau đó đối chiếu từng ngành với chương trình đào tạo, yêu cầu kỹ năng và cơ hội thực tập. Nếu còn phân vân, sinh viên nên trao đổi với cố vấn học tập hoặc tư vấn viên nghề nghiệp để kiểm tra lại lựa chọn trước khi đăng ký.",
  },
  {
    title: "Sai lầm thường gặp khi chọn ngành đại học",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-major-mistakes/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Career", "Academic Affairs"],
    excerpt:
      "Nhận diện những lỗi phổ biến khi chọn ngành để sinh viên có quyết định cân bằng hơn.",
    body:
      "Một sai lầm phổ biến là chọn ngành vì ngành đó đang được nhắc nhiều mà chưa hiểu rõ chương trình học. Sai lầm khác là chỉ nhìn vào mức lương sau khi ra trường nhưng bỏ qua yêu cầu kỹ năng, cường độ làm việc và tính phù hợp với bản thân. Sinh viên cũng dễ chọn theo nhóm bạn hoặc theo mong muốn của gia đình mà không trao đổi đủ về năng lực thật của mình. Để hạn chế rủi ro, hãy đọc kỹ đề án tuyển sinh, xem khung chương trình, hỏi sinh viên khóa trên và thử học một số nội dung nhập môn. Quyết định tốt thường đến từ dữ liệu cụ thể, không phải từ cảm giác nhất thời.",
  },
  {
    title: "Lộ trình học Công nghệ thông tin cho sinh viên năm nhất",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-it-first-year/900/520",
    views: 0,
    saves: 0,
    readTime: "8 phút",
    tags: ["Academic Affairs", "Career", "Soft Skills"],
    excerpt:
      "Lộ trình nền tảng giúp sinh viên năm nhất ngành CNTT học chắc từ lập trình cơ bản đến dự án nhỏ.",
    body:
      "Năm nhất là giai đoạn xây nền, vì vậy sinh viên Công nghệ thông tin nên ưu tiên tư duy lập trình, cấu trúc dữ liệu cơ bản, toán rời rạc và kỹ năng tự học tài liệu tiếng Anh. Thay vì học quá nhiều công nghệ cùng lúc, hãy chọn một ngôn ngữ chính để luyện bài tập đều đặn, sau đó làm các dự án nhỏ như quản lý danh sách, trang cá nhân hoặc ứng dụng ghi chú. Mỗi tuần nên dành thời gian đọc lại lỗi đã gặp, viết ghi chú kỹ thuật và dùng Git cho bài tập. Khi nền tảng ổn định, sinh viên có thể tìm hiểu web, mobile, dữ liệu hoặc an toàn thông tin để chọn hướng đi phù hợp hơn ở năm hai.",
  },
  {
    title: "Cách đọc đề án tuyển sinh trước khi đăng ký nguyện vọng",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-admission-plan/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Các mục quan trọng trong đề án tuyển sinh mà thí sinh và sinh viên cần đọc trước khi quyết định.",
    body:
      "Đề án tuyển sinh thường có nhiều thông tin, nhưng người học nên tập trung vào mã ngành, tổ hợp xét tuyển, chỉ tiêu, phương thức xét tuyển, điều kiện phụ và mốc thời gian. Cần phân biệt rõ điểm sàn, điểm chuẩn các năm trước và điểm dự kiến vì mỗi con số phục vụ mục đích khác nhau. Nếu một ngành có nhiều phương thức xét tuyển, hãy ghi lại hồ sơ cần chuẩn bị cho từng phương thức và thời hạn nộp. Thí sinh cũng nên đọc phần quy định xác nhận nhập học, học phí dự kiến và chính sách ưu tiên. Việc đọc kỹ từ đầu giúp giảm nguy cơ đăng ký sai mã ngành hoặc bỏ lỡ giấy tờ quan trọng.",
  },
  {
    title: "Cách tính điểm xét tuyển và đối chiếu điều kiện đầu vào",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-admission-score/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Hướng dẫn kiểm tra công thức điểm xét tuyển, điểm ưu tiên và điều kiện phụ để tránh nhầm lẫn.",
    body:
      "Khi tính điểm xét tuyển, thí sinh cần xác định đúng phương thức mình sử dụng: điểm thi tốt nghiệp, học bạ, đánh giá năng lực hoặc phương thức kết hợp. Mỗi phương thức có thể có công thức riêng, cách làm tròn khác nhau và yêu cầu ngưỡng đảm bảo chất lượng. Hãy cộng điểm ưu tiên theo đúng khu vực, đối tượng và kiểm tra xem ngành có điều kiện phụ về môn chính hoặc chứng chỉ hay không. Sau khi tính xong, nên lưu lại ảnh chụp hoặc bảng tính để đối chiếu khi điều chỉnh nguyện vọng. Nếu kết quả sát ngưỡng, thí sinh nên chuẩn bị thêm phương án dự phòng thay vì đặt toàn bộ kỳ vọng vào một lựa chọn.",
  },
  {
    title: "Cách chuẩn bị hồ sơ nhập học đầy đủ và đúng hạn",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-enrollment-documents/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Danh sách việc cần làm để sinh viên mới chuẩn bị hồ sơ nhập học gọn gàng và tránh thiếu giấy tờ.",
    body:
      "Trước ngày nhập học, sinh viên nên tạo một checklist gồm giấy báo trúng tuyển, giấy tờ tùy thân, học bạ hoặc bằng tốt nghiệp, ảnh thẻ, giấy chứng nhận ưu tiên nếu có và các biểu mẫu theo hướng dẫn của trường. Mỗi loại giấy tờ nên được phân thành bản chính, bản sao công chứng và bản chụp lưu trữ. Sinh viên nên kiểm tra thời hạn nộp học phí, hình thức xác nhận nhập học và lịch sinh hoạt đầu khóa. Nếu hồ sơ có thông tin chưa khớp, cần liên hệ bộ phận phụ trách sớm thay vì chờ đến ngày nộp. Chuẩn bị trước giúp ngày nhập học nhẹ nhàng hơn và giảm lỗi hành chính.",
  },
  {
    title: "Kỹ năng tự học ở đại học cho sinh viên mới",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-self-study/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Soft Skills", "Academic Affairs"],
    excerpt:
      "Cách xây thói quen tự học, ghi chú và ôn tập phù hợp với nhịp học ở đại học.",
    body:
      "Ở đại học, thời lượng trên lớp chỉ là một phần của quá trình học. Sinh viên cần chuẩn bị bài trước, ghi lại câu hỏi trong lúc học và tự tổng hợp kiến thức sau mỗi buổi. Một phương pháp hiệu quả là chia tài liệu thành các phần nhỏ, học theo mục tiêu cụ thể và tự kiểm tra bằng bài tập hoặc câu hỏi ngắn. Khi gặp phần khó, hãy ghi rõ mình không hiểu bước nào trước khi hỏi giảng viên hoặc bạn học. Tự học không có nghĩa là học một mình hoàn toàn; đó là khả năng chủ động tìm tài liệu, thử nghiệm, nhận phản hồi và điều chỉnh kế hoạch học tập.",
  },
  {
    title: "Quản lý thời gian cho sinh viên nhiều lịch học và hoạt động",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-time-management-new/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Soft Skills", "Academic Affairs", "Personal Development"],
    excerpt:
      "Gợi ý cách sắp xếp lịch học, bài tập, hoạt động câu lạc bộ và thời gian nghỉ ngơi.",
    body:
      "Sinh viên thường bị quá tải không phải vì thiếu thời gian tuyệt đối, mà vì chưa phân biệt việc quan trọng và việc gấp. Mỗi tuần nên có một khung kế hoạch cố định gồm giờ học trên lớp, thời gian tự học, hạn nộp bài, việc cá nhân và thời gian nghỉ. Những môn khó cần được đặt vào khung giờ tỉnh táo nhất, không nên dồn sát ngày kiểm tra. Nếu tham gia câu lạc bộ hoặc làm thêm, hãy đặt giới hạn số buổi trong tuần và theo dõi ảnh hưởng đến sức khỏe. Một lịch tốt phải có khoảng trống dự phòng để xử lý việc phát sinh.",
  },
  {
    title: "Cách đăng ký tín chỉ hiệu quả trong mỗi học kỳ",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-credit-registration/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Academic Affairs", "Training Regulations"],
    excerpt:
      "Các bước chuẩn bị trước khi đăng ký tín chỉ để cân bằng tiến độ, điều kiện tiên quyết và sức học.",
    body:
      "Trước khi đăng ký tín chỉ, sinh viên cần xem chương trình đào tạo, danh sách môn tiên quyết và số tín chỉ tối đa được phép học. Không nên chỉ chọn lớp theo thời khóa biểu đẹp mà bỏ qua độ khó của môn và năng lực hiện tại. Hãy ưu tiên các môn bắt buộc mở theo học kỳ, sau đó mới thêm môn tự chọn hoặc môn cải thiện. Sinh viên nên chuẩn bị vài phương án lớp thay thế để tránh bị động khi lớp đầy. Sau khi đăng ký xong, cần kiểm tra lại tổng số tín chỉ, học phí dự kiến và lịch thi nếu hệ thống đã công bố.",
  },
  {
    title: "Cách học nhóm hiệu quả và giữ trách nhiệm chung",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-team-study-new/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Soft Skills", "Academic Affairs"],
    excerpt:
      "Cách tổ chức buổi học nhóm có mục tiêu, phân công rõ và hạn chế tình trạng làm thay nhau.",
    body:
      "Một buổi học nhóm hiệu quả cần có mục tiêu cụ thể trước khi bắt đầu, ví dụ giải xong một nhóm bài tập hoặc rà soát một chương lý thuyết. Nhóm nên phân vai rõ: người chuẩn bị tài liệu, người ghi chú, người đặt câu hỏi và người tổng kết. Với bài tập lớn, mỗi thành viên cần có phần việc đo được và thời hạn kiểm tra tiến độ. Nếu có thành viên chậm tiến độ, nhóm nên trao đổi sớm bằng dữ kiện cụ thể thay vì để mâu thuẫn tích tụ. Học nhóm tốt không chỉ giúp hiểu bài nhanh hơn mà còn rèn kỹ năng phối hợp trong môi trường làm việc sau này.",
  },
  {
    title: "Cách viết CV cho sinh viên chưa có kinh nghiệm",
    topic: "Jobs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-cv-no-experience/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Cách trình bày CV khi chưa có kinh nghiệm đi làm chính thức nhưng đã có môn học, dự án và hoạt động.",
    body:
      "Sinh viên chưa có kinh nghiệm vẫn có thể viết CV tốt nếu biết chọn thông tin liên quan. Thay vì để trống phần kinh nghiệm, hãy mô tả dự án môn học, bài tập lớn, hoạt động câu lạc bộ, cuộc thi hoặc công việc bán thời gian có kỹ năng chuyển đổi. Mỗi mục nên nêu vai trò, công cụ sử dụng, kết quả và điều học được. CV cần ngắn gọn, ưu tiên thông tin phù hợp với vị trí ứng tuyển và tránh liệt kê kỹ năng mà không có minh chứng. Trước khi gửi, sinh viên nên nhờ tư vấn viên hoặc bạn có kinh nghiệm đọc lại để phát hiện lỗi trình bày và lỗi chính tả.",
  },
  {
    title: "Cách tìm nơi thực tập phù hợp với mục tiêu nghề nghiệp",
    topic: "Internships",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-find-internship/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Internships", "Jobs", "Career"],
    excerpt:
      "Gợi ý nguồn tìm thực tập và cách đánh giá cơ hội trước khi nộp hồ sơ.",
    body:
      "Để tìm nơi thực tập phù hợp, sinh viên nên bắt đầu từ mục tiêu học được gì sau kỳ thực tập: kỹ năng kỹ thuật, quy trình làm việc, giao tiếp chuyên nghiệp hay hiểu ngành. Nguồn tìm kiếm có thể gồm thông báo từ khoa, trung tâm quan hệ doanh nghiệp, ngày hội việc làm, cộng đồng chuyên môn và mạng lưới cựu sinh viên. Khi đọc mô tả vị trí, hãy kiểm tra yêu cầu công việc, người hướng dẫn, thời lượng thực tập, địa điểm và khả năng chuyển tiếp. Không nên nộp đại trà mà không chỉnh CV. Mỗi hồ sơ cần cho thấy lý do sinh viên phù hợp với vị trí đó.",
  },
  {
    title: "Chuẩn bị phỏng vấn thực tập từ câu chuyện dự án",
    topic: "Internships",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-intern-interview-prep/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Internships", "Jobs", "Soft Skills"],
    excerpt:
      "Cách chuẩn bị phần giới thiệu, câu hỏi kỹ thuật và ví dụ dự án trước buổi phỏng vấn thực tập.",
    body:
      "Trước buổi phỏng vấn thực tập, sinh viên nên chọn hai hoặc ba dự án có thể kể rõ từ bối cảnh, nhiệm vụ, cách làm đến kết quả. Người phỏng vấn thường quan tâm sinh viên đã tự làm phần nào, gặp lỗi gì và học được gì sau dự án. Ngoài câu hỏi kỹ thuật, hãy chuẩn bị câu trả lời về cách học công nghệ mới, cách phối hợp nhóm và cách xử lý khi trễ tiến độ. Sinh viên cũng nên đọc thông tin doanh nghiệp, sản phẩm và vị trí tuyển dụng để đặt câu hỏi ngược phù hợp. Phỏng vấn tốt không phải là trả lời hoàn hảo, mà là thể hiện tư duy rõ ràng và thái độ học hỏi.",
  },
  {
    title: "Cách xây dựng portfolio cá nhân từ dự án nhỏ",
    topic: "Jobs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-portfolio-small-projects/900/520",
    views: 0,
    saves: 0,
    readTime: "8 phút",
    tags: ["Jobs", "Career", "Soft Skills"],
    excerpt:
      "Hướng dẫn biến bài tập và dự án cá nhân thành portfolio rõ ràng cho thực tập hoặc việc làm đầu tiên.",
    body:
      "Portfolio không cần bắt đầu bằng dự án lớn. Sinh viên có thể chọn các bài tập hoặc sản phẩm nhỏ nhưng trình bày đầy đủ vấn đề, giải pháp, công nghệ, vai trò cá nhân và kết quả. Mỗi dự án nên có mô tả ngắn, ảnh minh họa hoặc liên kết demo nếu có, cùng phần ghi chú về điều đã học. Với ngành kỹ thuật, mã nguồn cần được sắp xếp dễ đọc và có hướng dẫn chạy cơ bản. Với ngành thiết kế hoặc truyền thông, nên chú trọng quá trình tư duy và phiên bản cải tiến. Portfolio tốt giúp nhà tuyển dụng hiểu cách sinh viên làm việc, không chỉ nhìn thấy danh sách công cụ.",
  },
  {
    title: "Cân bằng học tập và làm thêm để không hụt tiến độ",
    topic: "Student Psychology",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-study-parttime-balance/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Student Psychology", "Financial", "Soft Skills"],
    excerpt:
      "Cách đánh giá thời lượng làm thêm, sức khỏe và tiến độ học tập trước khi nhận việc.",
    body:
      "Làm thêm có thể giúp sinh viên có thu nhập và trải nghiệm, nhưng cần được đặt trong giới hạn phù hợp. Trước khi nhận việc, hãy tính số giờ học trên lớp, giờ tự học, thời gian di chuyển và thời gian nghỉ tối thiểu. Nếu điểm số giảm, thường xuyên ngủ thiếu hoặc bỏ lỡ bài tập nhóm, sinh viên cần điều chỉnh ca làm hoặc tạm dừng. Nên ưu tiên công việc có lịch ổn định, môi trường an toàn và không ảnh hưởng đến các môn nền tảng. Khi gặp áp lực tài chính, sinh viên có thể tìm học bổng, hỗ trợ từ trường hoặc tư vấn tài chính thay vì cố gắng làm quá sức.",
  },
  {
    title: "Cách thích nghi với môi trường đại học trong học kỳ đầu",
    topic: "Student Psychology",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-university-adaptation/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Student Psychology", "Personal Development", "Academic Affairs"],
    excerpt:
      "Những việc sinh viên mới nên làm để quen dần với lịch học, bạn bè, giảng viên và dịch vụ hỗ trợ.",
    body:
      "Học kỳ đầu thường có nhiều thay đổi: lịch học linh hoạt hơn, lớp học đông hơn và sinh viên phải tự quản lý nhiều việc cá nhân. Để thích nghi, hãy tìm hiểu các kênh thông báo chính thức, lưu lịch học, tham gia sinh hoạt đầu khóa và làm quen với ít nhất một nhóm bạn học tập. Sinh viên cũng nên biết nơi liên hệ khi cần hỗ trợ học vụ, tâm lý, tài chính hoặc thủ tục hành chính. Cảm giác bỡ ngỡ là bình thường, nhưng nếu kéo dài thành lo âu hoặc mất động lực, hãy chủ động trao đổi với cố vấn hoặc tư vấn viên thay vì tự chịu đựng.",
  },
  {
    title: "Kỹ năng giao tiếp với giảng viên khi cần hỗ trợ",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-communicate-lecturers/900/520",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Soft Skills", "Academic Affairs"],
    excerpt:
      "Cách đặt câu hỏi, viết email và trao đổi với giảng viên một cách rõ ràng, tôn trọng.",
    body:
      "Khi cần hỏi giảng viên, sinh viên nên chuẩn bị trước thông tin về môn học, lớp, nội dung đã thử tìm hiểu và câu hỏi cụ thể. Email nên có tiêu đề rõ, lời chào phù hợp, nội dung ngắn gọn và thông tin liên hệ. Nếu hỏi trực tiếp sau giờ học, hãy trình bày vấn đề theo thứ tự: em đang làm gì, vướng ở đâu, đã thử cách nào. Tránh gửi tin nhắn quá chung như 'em không hiểu bài' mà không nêu phần cần hỗ trợ. Giao tiếp tốt giúp giảng viên phản hồi nhanh hơn và giúp sinh viên rèn tác phong chuyên nghiệp.",
  },
  {
    title: "Định hướng nghề nghiệp từ năm nhất không quá sớm",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-career-first-year/900/520",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Career", "Personal Development", "Academic Affairs"],
    excerpt:
      "Cách sinh viên năm nhất tìm hiểu nghề nghiệp mà không bị áp lực phải chọn ngay một hướng cố định.",
    body:
      "Định hướng nghề nghiệp từ năm nhất không có nghĩa là phải quyết định toàn bộ tương lai ngay lập tức. Mục tiêu phù hợp hơn là mở rộng hiểu biết về các nhóm nghề, yêu cầu kỹ năng và môi trường làm việc. Sinh viên có thể tham gia seminar, hỏi anh chị khóa trên, đọc mô tả tuyển dụng cơ bản và thử các dự án nhỏ. Sau mỗi trải nghiệm, hãy ghi lại điều mình thích, điều mình chưa phù hợp và kỹ năng cần bổ sung. Định hướng là quá trình điều chỉnh liên tục. Bắt đầu sớm giúp sinh viên có thêm thời gian thử sai có kiểm soát trước khi bước vào thực tập.",
  },
  {
    title: "Nên học chứng chỉ nào khi còn là sinh viên",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-student-certificates/900/520",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Career", "Jobs", "Soft Skills"],
    excerpt:
      "Cách chọn chứng chỉ theo mục tiêu học tập, nghề nghiệp và khả năng đầu tư thời gian.",
    body:
      "Chứng chỉ chỉ có giá trị khi phù hợp với mục tiêu cụ thể. Sinh viên nên bắt đầu bằng yêu cầu của ngành học và vị trí mong muốn, ví dụ ngoại ngữ, tin học, kỹ năng quản lý dự án, chứng chỉ nền tảng đám mây hoặc chứng chỉ chuyên môn theo lĩnh vực. Không nên học chứng chỉ chỉ vì thấy nhiều người đăng ký nếu chưa có thời gian áp dụng. Trước khi chọn, hãy kiểm tra độ uy tín, chi phí, thời hạn hiệu lực và mức độ công nhận của nhà tuyển dụng. Một chứng chỉ đi kèm dự án thực hành hoặc kết quả học tập rõ ràng thường thuyết phục hơn danh sách chứng chỉ dài nhưng rời rạc.",
  },
  {
    title: "Chuẩn bị cho đồ án tốt nghiệp từ trước học kỳ cuối",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    image: "https://picsum.photos/seed/hcmute-article-graduation-project-prep/900/520",
    views: 0,
    saves: 0,
    readTime: "8 phút",
    tags: ["Academic Affairs", "Training Regulations", "Soft Skills"],
    excerpt:
      "Các bước chuẩn bị đề tài, nhóm, tài liệu và tiến độ để giảm áp lực khi làm đồ án tốt nghiệp.",
    body:
      "Đồ án tốt nghiệp nên được chuẩn bị trước học kỳ cuối, đặc biệt với sinh viên cần làm sản phẩm, nghiên cứu hoặc triển khai hệ thống. Hãy bắt đầu bằng việc tổng hợp các môn mạnh, dự án đã làm và vấn đề thực tế mình muốn giải quyết. Sinh viên nên trao đổi sớm với giảng viên hướng dẫn tiềm năng, đọc một số tài liệu nền và đánh giá phạm vi đề tài có vừa sức hay không. Nếu làm nhóm, cần thống nhất vai trò, cách lưu trữ tài liệu và lịch họp định kỳ. Một kế hoạch tốt gồm mốc khảo sát, thiết kế, triển khai, kiểm thử, viết báo cáo và chuẩn bị bảo vệ.",
  },
  {
    title: "Cách lập kế hoạch học tập cho từng học kỳ",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Academic Affairs", "Training Regulations", "Student Guide"],
    excerpt:
      "Gợi ý cách chia mục tiêu học kỳ thành tín chỉ, lịch tự học, mốc kiểm tra và thời gian dự phòng.",
    body:
      "Một kế hoạch học kỳ tốt không chỉ là danh sách môn học. Sinh viên nên bắt đầu bằng việc kiểm tra chương trình đào tạo, môn tiên quyết, số tín chỉ tối đa và các mốc quan trọng như đăng ký học phần, thi giữa kỳ, thi cuối kỳ. Sau đó hãy chia từng môn thành mục tiêu nhỏ: cần đọc tài liệu nào, làm bài tập vào ngày nào, khi nào hỏi giảng viên và khi nào ôn tập. Những môn khó nên có lịch học cố định hằng tuần thay vì chờ đến sát kỳ thi. Kế hoạch cũng cần có khoảng trống để xử lý việc phát sinh, hoạt động câu lạc bộ hoặc sức khỏe cá nhân. Cuối mỗi tháng, sinh viên nên xem lại tiến độ để điều chỉnh sớm trước khi điểm số bị ảnh hưởng.",
  },
  {
    title: "Cách chọn câu lạc bộ phù hợp khi vào đại học",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Soft Skills", "Personal Development", "Student Guide"],
    excerpt:
      "Cách đánh giá câu lạc bộ theo mục tiêu học tập, kỹ năng muốn rèn và quỹ thời gian của sinh viên mới.",
    body:
      "Câu lạc bộ giúp sinh viên mở rộng quan hệ và rèn kỹ năng, nhưng không phải câu lạc bộ nào cũng phù hợp với mọi giai đoạn. Trước khi tham gia, hãy xác định mục tiêu chính: kết bạn, rèn giao tiếp, học chuyên môn, tham gia dự án hay hoạt động cộng đồng. Sinh viên nên hỏi rõ lịch sinh hoạt, khối lượng công việc, cách phân công và kỳ vọng dành cho thành viên mới. Nếu lịch học còn chưa ổn định, nên chọn một hoạt động chính thay vì đăng ký quá nhiều. Sau một tháng tham gia, hãy tự đánh giá xem hoạt động đó có giúp mình tiến bộ không, có ảnh hưởng đến sức khỏe và bài vở không. Lựa chọn đúng giúp trải nghiệm đại học phong phú mà vẫn giữ được tiến độ học tập.",
  },
  {
    title: "Những kỹ năng sinh viên năm nhất nên rèn luyện sớm",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Soft Skills", "Personal Development", "Academic Affairs"],
    excerpt:
      "Các kỹ năng nền tảng giúp sinh viên năm nhất học chủ động, giao tiếp tốt và thích nghi nhanh hơn.",
    body:
      "Năm nhất là thời điểm phù hợp để rèn các kỹ năng nền vì áp lực chuyên ngành chưa quá nặng. Sinh viên nên ưu tiên quản lý thời gian, đọc tài liệu, ghi chú, làm việc nhóm, viết email và trình bày ngắn gọn. Mỗi kỹ năng có thể luyện bằng một hành động nhỏ: lập lịch học hằng tuần, tóm tắt bài sau buổi học, nhận một vai trò trong nhóm hoặc đặt câu hỏi rõ ràng cho giảng viên. Ngoài ra, kỹ năng tự đánh giá cũng rất quan trọng. Sau mỗi bài kiểm tra hoặc dự án, hãy ghi lại điểm mạnh, lỗi lặp lại và việc cần cải thiện. Khi những thói quen này hình thành sớm, sinh viên sẽ tự tin hơn ở các học kỳ có nhiều môn chuyên ngành và hoạt động thực tế.",
  },
  {
    title: "Cách hỏi cố vấn học tập hiệu quả",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Academic Affairs", "Training Regulations", "Soft Skills"],
    excerpt:
      "Chuẩn bị thông tin và câu hỏi rõ ràng để buổi trao đổi với cố vấn học tập có kết quả cụ thể.",
    body:
      "Cố vấn học tập có thể hỗ trợ tốt hơn khi sinh viên chuẩn bị trước dữ liệu của mình. Trước buổi trao đổi, hãy ghi lại mã số sinh viên, ngành, khóa, số tín chỉ đã tích lũy, môn đang gặp khó và mục tiêu cần hỏi. Câu hỏi nên cụ thể, ví dụ nên đăng ký lại môn nào trước, có thể giảm tải học kỳ tới không, hoặc điều kiện để ra trường đúng hạn là gì. Nếu vấn đề liên quan đến điểm, cảnh báo học vụ hoặc môn tiên quyết, sinh viên nên mang theo bảng điểm và danh sách môn dự kiến. Sau buổi tư vấn, hãy tóm tắt lại quyết định đã thống nhất và mốc cần thực hiện. Cách chuẩn bị này giúp tránh hỏi chung chung và giảm nguy cơ hiểu sai quy định.",
  },
  {
    title: "Khi nào nên đổi ngành hoặc điều chỉnh định hướng học tập",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Career", "Academic Affairs", "Personal Development"],
    excerpt:
      "Các dấu hiệu cần xem xét lại ngành học và cách ra quyết định dựa trên dữ liệu thay vì cảm xúc nhất thời.",
    body:
      "Không hài lòng với một môn học chưa đủ để kết luận phải đổi ngành. Sinh viên nên theo dõi trong một khoảng thời gian đủ dài: mình khó ở môn nền tảng hay khó vì chưa có phương pháp học, mình có còn hứng thú với bài toán của ngành không, và năng lực hiện tại có thể cải thiện bằng kế hoạch cụ thể không. Nếu điểm số giảm liên tục, mất động lực kéo dài, hoặc phát hiện ngành học không phù hợp với giá trị và mục tiêu nghề nghiệp, sinh viên nên trao đổi với cố vấn học tập, tư vấn viên nghề nghiệp và gia đình. Trước khi quyết định, hãy so sánh chương trình mới, tín chỉ được công nhận, thời gian tốt nghiệp và chi phí phát sinh. Điều chỉnh định hướng là việc nghiêm túc, cần dữ liệu và kế hoạch chuyển tiếp rõ ràng.",
  },
  {
    title: "Cách chuẩn bị cho kỳ thi cuối kỳ",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Academic Affairs", "Student Guide", "Soft Skills"],
    excerpt:
      "Lộ trình ôn tập cuối kỳ theo mức độ ưu tiên, dạng đề và thời gian còn lại trước ngày thi.",
    body:
      "Chuẩn bị cuối kỳ nên bắt đầu bằng việc liệt kê môn thi, ngày thi, tỷ trọng điểm và dạng đánh giá. Với mỗi môn, sinh viên hãy chia nội dung thành ba nhóm: phần chắc chắn nắm được, phần hiểu nhưng dễ sai, và phần chưa hiểu. Nhóm thứ hai và thứ ba cần được ưu tiên vì có khả năng cải thiện điểm nhanh hơn. Nên luyện đề hoặc bài tập mẫu trong điều kiện gần giống khi thi để kiểm tra tốc độ làm bài. Nếu còn ít thời gian, đừng đọc lại toàn bộ tài liệu một cách thụ động; hãy giải bài, tự tóm tắt công thức, hỏi bạn học hoặc giảng viên ở đúng điểm vướng. Trước ngày thi, cần ngủ đủ và chuẩn bị giấy tờ, dụng cụ, phòng thi để tránh mất điểm vì lỗi tổ chức.",
  },
  {
    title: "Cách ghi chú bài học hiệu quả trên lớp",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Soft Skills", "Academic Affairs", "Student Guide"],
    excerpt:
      "Gợi ý cách ghi chú để nắm ý chính, giữ câu hỏi cần hỏi lại và ôn tập nhanh sau buổi học.",
    body:
      "Ghi chú hiệu quả không phải chép lại toàn bộ lời giảng. Sinh viên nên ghi cấu trúc bài học, khái niệm chính, ví dụ quan trọng, lỗi thường gặp và câu hỏi chưa hiểu. Một trang ghi chú tốt nên có khoảng trống để bổ sung sau buổi học. Với môn tính toán hoặc lập trình, hãy ghi rõ từng bước giải và lý do chọn cách làm, không chỉ kết quả cuối. Với môn lý thuyết, nên dùng bảng so sánh hoặc sơ đồ ngắn để liên kết ý. Sau buổi học, dành 10 đến 15 phút đọc lại ghi chú, đánh dấu phần cần hỏi và chuyển nội dung quan trọng thành câu hỏi ôn tập. Thói quen này giúp sinh viên giảm thời gian ôn cuối kỳ vì kiến thức đã được xử lý từng tuần.",
  },
  {
    title: "Cách sử dụng thư viện và tài nguyên học tập của trường",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Academic Affairs", "Student Guide", "Research"],
    excerpt:
      "Cách tận dụng thư viện, tài liệu số, phòng tự học và nguồn tham khảo để học chủ động hơn.",
    body:
      "Thư viện không chỉ là nơi mượn sách. Sinh viên có thể dùng thư viện để tìm giáo trình, tài liệu tham khảo, không gian học nhóm, cơ sở dữ liệu học thuật và hướng dẫn trích dẫn. Khi bắt đầu một môn mới, hãy tìm tên giáo trình chính, sách liên quan và các tài liệu nhập môn dễ đọc hơn. Với bài tiểu luận hoặc nghiên cứu nhỏ, sinh viên nên học cách tìm từ khóa, lọc tài liệu theo năm xuất bản và ghi lại nguồn tham khảo ngay từ đầu. Nếu chưa biết dùng tài nguyên số, hãy hỏi cán bộ thư viện hoặc xem hướng dẫn của trường. Biết khai thác thư viện giúp sinh viên giảm phụ thuộc vào tài liệu rời rạc trên mạng và hình thành thói quen học thuật nghiêm túc.",
  },
  {
    title: "Cách xây dựng thói quen học ngoại ngữ mỗi ngày",
    topic: "Personal Development",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Personal Development", "Soft Skills", "Career"],
    excerpt:
      "Cách học ngoại ngữ bền vững bằng mục tiêu nhỏ, tài liệu phù hợp và thói quen theo dõi tiến bộ.",
    body:
      "Ngoại ngữ cần sự đều đặn hơn là những đợt học dồn ngắn hạn. Sinh viên nên chọn một khung giờ cố định trong ngày, bắt đầu từ 20 đến 30 phút và chia kỹ năng thành nhiệm vụ nhỏ như nghe một đoạn ngắn, ghi năm từ mới, đọc một bài chuyên ngành hoặc nói lại nội dung đã học. Tài liệu nên phù hợp với trình độ hiện tại; nếu quá khó, người học dễ bỏ cuộc. Mỗi tuần hãy có một sản phẩm nhỏ như đoạn tóm tắt, file ghi âm hoặc danh sách từ theo chủ đề ngành học. Khi học ngoại ngữ gắn với mục tiêu thực tế như đọc tài liệu chuyên môn, viết CV hoặc phỏng vấn, sinh viên sẽ thấy rõ giá trị và duy trì động lực lâu hơn.",
  },
  {
    title: "Cách tìm học bổng phù hợp với hồ sơ cá nhân",
    topic: "Scholarships",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Scholarships", "Financial", "Academic Affairs"],
    excerpt:
      "Gợi ý cách lọc học bổng theo điểm mạnh, điều kiện xét chọn, thời hạn và khả năng chuẩn bị hồ sơ.",
    body:
      "Không phải học bổng nào cũng phù hợp với mọi sinh viên. Trước khi nộp, hãy phân loại học bổng theo tiêu chí: thành tích học tập, hoàn cảnh tài chính, hoạt động cộng đồng, nghiên cứu khoa học hoặc định hướng nghề nghiệp. Sinh viên nên đối chiếu GPA, chứng chỉ, minh chứng hoạt động và thư giới thiệu với yêu cầu từng chương trình. Nếu còn thiếu một vài tiêu chí, hãy đánh giá xem có thể bổ sung trong thời gian còn lại không. Nên lập bảng theo dõi gồm tên học bổng, hạn nộp, giấy tờ cần chuẩn bị, người phụ trách xác nhận và trạng thái hồ sơ. Cách làm này giúp tránh nộp trễ và giúp sinh viên tập trung vào cơ hội có xác suất phù hợp nhất.",
  },
  {
    title: "Cách chuẩn bị hồ sơ xin học bổng",
    topic: "Scholarships",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Scholarships", "Financial", "Student Guide"],
    excerpt:
      "Checklist hồ sơ học bổng gồm bảng điểm, minh chứng, thư giới thiệu và bài trình bày mục tiêu cá nhân.",
    body:
      "Hồ sơ học bổng cần rõ ràng, đầy đủ và nhất quán. Sinh viên nên chuẩn bị bảng điểm, giấy xác nhận sinh viên, minh chứng hoạt động, chứng chỉ, giấy tờ hoàn cảnh nếu có và bản mô tả mục tiêu học tập. Với thư giới thiệu, hãy liên hệ giảng viên hoặc cố vấn sớm, gửi thông tin thành tích và lý do xin học bổng để người viết có đủ dữ liệu. Bài trình bày cá nhân nên trả lời ba câu hỏi: mình là ai, học bổng giúp mình giải quyết điều gì, và mình sẽ sử dụng cơ hội đó ra sao. Trước khi nộp, hãy kiểm tra định dạng file, tên file, chữ ký, dấu xác nhận và hạn nộp. Một hồ sơ tốt thể hiện sự chuẩn bị nghiêm túc chứ không chỉ liệt kê thành tích.",
  },
  {
    title: "Cách tham gia nghiên cứu khoa học sinh viên",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "7 phút",
    tags: ["Academic Affairs", "Research", "Soft Skills"],
    excerpt:
      "Các bước bắt đầu nghiên cứu khoa học từ tìm vấn đề, chọn giảng viên hướng dẫn đến lập kế hoạch thực hiện.",
    body:
      "Nghiên cứu khoa học sinh viên không nhất thiết bắt đầu bằng ý tưởng lớn. Sinh viên có thể xuất phát từ một vấn đề trong môn học, nhu cầu thực tế ở câu lạc bộ, bài toán kỹ thuật nhỏ hoặc câu hỏi chưa được giải thích rõ. Bước đầu tiên là đọc tài liệu nền để biết người khác đã làm gì, sau đó thu hẹp phạm vi thành mục tiêu có thể hoàn thành trong một học kỳ. Sinh viên nên tìm giảng viên hướng dẫn phù hợp với chủ đề, chuẩn bị bản mô tả ngắn gồm vấn đề, lý do chọn, phương pháp dự kiến và kết quả mong muốn. Trong quá trình làm, cần ghi nhật ký tiến độ, lưu tài liệu có hệ thống và thường xuyên nhận phản hồi. Kỹ năng nghiên cứu giúp sinh viên học sâu hơn và chuẩn bị tốt cho đồ án hoặc học sau đại học.",
  },
  {
    title: "Cách chọn đề tài nghiên cứu hoặc đồ án nhỏ",
    topic: "Academic Affairs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Academic Affairs", "Research", "Career"],
    excerpt:
      "Cách chọn đề tài vừa sức, có dữ liệu, có người hướng dẫn và tạo được sản phẩm hoặc kết quả rõ ràng.",
    body:
      "Một đề tài tốt cần cân bằng giữa hứng thú cá nhân và khả năng thực hiện. Sinh viên nên tự hỏi: vấn đề này có đủ nhỏ để hoàn thành không, có tài liệu hoặc dữ liệu để tham khảo không, có thể đo kết quả bằng tiêu chí nào, và mình có đủ kỹ năng nền chưa. Đề tài quá rộng dễ dẫn đến làm dở dang, còn đề tài quá đơn giản có thể không tạo được giá trị học tập. Hãy ưu tiên đề tài có người dùng hoặc tình huống thực tế, ví dụ cải thiện quy trình học, quản lý thông tin, phân tích dữ liệu nhỏ hoặc xây dựng công cụ hỗ trợ. Trước khi chốt, nên viết một trang đề cương gồm mục tiêu, phạm vi, sản phẩm cuối và lịch mốc. Điều này giúp giảng viên phản hồi nhanh và giúp nhóm tránh đổi hướng liên tục.",
  },
  {
    title: "Cách làm việc với mentor hoặc giảng viên hướng dẫn",
    topic: "Soft Skills",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "5 phút",
    tags: ["Soft Skills", "Research", "Career"],
    excerpt:
      "Cách chuẩn bị trước buổi gặp, nhận phản hồi và theo dõi cam kết khi làm việc với người hướng dẫn.",
    body:
      "Làm việc với mentor hoặc giảng viên hướng dẫn hiệu quả cần sự chủ động từ sinh viên. Trước mỗi buổi gặp, hãy gửi trước mục tiêu trao đổi, tiến độ đã làm, khó khăn cụ thể và lựa chọn đang cân nhắc. Trong buổi trao đổi, sinh viên nên ghi lại phản hồi, câu hỏi cần tìm hiểu thêm và quyết định cuối cùng. Sau buổi gặp, hãy gửi tóm tắt ngắn để xác nhận hiểu đúng và đặt mốc hoàn thành tiếp theo. Nếu gặp vấn đề chậm tiến độ, cần báo sớm với lý do cụ thể thay vì im lặng đến sát hạn. Sự chuyên nghiệp trong giao tiếp giúp người hướng dẫn dễ hỗ trợ hơn và giúp sinh viên rèn cách làm việc giống môi trường nghề nghiệp.",
  },
  {
    title: "Cách xử lý áp lực học tập trong mùa thi",
    topic: "Student Psychology",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Student Psychology", "Soft Skills", "Academic Affairs"],
    excerpt:
      "Gợi ý nhận diện áp lực mùa thi và điều chỉnh lịch học, nghỉ ngơi, hỗ trợ để tránh quá tải.",
    body:
      "Áp lực mùa thi thường tăng khi sinh viên thiếu kế hoạch, ngủ ít và so sánh bản thân quá nhiều với người khác. Dấu hiệu cần chú ý gồm mất ngủ kéo dài, khó tập trung, né tránh học tập, cáu gắt hoặc cảm giác bất lực. Thay vì cố học liên tục nhiều giờ, hãy chia buổi học thành các phiên ngắn có mục tiêu rõ, xen kẽ nghỉ ngơi và vận động nhẹ. Sinh viên nên ưu tiên môn có lịch thi gần hoặc môn có nguy cơ rớt cao, đồng thời chấp nhận rằng không thể học hoàn hảo mọi thứ trong thời gian ngắn. Nếu áp lực vượt khỏi khả năng tự điều chỉnh, hãy nói chuyện với bạn tin cậy, cố vấn hoặc tư vấn viên. Việc tìm hỗ trợ sớm là cách bảo vệ kết quả học tập và sức khỏe tinh thần.",
  },
  {
    title: "Cách quản lý tài chính cá nhân cho sinh viên",
    topic: "Financial",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Financial", "Student Guide", "Personal Development"],
    excerpt:
      "Cách lập ngân sách sinh viên theo học phí, sinh hoạt phí, khoản dự phòng và mục tiêu tiết kiệm nhỏ.",
    body:
      "Quản lý tài chính cá nhân bắt đầu từ việc biết tiền đang đi đâu. Sinh viên nên ghi lại các khoản cố định như học phí, thuê trọ, đi lại, ăn uống, điện thoại và các khoản biến động như tài liệu, hoạt động, mua sắm. Sau một tháng, hãy phân nhóm chi tiêu cần thiết và chi tiêu có thể giảm. Một ngân sách đơn giản nên có khoản dự phòng cho y tế, sửa xe hoặc việc phát sinh, dù số tiền ban đầu nhỏ. Khi nhận học bổng, trợ cấp hoặc lương làm thêm, không nên dùng hết ngay mà nên chia cho các mục tiêu: chi phí bắt buộc, tiết kiệm, học tập và giải trí. Thói quen theo dõi tài chính giúp sinh viên bớt căng thẳng và ra quyết định tốt hơn khi cân nhắc làm thêm hoặc đăng ký khóa học.",
  },
  {
    title: "Cách tìm việc làm thêm an toàn và phù hợp",
    topic: "Jobs",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Jobs", "Financial", "Student Guide"],
    excerpt:
      "Các tiêu chí kiểm tra việc làm thêm để tránh rủi ro và không ảnh hưởng quá nhiều đến tiến độ học.",
    body:
      "Việc làm thêm phù hợp cần rõ ràng về thời gian, nhiệm vụ, mức lương, địa điểm và người chịu trách nhiệm. Sinh viên nên ưu tiên nguồn tin từ trường, doanh nghiệp uy tín, người quen đáng tin cậy hoặc kênh tuyển dụng có thông tin minh bạch. Cần thận trọng với công việc yêu cầu đóng phí trước, giữ giấy tờ cá nhân, hứa thu nhập quá cao hoặc mô tả công việc mơ hồ. Trước khi nhận việc, hãy kiểm tra lịch học, thời gian di chuyển và số giờ tối đa có thể làm mà không ảnh hưởng sức khỏe. Nếu công việc giúp rèn kỹ năng liên quan ngành học thì càng tốt, nhưng an toàn và tiến độ học vẫn là ưu tiên chính. Khi thấy dấu hiệu bất thường, sinh viên nên dừng lại và hỏi ý kiến cố vấn hoặc người có kinh nghiệm.",
  },
  {
    title: "Cách xây dựng thương hiệu cá nhân trên LinkedIn",
    topic: "Career",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Career", "Jobs", "Personal Development"],
    excerpt:
      "Gợi ý xây dựng hồ sơ LinkedIn rõ ràng bằng dự án, kỹ năng, hoạt động và mục tiêu nghề nghiệp.",
    body:
      "LinkedIn không chỉ dành cho người đã đi làm. Sinh viên có thể dùng nền tảng này để trình bày quá trình học, dự án, hoạt động và định hướng nghề nghiệp. Hồ sơ nên có ảnh phù hợp, tiêu đề ngắn gọn, phần giới thiệu nêu ngành học và lĩnh vực quan tâm. Thay vì liệt kê kỹ năng chung chung, hãy gắn kỹ năng với dự án hoặc sản phẩm cụ thể. Sinh viên có thể đăng bài ngắn về điều đã học sau một dự án, buổi workshop hoặc kỳ thực tập, nhưng cần giữ giọng chuyên nghiệp và trung thực. Kết nối với giảng viên, cựu sinh viên, nhà tuyển dụng và cộng đồng chuyên môn cũng giúp mở rộng cơ hội. Thương hiệu cá nhân tốt là sự nhất quán giữa năng lực thật, cách trình bày và thái độ học hỏi.",
  },
  {
    title: "Cách chuẩn bị cho ngày hội việc làm",
    topic: "Jobs",
    status: "Published",
    author: "HCMUTE",
    faculty: "HCMUTE",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Checklist trước ngày hội việc làm: CV, câu giới thiệu, doanh nghiệp mục tiêu và câu hỏi cần chuẩn bị.",
    body:
      "Ngày hội việc làm sẽ hiệu quả hơn nếu sinh viên chuẩn bị trước thay vì chỉ đi tham quan. Hãy xem danh sách doanh nghiệp, chọn một số đơn vị phù hợp với ngành học và đọc trước vị trí tuyển dụng. Sinh viên nên mang CV bản in hoặc bản điện tử, chuẩn bị phần giới thiệu bản thân trong một phút và vài câu hỏi cụ thể về vị trí, kỹ năng cần có, quy trình tuyển dụng hoặc chương trình thực tập. Khi trao đổi với doanh nghiệp, hãy ghi lại tên người phụ trách, thông tin liên hệ và việc cần làm sau sự kiện. Sau ngày hội, nên gửi email cảm ơn hoặc nộp hồ sơ theo hướng dẫn sớm. Sự chuẩn bị này giúp sinh viên tạo ấn tượng tốt và biến sự kiện thành cơ hội thực tế.",
  },
  {
    title: "Cách tổng kết năng lực bản thân sau mỗi năm học",
    topic: "Personal Development",
    status: "Published",
    author: "HCMUTE",
    faculty: "Student Support Center",
    contentType: "Article",
    views: 0,
    saves: 0,
    readTime: "6 phút",
    tags: ["Personal Development", "Career", "Academic Affairs"],
    excerpt:
      "Khung tự đánh giá cuối năm học giúp sinh viên nhìn lại điểm mạnh, lỗ hổng kỹ năng và mục tiêu năm sau.",
    body:
      "Sau mỗi năm học, sinh viên nên dành thời gian tổng kết thay vì chỉ nhìn vào GPA. Hãy xem lại các môn đã học, dự án đã làm, hoạt động đã tham gia, kỹ năng mới có và những việc chưa đạt. Một khung đơn giản gồm bốn phần: kiến thức chuyên môn, kỹ năng mềm, trải nghiệm nghề nghiệp và sức khỏe cá nhân. Với mỗi phần, hãy ghi bằng chứng cụ thể như sản phẩm, điểm số, phản hồi từ giảng viên hoặc tình huống đã xử lý. Sau đó chọn tối đa ba mục tiêu cho năm học tiếp theo để tránh dàn trải. Tổng kết định kỳ giúp sinh viên nhận ra tiến bộ thật, phát hiện lỗ hổng sớm và có dữ liệu tốt hơn khi viết CV, xin học bổng hoặc chọn hướng thực tập.",
  },
  {
    title: "Thông báo học bổng khuyến khích học tập học kỳ 1 năm 2026",
    topic: "Scholarships",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Scholarships", "Academic Affairs", "Financial"],
    excerpt:
      "Sinh viên có kết quả học tập và rèn luyện tốt cần chuẩn bị hồ sơ học bổng theo thông báo mới của trường.",
    body:
      "Phòng Công tác Sinh viên thông báo kế hoạch tiếp nhận hồ sơ học bổng khuyến khích học tập học kỳ 1 năm 2026. Sinh viên cần kiểm tra điểm học tập, điểm rèn luyện, tình trạng kỷ luật và các điều kiện kèm theo trước khi nộp. Hồ sơ nên được chuẩn bị sớm gồm bảng điểm, minh chứng hoạt động nếu có và thông tin tài khoản nhận học bổng. Những trường hợp có thắc mắc về điều kiện xét chọn nên liên hệ bộ phận phụ trách trước hạn nộp để được hướng dẫn.",
  },
  {
    title: "Lịch đăng ký tín chỉ đợt chính học kỳ mới",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Đào tạo",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["Academic Affairs", "Training Regulations", "Đăng ký tín chỉ"],
    excerpt:
      "Sinh viên cần xem thời gian đăng ký theo khóa, kiểm tra môn tiên quyết và chuẩn bị phương án lớp thay thế.",
    body:
      "Phòng Đào tạo công bố lịch đăng ký tín chỉ đợt chính cho học kỳ mới. Sinh viên nên đăng nhập hệ thống trước thời gian mở cổng để kiểm tra tài khoản, học phí dự kiến, điều kiện tiên quyết và danh sách môn được phép đăng ký. Với các lớp có số lượng chỗ giới hạn, sinh viên nên chuẩn bị phương án thay thế để tránh bị trễ tiến độ học tập. Sau khi đăng ký, cần lưu kết quả và kiểm tra lại tổng số tín chỉ, lịch học, lịch thi nếu đã có thông tin.",
  },
  {
    title: "Ngày hội việc làm HCMUTE Career Day mở đăng ký tham gia",
    topic: "Jobs",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Ngày hội việc làm sẽ có gian hàng doanh nghiệp, phỏng vấn nhanh và khu vực tư vấn CV cho sinh viên.",
    body:
      "Trung tâm Quan hệ Doanh nghiệp mở đăng ký tham gia HCMUTE Career Day dành cho sinh viên đang tìm thực tập, việc làm bán thời gian hoặc cơ hội nghề nghiệp sau tốt nghiệp. Sinh viên nên chuẩn bị CV, hồ sơ năng lực và danh sách doanh nghiệp muốn gặp trước ngày sự kiện. Một số doanh nghiệp sẽ tổ chức phỏng vấn nhanh tại gian hàng, vì vậy sinh viên cần chuẩn bị phần giới thiệu bản thân ngắn gọn và câu hỏi về vị trí quan tâm.",
  },
  {
    title: "Hội thảo kỹ năng học đại học cho sinh viên năm nhất",
    topic: "Soft Skills",
    status: "Published",
    author: "Bộ phận Tư vấn Kỹ năng",
    faculty: "Student Support Center",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["Soft Skills", "Academic Affairs", "Student Guide"],
    excerpt:
      "Chương trình hỗ trợ sinh viên mới xây dựng phương pháp ghi chú, tự học và giao tiếp với giảng viên.",
    body:
      "Bộ phận Tư vấn Kỹ năng tổ chức hội thảo kỹ năng học đại học cho sinh viên năm nhất. Nội dung tập trung vào cách đọc đề cương môn học, ghi chú trên lớp, lập kế hoạch tự học và đặt câu hỏi khi gặp khó khăn. Sinh viên tham dự sẽ được thực hành xây dựng lịch học tuần đầu tiên và nhận gợi ý cách tận dụng thư viện, cố vấn học tập, nhóm học tập để thích nghi nhanh hơn với môi trường đại học.",
  },
  {
    title: "Mở đợt tư vấn tuyển sinh và chọn ngành trực tuyến",
    topic: "Career",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Career", "Academic Affairs", "Tuyển sinh"],
    excerpt:
      "Thí sinh và sinh viên năm nhất có thể đặt câu hỏi về chọn ngành, chương trình đào tạo và định hướng nghề nghiệp.",
    body:
      "Nhà trường mở đợt tư vấn trực tuyến về tuyển sinh và chọn ngành nhằm hỗ trợ người học ra quyết định dựa trên thông tin chính xác. Nội dung tư vấn bao gồm cách đọc chương trình đào tạo, năng lực phù hợp với từng nhóm ngành, cơ hội thực tập và các điểm cần lưu ý khi đăng ký nguyện vọng. Sinh viên đang cân nhắc điều chỉnh định hướng học tập cũng có thể tham gia để được gợi ý bước tiếp theo.",
  },
  {
    title: "Cập nhật chuyên mục FAQ về dịch vụ tư vấn sinh viên",
    topic: "FAQ",
    status: "Published",
    author: "Ban quản trị diễn đàn",
    faculty: "Community",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["FAQ", "Community", "Student Support"],
    excerpt:
      "Chuyên mục FAQ được bổ sung câu hỏi về học phí, học bổng, tín chỉ, thực tập và hỗ trợ tâm lý.",
    body:
      "Ban quản trị cập nhật chuyên mục FAQ để sinh viên tìm câu trả lời nhanh hơn trước khi gửi yêu cầu tư vấn. Các nhóm câu hỏi mới tập trung vào học phí, học bổng, đăng ký tín chỉ, thực tập, đồ án tốt nghiệp, ký túc xá và tư vấn tâm lý. Sinh viên nên tìm kiếm trong FAQ trước, sau đó mới tạo câu hỏi trên diễn đàn hoặc đặt lịch với tư vấn viên nếu cần hỗ trợ cá nhân hóa.",
  },
  {
    title: "Chương trình hỗ trợ sinh viên khó khăn hoàn thiện hồ sơ",
    topic: "Financial",
    status: "Published",
    author: "Bộ phận Hỗ trợ Sinh viên",
    faculty: "Student Support Center",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Financial", "Scholarships", "Student Support"],
    excerpt:
      "Sinh viên có khó khăn tài chính có thể đăng ký hướng dẫn chuẩn bị minh chứng và hồ sơ hỗ trợ.",
    body:
      "Bộ phận Hỗ trợ Sinh viên mở chương trình tư vấn hồ sơ cho sinh viên gặp khó khăn tài chính. Nội dung hỗ trợ bao gồm cách chuẩn bị giấy xác nhận, minh chứng hoàn cảnh, bảng chi phí học tập và kế hoạch học kỳ. Chương trình không thay thế quy trình xét duyệt chính thức, nhưng giúp sinh viên giảm lỗi giấy tờ và biết kênh hỗ trợ phù hợp như học bổng, miễn giảm, vay vốn hoặc quỹ hỗ trợ khẩn cấp.",
  },
  {
    title: "Cuộc thi học thuật sinh viên sáng tạo mở đăng ký",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Khoa học Công nghệ",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Academic Affairs", "Research", "Soft Skills"],
    excerpt:
      "Sinh viên có thể đăng ký đề tài nhỏ, sản phẩm học thuật hoặc ý tưởng cải tiến quy trình học tập.",
    body:
      "Phòng Khoa học Công nghệ thông báo mở đăng ký cuộc thi học thuật sinh viên sáng tạo. Cuộc thi khuyến khích các nhóm xây dựng sản phẩm, mô hình, nghiên cứu nhỏ hoặc giải pháp cải tiến trong học tập và đời sống sinh viên. Mỗi nhóm nên chuẩn bị mô tả vấn đề, mục tiêu, phương pháp thực hiện, phân công vai trò và kết quả dự kiến. Các đội được khuyến khích trao đổi với giảng viên hướng dẫn trước khi nộp đề cương.",
  },
  {
    title: "Tuyển cộng tác viên hỗ trợ diễn đàn sinh viên",
    topic: "Forum",
    status: "Published",
    author: "Ban quản trị diễn đàn",
    faculty: "Community",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["Forum", "Community", "Soft Skills"],
    excerpt:
      "Diễn đàn tuyển cộng tác viên hỗ trợ phân loại câu hỏi, nhắc quy định và tổng hợp chủ đề sinh viên quan tâm.",
    body:
      "Ban quản trị diễn đàn tuyển cộng tác viên sinh viên nhằm hỗ trợ cộng đồng hỏi đáp hoạt động hiệu quả hơn. Cộng tác viên sẽ giúp gắn thẻ câu hỏi, nhắc người đăng bổ sung thông tin, tổng hợp các chủ đề thường gặp và chuyển các trường hợp cần hỗ trợ chuyên sâu đến kênh tư vấn phù hợp. Ứng viên nên có khả năng giao tiếp lịch sự, hiểu quy định cơ bản của trường và sẵn sàng học cách xử lý tình huống cộng đồng.",
  },
  {
    title: "Lịch tư vấn hướng nghiệp theo nhóm trong tháng",
    topic: "Career",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "News",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Career", "Jobs", "Internships"],
    excerpt:
      "Các buổi tư vấn nhóm giúp sinh viên tìm hiểu lộ trình nghề nghiệp, thực tập và chuẩn bị hồ sơ ứng tuyển.",
    body:
      "Trung tâm Quan hệ Doanh nghiệp công bố lịch tư vấn hướng nghiệp theo nhóm trong tháng. Mỗi buổi tập trung vào một chủ đề như chọn hướng chuyên môn, chuẩn bị CV, tìm nơi thực tập, luyện phỏng vấn và xây dựng portfolio. Sinh viên nên đăng ký đúng nhóm chủ đề mình quan tâm và chuẩn bị trước câu hỏi cụ thể. Hình thức tư vấn nhóm phù hợp với những vấn đề phổ biến, còn trường hợp cá nhân phức tạp có thể đặt lịch riêng với tư vấn viên.",
  },
  {
    title: "Workshop viết CV kỹ thuật cho sinh viên chuẩn bị thực tập",
    topic: "Jobs",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Workshop hướng dẫn sinh viên trình bày dự án, kỹ năng và kinh nghiệm học tập trong CV thực tập.",
    body:
      "Workshop viết CV kỹ thuật dành cho sinh viên đang chuẩn bị nộp hồ sơ thực tập. Người tham gia sẽ được hướng dẫn cách chọn dự án đưa vào CV, mô tả vai trò cá nhân, trình bày công nghệ đã dùng và tránh các lỗi phổ biến như liệt kê kỹ năng không có minh chứng. Sinh viên nên mang theo bản CV hiện tại hoặc danh sách dự án đã làm để nhận góp ý trực tiếp từ cố vấn nghề nghiệp.",
  },
  {
    title: "Ngày hội việc làm và kết nối doanh nghiệp HCMUTE",
    topic: "Jobs",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Jobs", "Internships", "Career"],
    excerpt:
      "Sự kiện kết nối sinh viên với doanh nghiệp tuyển dụng, chương trình thực tập và tư vấn hồ sơ.",
    body:
      "Ngày hội việc làm và kết nối doanh nghiệp tạo cơ hội để sinh viên gặp trực tiếp nhà tuyển dụng, tìm hiểu nhu cầu nhân lực và nộp hồ sơ thực tập. Bên cạnh gian hàng doanh nghiệp, sự kiện có khu vực tư vấn CV, phỏng vấn thử và chia sẻ từ cựu sinh viên. Sinh viên nên chuẩn bị hồ sơ, trang phục phù hợp và danh sách câu hỏi để tận dụng tốt thời gian tại sự kiện.",
  },
  {
    title: "Buổi tư vấn chọn ngành và điều chỉnh kế hoạch học tập",
    topic: "Career",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Career", "Academic Affairs", "Student Support"],
    excerpt:
      "Buổi tư vấn giúp sinh viên kiểm tra mức độ phù hợp ngành học và cách điều chỉnh lộ trình nếu cần.",
    body:
      "Buổi tư vấn chọn ngành và điều chỉnh kế hoạch học tập dành cho sinh viên đang phân vân về định hướng hiện tại. Nội dung gồm cách đọc chương trình đào tạo, nhận diện dấu hiệu không phù hợp, đánh giá tín chỉ đã tích lũy và chuẩn bị phương án chuyển hướng an toàn. Sinh viên nên mang theo bảng điểm, danh sách môn đã học và câu hỏi cụ thể để nhận được góp ý thực tế hơn.",
  },
  {
    title: "Talkshow sức khỏe tinh thần trước mùa thi",
    topic: "Student Psychology",
    status: "Published",
    author: "Tổ tư vấn tâm lý",
    faculty: "Student Support Center",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["Student Psychology", "Soft Skills", "Student Support"],
    excerpt:
      "Talkshow chia sẻ cách nhận diện căng thẳng, lập lịch ôn thi và tìm hỗ trợ khi áp lực kéo dài.",
    body:
      "Tổ tư vấn tâm lý tổ chức talkshow sức khỏe tinh thần trước mùa thi nhằm giúp sinh viên chuẩn bị tâm lý và phương pháp học phù hợp. Chương trình đề cập đến dấu hiệu quá tải, cách chia thời gian ôn tập, giữ nhịp ngủ và xử lý cảm giác lo lắng. Sinh viên cũng được giới thiệu các kênh hỗ trợ khi cần trao đổi riêng với tư vấn viên hoặc cố vấn học tập.",
  },
  {
    title: "Workshop quản lý tài chính cá nhân cho sinh viên",
    topic: "Financial",
    status: "Published",
    author: "Bộ phận Hỗ trợ Sinh viên",
    faculty: "Student Support Center",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Financial", "Scholarships", "Personal Development"],
    excerpt:
      "Workshop hướng dẫn lập ngân sách, theo dõi chi tiêu và tìm nguồn hỗ trợ tài chính phù hợp.",
    body:
      "Workshop quản lý tài chính cá nhân giúp sinh viên xây dựng ngân sách học kỳ, phân loại chi tiêu bắt buộc và chi tiêu linh hoạt, đồng thời chuẩn bị khoản dự phòng. Chương trình cũng giới thiệu cách tìm học bổng, hỗ trợ khó khăn và công việc làm thêm an toàn. Sinh viên tham gia sẽ thực hành lập bảng chi tiêu mẫu theo hoàn cảnh cá nhân.",
  },
  {
    title: "Seminar nghiên cứu khoa học sinh viên từ ý tưởng đến đề cương",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Khoa học Công nghệ",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Academic Affairs", "Research", "Soft Skills"],
    excerpt:
      "Seminar hướng dẫn sinh viên chọn vấn đề, đọc tài liệu nền và viết đề cương nghiên cứu khả thi.",
    body:
      "Seminar nghiên cứu khoa học sinh viên tập trung vào quá trình biến một ý tưởng ban đầu thành đề cương có thể triển khai. Diễn giả sẽ hướng dẫn cách đặt câu hỏi nghiên cứu, thu hẹp phạm vi, tìm tài liệu nền, chọn phương pháp và lập kế hoạch tiến độ. Sinh viên có thể mang ý tưởng sơ bộ đến chương trình để được góp ý về tính khả thi và cách tìm giảng viên hướng dẫn.",
  },
  {
    title: "Buổi hướng dẫn đăng ký tín chỉ và đọc điều kiện tiên quyết",
    topic: "Training Regulations",
    status: "Published",
    author: "Phòng Đào tạo",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Training Regulations", "Academic Affairs", "Đăng ký tín chỉ"],
    excerpt:
      "Buổi hướng dẫn giúp sinh viên tránh lỗi đăng ký môn, sai điều kiện tiên quyết và quá tải tín chỉ.",
    body:
      "Phòng Đào tạo tổ chức buổi hướng dẫn đăng ký tín chỉ và đọc điều kiện tiên quyết cho sinh viên. Nội dung gồm cách xem khung chương trình, kiểm tra môn học trước sau, chọn lớp thay thế và xử lý tình huống lớp đầy. Sinh viên nên chuẩn bị danh sách môn dự kiến đăng ký, số tín chỉ còn thiếu và các câu hỏi về tiến độ học tập để được hỗ trợ chính xác.",
  },
  {
    title: "Gặp gỡ cố vấn học tập cho sinh viên năm nhất",
    topic: "Academic Affairs",
    status: "Published",
    author: "Phòng Công tác Sinh viên",
    faculty: "Student Support Center",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "3 phút",
    tags: ["Academic Affairs", "Student Guide", "Student Support"],
    excerpt:
      "Chương trình giúp sinh viên mới hiểu vai trò cố vấn học tập và cách đặt câu hỏi khi cần hỗ trợ.",
    body:
      "Chương trình gặp gỡ cố vấn học tập dành cho sinh viên năm nhất nhằm giới thiệu các kênh hỗ trợ học vụ, tư vấn kỹ năng và định hướng cá nhân. Sinh viên sẽ được hướng dẫn cách chuẩn bị câu hỏi, theo dõi tiến độ học tập và liên hệ đúng bộ phận khi gặp vấn đề. Đây cũng là dịp để sinh viên mới làm quen với bạn học và xây dựng nhóm hỗ trợ học tập ban đầu.",
  },
  {
    title: "Workshop xây dựng portfolio và hồ sơ LinkedIn",
    topic: "Career",
    status: "Published",
    author: "Trung tâm Quan hệ Doanh nghiệp",
    faculty: "HCMUTE",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Career", "Jobs", "Portfolio"],
    excerpt:
      "Workshop hướng dẫn sinh viên chọn dự án, trình bày năng lực và xây dựng hình ảnh chuyên nghiệp.",
    body:
      "Workshop xây dựng portfolio và hồ sơ LinkedIn giúp sinh viên biến bài tập, dự án môn học và hoạt động cá nhân thành minh chứng năng lực rõ ràng. Người tham gia sẽ học cách mô tả dự án theo vấn đề, giải pháp, công cụ và kết quả, đồng thời tối ưu phần giới thiệu trên LinkedIn. Sinh viên nên chuẩn bị trước danh sách dự án hoặc đường dẫn sản phẩm để thực hành chỉnh sửa ngay tại buổi học.",
  },
  {
    title: "Chương trình kết nối cựu sinh viên và cộng đồng học tập",
    topic: "Community",
    status: "Published",
    author: "Ban quản trị diễn đàn",
    faculty: "Community",
    contentType: "Event",
    views: 0,
    saves: 0,
    readTime: "4 phút",
    tags: ["Community", "Career", "Forum"],
    excerpt:
      "Sự kiện tạo cơ hội để sinh viên gặp cựu sinh viên, hỏi kinh nghiệm học tập và mở rộng mạng lưới nghề nghiệp.",
    body:
      "Chương trình kết nối cựu sinh viên và cộng đồng học tập được tổ chức nhằm giúp sinh viên có thêm góc nhìn thực tế về học tập, thực tập và nghề nghiệp. Cựu sinh viên sẽ chia sẻ kinh nghiệm chọn chuyên ngành, tìm cơ hội thực tập, xây dựng portfolio và vượt qua giai đoạn đầu đi làm. Sinh viên được khuyến khích chuẩn bị câu hỏi trước và tiếp tục trao đổi trên diễn đàn sau sự kiện.",
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
  {
    question: "Em có thể xem thông tin học phí ở đâu?",
    answer:
      "Em nên xem học phí dự kiến trong cổng sinh viên, thông báo của Phòng Đào tạo hoặc liên hệ bộ phận tài chính sinh viên nếu số tiền hiển thị chưa rõ. Khi hỏi, em cần chuẩn bị mã số sinh viên, học kỳ, số tín chỉ đã đăng ký và ảnh chụp màn hình nếu có lỗi.",
    category: "Financial",
    status: "Published",
  },
  {
    question: "Muốn xin học bổng thì em cần chuẩn bị gì trước?",
    answer:
      "Em nên chuẩn bị bảng điểm, điểm rèn luyện, minh chứng hoạt động, giấy xác nhận hoàn cảnh nếu học bổng yêu cầu và bài trình bày mục tiêu học tập. Nên theo dõi hạn nộp sớm vì một số giấy tờ cần thời gian xác nhận.",
    category: "Scholarships",
    status: "Published",
  },
  {
    question: "Nếu đăng ký tín chỉ bị trùng lịch thì xử lý thế nào?",
    answer:
      "Em cần kiểm tra lại nhóm lớp, môn tiên quyết và số tín chỉ tối đa trước. Nếu còn lớp thay thế, hãy đổi ngay trong thời gian hệ thống cho phép. Nếu không còn phương án, em nên liên hệ cố vấn học tập hoặc phòng đào tạo để được hướng dẫn theo quy định.",
    category: "Academic Affairs",
    status: "Published",
  },
  {
    question: "Khi nào nên hỏi về chuyển ngành?",
    answer:
      "Em nên hỏi khi đã có dữ liệu rõ như kết quả học tập, mức độ phù hợp ngành hiện tại, ngành muốn chuyển và tín chỉ đã tích lũy. Việc chuyển ngành cần xem điều kiện, thời hạn, chỉ tiêu và khả năng công nhận môn đã học.",
    category: "Training Regulations",
    status: "Published",
  },
  {
    question: "Bảo lưu học tập cần bắt đầu từ đâu?",
    answer:
      "Em nên liên hệ phòng đào tạo hoặc cố vấn học tập để biết điều kiện, hồ sơ và thời hạn bảo lưu. Trước khi nộp, cần cân nhắc ảnh hưởng đến tiến độ tốt nghiệp, học phí, học bổng và các môn đang đăng ký.",
    category: "Training Regulations",
    status: "Published",
  },
  {
    question: "Em nên tìm nơi thực tập qua kênh nào?",
    answer:
      "Em có thể theo dõi thông báo từ khoa, trung tâm quan hệ doanh nghiệp, ngày hội việc làm, cộng đồng cựu sinh viên và các kênh tuyển dụng uy tín. Trước khi nộp hồ sơ, nên kiểm tra mô tả công việc, người hướng dẫn và thời gian thực tập.",
    category: "Internships",
    status: "Published",
  },
  {
    question: "Chuẩn bị đồ án tốt nghiệp cần lưu ý gì?",
    answer:
      "Em nên chọn đề tài vừa sức, có dữ liệu hoặc tài liệu tham khảo, có giảng viên hướng dẫn phù hợp và có kế hoạch tiến độ rõ. Nếu làm nhóm, cần thống nhất vai trò, công cụ lưu trữ và lịch báo cáo định kỳ.",
    category: "Academic Affairs",
    status: "Published",
  },
  {
    question: "Thông tin ký túc xá nên hỏi ở đâu?",
    answer:
      "Em nên theo dõi thông báo chính thức của trường hoặc đơn vị quản lý ký túc xá về thời gian đăng ký, điều kiện, chi phí và hồ sơ. Không nên chuyển tiền đặt chỗ qua nguồn không rõ ràng hoặc nhóm không chính thức.",
    category: "Student Support",
    status: "Published",
  },
  {
    question: "Hồ sơ nhập học thiếu giấy tờ thì có được bổ sung không?",
    answer:
      "Tùy loại giấy tờ và quy định từng đợt nhập học, em có thể được hướng dẫn bổ sung trong thời hạn nhất định. Em nên liên hệ bộ phận tiếp nhận hồ sơ sớm, trình bày rõ giấy tờ còn thiếu và chuẩn bị minh chứng thay thế nếu có.",
    category: "Academic Affairs",
    status: "Published",
  },
  {
    question: "Tư vấn tâm lý sinh viên có bảo mật không?",
    answer:
      "Thông tin tư vấn cá nhân cần được xử lý thận trọng và chỉ dùng để hỗ trợ sinh viên. Nếu em lo lắng về quyền riêng tư, hãy hỏi rõ phạm vi bảo mật, trường hợp ngoại lệ và cách lưu thông tin trước khi bắt đầu buổi tư vấn.",
    category: "Student Psychology",
    status: "Published",
  },
  {
    question: "Làm sao để liên hệ cố vấn học tập hiệu quả?",
    answer:
      "Em nên chuẩn bị câu hỏi cụ thể, mã số sinh viên, ngành học, bảng điểm hoặc danh sách môn dự kiến đăng ký. Khi gửi email, hãy viết tiêu đề rõ, nội dung ngắn gọn và nêu việc em đã tự kiểm tra trước đó.",
    category: "Academic Affairs",
    status: "Published",
  },
  {
    question: "Chuẩn đầu ra ngoại ngữ và tin học cần kiểm tra ở đâu?",
    answer:
      "Em nên xem quy định đào tạo của khóa, thông báo từ phòng đào tạo và hướng dẫn của khoa. Cần kiểm tra loại chứng chỉ được công nhận, thời hạn hiệu lực, mốc nộp minh chứng và điều kiện liên quan đến xét tốt nghiệp.",
    category: "Training Regulations",
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
  {
    title: "Kinh nghiệm đăng ký tín chỉ không bị trùng lịch",
    content:
      "Mỗi lần đăng ký tín chỉ em hay bị trùng lịch hoặc hết chỗ lớp mong muốn. Mọi người thường chuẩn bị phương án lớp thay thế như thế nào?",
    author: "Sinh viên K23",
    tags: ["Academic Affairs", "Đăng ký tín chỉ"],
    votes: 15,
    replies: [
      {
        user: "Cố vấn học tập",
        content:
          "Em nên lập trước danh sách môn bắt buộc, lớp ưu tiên và ít nhất hai lớp dự phòng. Sau khi đăng ký xong cần kiểm tra lại tổng tín chỉ và lịch thi nếu hệ thống đã có dữ liệu.",
      },
      {
        user: "Sinh viên K21",
        content:
          "Mình thường mở sẵn khung chương trình và ghi mã lớp dự phòng ra giấy trước giờ đăng ký để thao tác nhanh hơn.",
      },
    ],
  },
  {
    title: "Xin review môn học có nhiều bài tập nhóm",
    content:
      "Học kỳ tới em có một số môn nghe nói nhiều bài tập nhóm. Anh chị có kinh nghiệm chọn nhóm và chia việc để không bị dồn vào cuối kỳ không?",
    author: "Minh Anh",
    tags: ["Soft Skills", "Academic Affairs"],
    votes: 9,
    replies: [
      {
        user: "Bộ phận Tư vấn Kỹ năng",
        content:
          "Nhóm nên thống nhất kênh trao đổi, lịch kiểm tra tiến độ và tiêu chí hoàn thành ngay từ tuần đầu. Với môn nhiều bài tập, chia nhỏ đầu việc theo tuần sẽ giảm rủi ro dồn việc.",
      },
    ],
  },
  {
    title: "Tìm nhóm làm đồ án môn học về web tư vấn sinh viên",
    content:
      "Em muốn tìm thêm bạn làm đồ án nhỏ về hệ thống tư vấn sinh viên. Nhóm cần người biết frontend hoặc có thể phụ trách nội dung khảo sát.",
    author: "Sinh viên K22",
    tags: ["Đồ án", "Soft Skills", "Community"],
    votes: 7,
    replies: [
      {
        user: "Admin",
        content:
          "Em nên bổ sung yêu cầu kỹ năng, thời gian họp dự kiến và phạm vi đồ án để các bạn khác dễ quyết định tham gia.",
      },
    ],
  },
  {
    title: "Cách học qua môn khó khi nền tảng chưa chắc",
    content:
      "Em bị hổng kiến thức nền nên học môn chuyên ngành khá chậm. Có nên học lại từ đầu hay tập trung giải đề trước?",
    author: "Duy",
    tags: ["Academic Affairs", "Soft Skills"],
    votes: 18,
    replies: [
      {
        user: "Cố vấn học tập",
        content:
          "Em nên xác định phần nền tảng nào đang làm em không theo kịp, sau đó học lại có chọn lọc. Giải đề vẫn cần thiết nhưng nên dùng để phát hiện lỗ hổng, không chỉ học thuộc lời giải.",
      },
    ],
  },
  {
    title: "Hỏi về học bổng cho sinh viên có hoàn cảnh khó khăn",
    content:
      "Ngoài học bổng theo điểm, trường có kênh hỗ trợ nào cho sinh viên khó khăn tài chính không? Hồ sơ thường cần những giấy tờ gì?",
    author: "Sinh viên K24",
    tags: ["Scholarships", "Financial"],
    votes: 11,
    replies: [
      {
        user: "Bộ phận Hỗ trợ Sinh viên",
        content:
          "Em nên theo dõi thông báo học bổng hỗ trợ, quỹ khẩn cấp và chương trình doanh nghiệp. Hồ sơ thường cần giấy xác nhận hoàn cảnh, bảng điểm và đơn trình bày nhu cầu hỗ trợ.",
      },
    ],
  },
  {
    title: "Tìm nơi thực tập phù hợp với sinh viên chưa có kinh nghiệm",
    content:
      "Em chưa có kinh nghiệm làm việc, chỉ có dự án môn học. Khi tìm thực tập nên ưu tiên công ty lớn hay nơi có mentor hướng dẫn sát hơn?",
    author: "Huy K22",
    tags: ["Internships", "Jobs", "Career"],
    votes: 14,
    replies: [
      {
        user: "Trung tâm Quan hệ Doanh nghiệp",
        content:
          "Với kỳ thực tập đầu, môi trường có người hướng dẫn rõ và nhiệm vụ phù hợp thường quan trọng hơn tên công ty. Em nên hỏi kỹ quy trình mentor và sản phẩm sẽ tham gia.",
      },
    ],
  },
  {
    title: "Kinh nghiệm ở ký túc xá cho sinh viên năm nhất",
    content:
      "Em chuẩn bị nhập học và đang cân nhắc ở ký túc xá. Anh chị có lưu ý gì về đồ dùng, giờ giấc và cách sống chung không?",
    author: "Tân sinh viên",
    tags: ["Student Support", "Community"],
    votes: 10,
    replies: [
      {
        user: "Sinh viên K21",
        content:
          "Nên chuẩn bị đồ dùng cá nhân gọn, thống nhất quy tắc sinh hoạt với bạn cùng phòng từ đầu và theo dõi thông báo chính thức của ký túc xá.",
      },
    ],
  },
  {
    title: "Cân bằng học và làm thêm khi lịch học thay đổi liên tục",
    content:
      "Em muốn làm thêm để giảm áp lực tài chính nhưng lịch học mỗi kỳ thay đổi. Làm sao để không ảnh hưởng điểm số?",
    author: "Lan Anh",
    tags: ["Financial", "Jobs", "Student Psychology"],
    votes: 13,
    replies: [
      {
        user: "Bộ phận Hỗ trợ Sinh viên",
        content:
          "Em nên chọn công việc có lịch linh hoạt, giới hạn số giờ mỗi tuần và theo dõi điểm số sau một tháng. Nếu áp lực tài chính lớn, hãy tìm thêm kênh học bổng hoặc hỗ trợ sinh viên.",
      },
    ],
  },
  {
    title: "Chuẩn bị phỏng vấn thực tập nên luyện phần nào trước",
    content:
      "Em sắp phỏng vấn thực tập lần đầu. Ngoài giới thiệu bản thân và kiến thức chuyên môn, em nên chuẩn bị thêm phần nào?",
    author: "Sinh viên năm 3",
    tags: ["Internships", "Jobs", "Soft Skills"],
    votes: 16,
    replies: [
      {
        user: "Tư vấn viên nghề nghiệp",
        content:
          "Em nên chuẩn bị câu chuyện dự án theo bối cảnh, vai trò, cách xử lý khó khăn và kết quả. Ngoài ra cần có câu hỏi ngược về công việc, mentor và kỳ vọng trong thời gian thực tập.",
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
