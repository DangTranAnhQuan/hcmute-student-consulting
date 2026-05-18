const mongoose = require("mongoose");
const Counselor = require("./src/models/Counselor");
const Availability = require("./src/models/Availability");

require("dotenv").config();

const sampleCounselors = [
  {
    userId: "507f1f77bcf86cd799439011", // Mock user ID
    fullName: "Nguyễn Văn A",
    expertise: ["Career", "Academic"],
    bio: "Tư vấn viên giàu kinh nghiệm trong lĩnh vực tư vấn sự nghiệp. Có 10 năm kinh nghiệm làm việc tại các công ty hàng đầu.",
    hourlyRate: 150000,
    rating: 4.8,
    totalBookings: 45,
    isActive: true,
  },
  {
    userId: "507f1f77bcf86cd799439012",
    fullName: "Trần Thị B",
    expertise: ["Mental Health", "Personal Development"],
    bio: "Chuyên gia tâm lý với bằng cấp quốc tế. Giúp sinh viên giải quyết stress và phát triển kỹ năng cá nhân.",
    hourlyRate: 200000,
    rating: 4.9,
    totalBookings: 62,
    isActive: true,
  },
  {
    userId: "507f1f77bcf86cd799439013",
    fullName: "Lê Minh C",
    expertise: ["Financial", "Career"],
    bio: "Tư vấn viên tài chính cá nhân. Hướng dẫn sinh viên quản lý tài chính và lập kế hoạch tài chính dài hạn.",
    hourlyRate: 180000,
    rating: 4.7,
    totalBookings: 38,
    isActive: true,
  },
  {
    userId: "507f1f77bcf86cd799439014",
    fullName: "Phạm Hương D",
    expertise: ["Academic", "Career"],
    bio: "Thạc sĩ Giáo dục. Giúp sinh viên cải thiện kỹ năng học tập và chuẩn bị cho kỳ thi.",
    hourlyRate: 120000,
    rating: 4.6,
    totalBookings: 55,
    isActive: true,
  },
  {
    userId: "507f1f77bcf86cd799439015",
    fullName: "Võ Văn E",
    expertise: ["Personal Development", "Mental Health"],
    bio: "Coach phát triển bản thân. Hỗ trợ sinh viên xây dựng tự tin và phát triển lãnh đạo.",
    hourlyRate: 160000,
    rating: 4.8,
    totalBookings: 71,
    isActive: true,
  },
  {
    userId: "507f1f77bcf86cd799439016",
    fullName: "Hoàng Minh F",
    expertise: ["Career", "Financial", "Academic"],
    bio: "Cố vấn toàn diện cho sinh viên. Kinh nghiệm 15 năm trong tư vấn hướng nghiệp và phát triển kỹ năng.",
    hourlyRate: 200000,
    rating: 5.0,
    totalBookings: 89,
    isActive: true,
  },
];

const sampleAvailability = [
  {
    counselorId: null, // Will be set after counselor creation
    dayOfWeek: 1, // Monday
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    isActive: true,
  },
  {
    counselorId: null,
    dayOfWeek: 2, // Tuesday
    startTime: "10:00",
    endTime: "18:00",
    slotDuration: 60,
    isActive: true,
  },
  {
    counselorId: null,
    dayOfWeek: 3, // Wednesday
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    isActive: true,
  },
  {
    counselorId: null,
    dayOfWeek: 4, // Thursday
    startTime: "10:00",
    endTime: "18:00",
    slotDuration: 60,
    isActive: true,
  },
  {
    counselorId: null,
    dayOfWeek: 5, // Friday
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 60,
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Counselor.deleteMany({});
    await Availability.deleteMany({});
    console.log("🗑️  Cleared existing data");

    // Insert counselors
    const createdCounselors = await Counselor.insertMany(sampleCounselors);
    console.log(`✅ Created ${createdCounselors.length} counselors`);

    // Create availability for each counselor
    const availabilityData = [];
    createdCounselors.forEach((counselor) => {
      sampleAvailability.forEach((avail) => {
        availabilityData.push({
          ...avail,
          counselorId: counselor._id,
        });
      });
    });

    const createdAvailability = await Availability.insertMany(availabilityData);
    console.log(`✅ Created ${createdAvailability.length} availability slots`);

    // Update counselors with availability IDs
    for (let i = 0; i < createdCounselors.length; i++) {
      const counselor = createdCounselors[i];
      const firstAvailability = availabilityData.filter(
        (a) => a.counselorId.toString() === counselor._id.toString(),
      )[0];

      if (firstAvailability) {
        counselor.availability = firstAvailability._id;
        await counselor.save();
      }
    }

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📊 Seeded Data Summary:");
    console.log(`- Counselors: ${createdCounselors.length}`);
    console.log(`- Availability Slots: ${createdAvailability.length}`);
    console.log("\n👨‍💼 Counselors:");
    createdCounselors.forEach((c, idx) => {
      console.log(
        `${idx + 1}. ${c.fullName} - ${c.expertise.join(", ")} - $${c.hourlyRate}/hour`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
