const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});



exports.sendOtpMail = async ({ to, subject, text, otp }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[auth:otp] EMAIL_USER/EMAIL_PASSWORD is not configured. Dev OTP for ${to}: ${otp}`);
      return {
        sent: false,
        devOtp: otp,
        message: "Chưa cấu hình email nên hệ thống không gửi OTP qua Gmail. Dùng mã OTP thử nghiệm hiển thị bên dưới để tiếp tục.",
      };
    }
    const error = new Error("Chưa cấu hình EMAIL_USER/EMAIL_PASS hợp lệ trong backend/.env.");
    error.statusCode = 503;
    error.errorCode = "EMAIL_NOT_CONFIGURED";
    throw error;
  }

  try {
    await transporter.sendMail({ to, subject, text });
    return { sent: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    const err = new Error("Không gửi được email OTP. Vui lòng kiểm tra Gmail App Password, EMAIL_USER/EMAIL_PASS hoặc kết nối mạng.");
    err.statusCode = 502;
    err.errorCode = "EMAIL_SEND_FAILED";
    throw err;
  }
};

exports.sendBookingConfirmation = async (booking, counselor, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Confirmation - ${counselor.fullName}`,
      html: `
        <h2>Booking Confirmation</h2>
        <p>Hello ${user.fullName || "User"},</p>
        <p>Your booking with <strong>${counselor.fullName}</strong> has been confirmed.</p>
        <hr>
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Counselor:</strong> ${counselor.fullName}</li>
          <li><strong>Expertise:</strong> ${counselor.expertise.join(", ")}</li>
          <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(booking.endTime).toLocaleTimeString()}</li>
          <li><strong>Type:</strong> ${booking.meetingType}</li>
          ${booking.meetingType === "online" ? `<li><strong>Meeting Link:</strong> ${booking.meetingLink}</li>` : ""}
          ${booking.meetingType === "in-person" ? `<li><strong>Location:</strong> ${booking.location}</li>` : ""}
        </ul>
        <hr>
        <p>If you need to reschedule or cancel, please notify us at least 24 hours before the appointment.</p>
        <p>Best regards,<br>Student Consulting Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent to", user.email);
  } catch (error) {
    console.error("Error sending booking confirmation:", error);
  }
};

// Send booking cancellation email
exports.sendCancellationEmail = async (booking, counselor, user, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Booking Cancelled - ${counselor.fullName}`,
      html: `
        <h2>Booking Cancellation</h2>
        <p>Hello ${user.fullName || "User"},</p>
        <p>Your booking with <strong>${counselor.fullName}</strong> has been cancelled.</p>
        <hr>
        <h3>Cancelled Booking Details:</h3>
        <ul>
          <li><strong>Counselor:</strong> ${counselor.fullName}</li>
          <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()}</li>
          ${reason ? `<li><strong>Reason:</strong> ${reason}</li>` : ""}
        </ul>
        <hr>
        <p>You can book another appointment at any time through our platform.</p>
        <p>Best regards,<br>Student Consulting Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Cancellation email sent to", user.email);
  } catch (error) {
    console.error("Error sending cancellation email:", error);
  }
};

// Send booking reminder email
exports.sendBookingReminder = async (booking, counselor, user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Reminder: Your Appointment with ${counselor.fullName}`,
      html: `
        <h2>Appointment Reminder</h2>
        <p>Hello ${user.fullName || "User"},</p>
        <p>This is a reminder about your upcoming appointment.</p>
        <hr>
        <h3>Appointment Details:</h3>
        <ul>
          <li><strong>Counselor:</strong> ${counselor.fullName}</li>
          <li><strong>Date:</strong> ${new Date(booking.startTime).toLocaleDateString()}</li>
          <li><strong>Time:</strong> ${new Date(booking.startTime).toLocaleTimeString()}</li>
          <li><strong>Type:</strong> ${booking.meetingType}</li>
          ${booking.meetingType === "online" ? `<li><strong>Meeting Link:</strong> ${booking.meetingLink}</li>` : ""}
        </ul>
        <hr>
        <p>Best regards,<br>Student Consulting Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Reminder email sent to", user.email);
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
};

// Send availability update email to counselor
exports.sendAvailabilityUpdateEmail = async (counselor, message) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: counselor.userId.email,
      subject: "Your Availability Has Been Updated",
      html: `
        <h2>Availability Update</h2>
        <p>Hello ${counselor.fullName},</p>
        <p>${message}</p>
        <p>Log in to your dashboard to view and manage your bookings.</p>
        <hr>
        <p>Best regards,<br>Student Consulting Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Availability update email sent to counselor");
  } catch (error) {
    console.error("Error sending availability update email:", error);
  }
};
