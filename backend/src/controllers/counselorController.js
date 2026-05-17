const Counselor = require("../models/Counselor");
const Availability = require("../models/Availability");

// Get all counselors
exports.getAllCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find({ isActive: true })
      .populate("availability")
      .sort("-createdAt");
    res.json(counselors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counselor by ID
exports.getCounselorById = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id).populate(
      "availability",
    );
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }
    res.json(counselor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create counselor
exports.createCounselor = async (req, res) => {
  const { userId, fullName, expertise, bio, hourlyRate } = req.body;

  const counselor = new Counselor({
    userId,
    fullName,
    expertise,
    bio,
    hourlyRate,
  });

  try {
    const newCounselor = await counselor.save();
    res.status(201).json(newCounselor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update counselor
exports.updateCounselor = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    Object.assign(counselor, req.body);
    const updatedCounselor = await counselor.save();
    res.json(updatedCounselor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const counselorId = req.params.id; // ✅ Lấy counselorId từ URL path
    const { date } = req.query;        // ✅ Lấy date từ query string

    if (!counselorId || !date) {
      return res
        .status(400)
        .json({ message: "counselorId and date are required" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const availability = await Availability.findOne({
      counselorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability) {
      return res.json({ slots: [] }); 
    }

    // Check for blackout dates
    const isBlackout = availability.blackoutDates.some((bd) => {
      const blackoutDate = new Date(bd.date);
      return blackoutDate.toDateString() === selectedDate.toDateString();
    });

    if (isBlackout) {
      return res.json({ slots: [] });
    }

    // Generate time slots
    const slots = [];
    const [startHour, startMin] = availability.startTime.split(":");
    const [endHour, endMin] = availability.endTime.split(":");

    let currentTime = new Date(selectedDate);
    currentTime.setHours(parseInt(startHour), parseInt(startMin), 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    while (currentTime < endTime) {
      slots.push(new Date(currentTime));
      currentTime = new Date(
        currentTime.getTime() + availability.slotDuration * 60000,
      );
    }

    res.json({ slots });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
